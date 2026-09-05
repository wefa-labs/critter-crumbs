/** Deterministic JSON text; unsupported or lossy JavaScript values are errors. */
export function canonicalJSON(value: unknown): string {
  const ancestors = new Set<object>();
  function encode(item: unknown): string {
    if (item === null) return 'null';
    if (typeof item === 'string' || typeof item === 'boolean') return JSON.stringify(item);
    if (typeof item === 'number' && Number.isFinite(item)) return JSON.stringify(item);
    if (typeof item !== 'object' || ancestors.has(item)) throw new TypeError('Invalid canonical JSON');
    const array = Array.isArray(item);
    if (!array && Object.getPrototypeOf(item) !== Object.prototype && Object.getPrototypeOf(item) !== null) {
      throw new TypeError('Canonical JSON requires plain objects');
    }
    if (Object.getOwnPropertySymbols(item).length) throw new TypeError('Canonical JSON cannot contain symbols');
    ancestors.add(item);
    try {
      if (array) {
        if (Object.getOwnPropertyNames(item).length !== item.length + 1) throw new TypeError('Canonical JSON cannot discard array properties');
        const entries: string[] = [];
        for (let i = 0; i < item.length; i++) {
          if (!Object.hasOwn(item, i)) throw new TypeError('Canonical JSON cannot contain holes');
          const descriptor = Object.getOwnPropertyDescriptor(item, i);
          if (!descriptor || !('value' in descriptor)) throw new TypeError('Canonical JSON cannot contain accessors');
          entries.push(encode(descriptor.value));
        }
        return `[${entries.join(',')}]`;
      }
      return `{${Object.keys(item).sort().map((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(item, key);
        if (!descriptor || !('value' in descriptor)) throw new TypeError('Canonical JSON cannot contain accessors');
        return `${JSON.stringify(key)}:${encode(descriptor.value)}`;
      }).join(',')}}`;
    } finally { ancestors.delete(item); }
  }
  return encode(value);
}
