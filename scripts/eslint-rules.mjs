import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const copyIds = new Set([...readFileSync(path.join(root, 'packages/shared/src/copy.ts'), 'utf8').matchAll(/^\s*["']([^"']+)["']:/gm)].map(match => match[1]));
const programStates = new Set(['person', 'option', 'people', 'options', 'draft', 'gathering', 'scattering', 'feast', 'cancelled', 'void', 'open', 'extend', 'cancel']);
const htmlNames = new Set(['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'dangerouslySetInnerHTML']);
export const clockAdapters = new Set([
  'packages/api/src/clock.ts',
  'packages/app/src/sim/ticker-host.ts',
  'packages/core/src/api-client/clock-offset.ts',
]);
const structuralAttributes = new Set([
  'id', 'className', 'type', 'name', 'role', 'href', 'src', 'target', 'rel',
  'scope', 'htmlFor', 'autoComplete', 'autoCapitalize', 'inputMode', 'method', 'action', 'loading',
  'width', 'height', 'size', 'pattern', 'phase', 'viewBox', 'fill', 'stroke', 'd', 'tabIndex',
]);
const staticString = (node) => {
  if (typeof node?.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0].value.cooked;
  return undefined;
};
const propertyName = (node) => node.computed ? staticString(node.property) : node.property.name;
const relativeFile = (context) => path.relative(root, context.filename).split(path.sep).join('/');
const owner = (file) => /^packages\/(shared|core|app|api)(?=\/)/.exec(file)?.[1] ?? (file.startsWith('api/') ? 'functions' : null);
const definition = (message, create) => ({ meta: { type: 'problem', schema: [], messages: { forbidden: message } }, create });

export default {
  rules: {
    'no-html': definition('Render text and create elements; HTML injection is forbidden.', (context) => ({
      MemberExpression(node) {
        if (htmlNames.has(propertyName(node))) context.report({ node, messageId: 'forbidden' });
      },
      JSXAttribute(node) {
        if (htmlNames.has(node.name.name)) context.report({ node, messageId: 'forbidden' });
      },
      Property(node) {
        const name = node.computed ? node.key.value : node.key.name ?? node.key.value;
        if (htmlNames.has(name)) context.report({ node, messageId: 'forbidden' });
      },
    })),
    'time-as-input': definition('Pass time as an input; only the three named clock adapters may read a clock.', (context) => {
      if (clockAdapters.has(relativeFile(context))) return {};
      function inspect(node, name) {
        if (name === 'performance') {
          context.report({ node, messageId: 'forbidden' });
          return;
        }
        const parent = node.parent;
        if (parent.type === 'NewExpression' && parent.callee === node && parent.arguments.length > 0) return;
        if (parent.type === 'MemberExpression' && parent.object === node && ['parse', 'UTC'].includes(propertyName(parent))) return;
        context.report({ node, messageId: 'forbidden' });
      }
      return {
        Identifier(node) {
          if (!['Date', 'performance'].includes(node.name)) return;
          let scope = context.sourceCode.getScope(node);
          let variable;
          while (scope && !variable) { variable = scope.set.get(node.name); scope = scope.upper; }
          if (variable?.defs.length) return;
          if (node.parent.type === 'MemberExpression' && node.parent.property === node && !node.parent.computed) return;
          if (['TSTypeQuery', 'TSTypeReference'].includes(node.parent.type)) return;
          inspect(node, node.name);
        },
        MemberExpression(node) {
          if (['globalThis', 'window', 'global'].includes(node.object.name) && ['Date', 'performance'].includes(propertyName(node))) {
            inspect(node, propertyName(node));
          }
        },
      };
    }),
    'imports': definition('Use public package entries in the direction app → core → shared; api may import core and shared.', (context) => {
      const from = owner(relativeFile(context));
      if (!from) return {};
      const allowed = { shared: ['shared'], core: ['core', 'shared'], app: ['app', 'core', 'shared'], api: ['api', 'core', 'shared'], functions: ['api', 'core', 'shared'] };
      function check(node, value) {
        if (typeof value !== 'string') return;
        const match = /^@critter-crumbs\/(shared|core|app|api)(.*)$/.exec(value);
        if (match) {
          if (match[2] || !allowed[from].includes(match[1])) context.report({ node, messageId: 'forbidden' });
          return;
        }
        if (!value.startsWith('.') && !path.isAbsolute(value)) return;
        const target = path.relative(root, path.resolve(path.dirname(context.filename), value)).split(path.sep).join('/');
        const to = owner(target);
        if (to !== from) context.report({ node, messageId: 'forbidden' });
      }
      function checkStaticTarget(node, target) {
        const value = staticString(target);
        if (value === undefined) context.report({ node, messageId: 'forbidden' });
        else check(node, value);
      }
      return {
        ImportDeclaration: (node) => check(node, node.source.value),
        ExportNamedDeclaration: (node) => { if (node.source) check(node, node.source.value); },
        ExportAllDeclaration: (node) => check(node, node.source.value),
        ImportExpression: (node) => checkStaticTarget(node, node.source),
        CallExpression: (node) => { if (node.callee.name === 'require') {
          checkStaticTarget(node, node.arguments[0]);
        } },
        TSImportType: (node) => check(node, node.argument?.value ?? node.argument?.literal?.value),
        TSImportEqualsDeclaration: (node) => {
          if (node.moduleReference.type === 'TSExternalModuleReference') check(node, staticString(node.moduleReference.expression));
        },
      };
    }),
    'copy-ids': definition('Keep visible wording in packages/shared/src/copy.ts and use its copy IDs.', (context) => {

      function permitted(node) {
        const value = staticString(node);
        if (value !== undefined && (copyIds.has(value) || !/[\p{L}\p{N}]/u.test(value))) return true;
        if (node.type === 'TemplateLiteral' && node.quasis.every(part => !/[\p{L}\p{N}]/u.test(part.value.raw))) return true;
        let current = node;
        while (current.parent) {
          const parent = current.parent;
          if (parent.type === 'MemberExpression' && propertyName(parent) === 'includes' && parent.object === current && programStates.has(value)) return true;
          if (parent.type === 'BinaryExpression' && ['===', '!=='].includes(parent.operator)) return true;
          if (parent.type === 'BinaryExpression' && [parent.left, parent.right].some(side => side.type === 'MemberExpression' && propertyName(side) === 'key') && ['Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(value)) return true;
          if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(parent.type) && parent.source === current) return true;
          if (['TSLiteralType', 'TSImportType'].includes(parent.type)) return true;
          if (parent.type === 'ImportExpression' && parent.source === current) return true;
          if (parent.type === 'BinaryExpression' && ['===', '!=='].includes(parent.operator) && value?.startsWith('/')) return true;
          if (['CallExpression', 'NewExpression'].includes(parent.type)) {
            const callee = parent.callee.name ?? (parent.callee.type === 'MemberExpression' ? propertyName(parent.callee) : undefined);
            const argument = parent.arguments.indexOf(current);
            if (argument === 0 && programStates.has(value) && ['setAction', 'setKind'].includes(callee)) return true;
            if (argument === 0 && callee === 'useState' && ['people', 'options'].includes(value) && parent.typeArguments?.params?.[0]?.typeName?.name === 'FeastKind') return true;
            if (callee === 'includes' && programStates.has(value) && parent.callee.object === current) return true;
            if (callee === 'play' && argument === 0 && ['connect', 'reroll', 'ui.tap', 'crumb.add', 'crumb.remove', 'pour.hold', 'pour.reverse', 'pile.wall', 'pile.empty', 'statement.open', 'scatter.confirm', 'statements.reveal', 'feast.open', 'feast.feed', 'feast.settle', 'error'].includes(value)) return true;
            if (callee === 'scrollIntoView' && argument === 0) return true;
            if (callee === 'createPortrait' && argument === 2 && node.parent.type === 'Property' && node.parent.key.name === 'size' && value === 'stage') return true;
            if (callee === 'formatCopy' && argument === 0 && copyIds.has(value)) return true;
            if (['addEventListener', 'removeEventListener', 'PopStateEvent', 'getElementById', 'closest', 'querySelector', 'querySelectorAll', 'matchMedia', 'setProperty'].includes(callee) && argument === 0) return true;
            if (['get', 'write', 'navigate', 'endsWith'].includes(callee) && argument === 0 && (value?.startsWith('/') || node.type === 'TemplateLiteral' && node.quasis[0].value.raw.startsWith('/'))) return true;
            if (callee === 'useResource' && argument === 1 && (value?.startsWith('/') || node.type === 'TemplateLiteral' && node.quasis[0].value.raw.startsWith('/'))) return true;
            if (callee === 'write' && argument === 1 && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(value)) return true;
            if (callee === 'writeText' && argument === 0 && node.type === 'TemplateLiteral' && node.expressions[0]?.type === 'MemberExpression' && node.expressions[0].object.name === 'location' && node.expressions[0].property.name === 'origin') return true;
          }
          if (parent.type === 'Property' && parent.key === current && !parent.computed) return true;
          if (parent.type === 'MemberExpression' && parent.object.name === 'copy' && parent.property === current) return true;
          if (parent.type === 'CallExpression' && parent.callee.name === 'copy') return true;
          if (parent.type === 'JSXAttribute') {
            const name = parent.name.name;
            return structuralAttributes.has(name) || name?.startsWith('data-') || ['aria-hidden', 'aria-live', 'aria-atomic', 'aria-expanded', 'aria-controls', 'aria-describedby', 'aria-labelledby'].includes(name);
          }
          current = parent;
        }
        return false;
      }
      return {
        JSXText(node) { if (node.value.trim()) context.report({ node, messageId: 'forbidden' }); },
        Literal(node) {
          if (typeof node.value === 'string' && node.value.trim() && !permitted(node)) context.report({ node, messageId: 'forbidden' });
        },
        TemplateLiteral(node) {
          if (node.quasis.some((part) => part.value.raw.trim()) && !permitted(node)) context.report({ node, messageId: 'forbidden' });
        },
      };
    }),
  },
};
