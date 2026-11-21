import type { CritterV2 } from "@critter-crumbs/core";
import { portraitMetrics } from "./metrics.js";
import { palette } from "./colour.js";
import { tokens } from "../styles/tokens.js";
import { rememberPortrait, type PortraitOptions } from "./index.js";

type Attributes = Record<string, string | number | null | undefined>;
type Tone = { base: string; shadow: string; light: string; soft: string };
type Ellipse = { cx: number; cy: number; rx: number; ry: number };
export type PortraitLook = {
  line: string;
  lineW: number;
  shading: "paint" | "flat";
  hatch: boolean;
  grain: boolean;
  cream: string;
  tones: readonly Tone[];
  element?: boolean;
};
type DrawState = { size?: number; delighted?: boolean; fed?: number; asleep?: boolean };
export const inkedPortraitLook: PortraitLook = {
  line: tokens.burrow,
  lineW: tokens["portrait-line-width"],
  shading: "paint",
  hatch: true,
  grain: true,
  cream: tokens["portrait-cream"],
  tones: [
    {
      base: tokens["portrait-tone-0-base"],
      shadow: tokens["portrait-tone-0-shadow"],
      light: tokens["portrait-tone-0-light"],
      soft: tokens["portrait-tone-0-soft"],
    },
    {
      base: tokens["portrait-tone-1-base"],
      shadow: tokens["portrait-tone-1-shadow"],
      light: tokens["portrait-tone-1-light"],
      soft: tokens["portrait-tone-1-soft"],
    },
    {
      base: tokens["portrait-tone-2-base"],
      shadow: tokens["portrait-tone-2-shadow"],
      light: tokens["portrait-tone-2-light"],
      soft: tokens["portrait-tone-2-soft"],
    },
  ],
};
const ELEMENT = {
  earth: {
    base: tokens["element-earth-base"],
    shadow: tokens["element-earth-shadow"],
    light: tokens["element-earth-light"],
    soft: tokens["element-earth-soft"],
  },
  water: {
    base: tokens["element-water-base"],
    shadow: tokens["element-water-shadow"],
    light: tokens["element-water-light"],
    soft: tokens["element-water-soft"],
  },
  fire: {
    base: tokens["element-fire-base"],
    shadow: tokens["element-fire-shadow"],
    light: tokens["element-fire-light"],
    soft: tokens["element-fire-soft"],
  },
  air: {
    base: tokens["element-air-base"],
    shadow: tokens["element-air-shadow"],
    light: tokens["element-air-light"],
    soft: tokens["element-air-soft"],
  },
};
const paintDefinitions = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="loose" x="-15%" y="-15%" width="130%" height="130%">
    <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="11" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="loose2" x="-15%" y="-15%" width="130%" height="130%">
    <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="29" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="fur" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 .14  0 0 0 0 .11  0 0 0 0 .15  0 0 0 .16 0" result="g"/>
    <feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/>
    <feBlend in="SourceGraphic" in2="gi" mode="multiply"/>
    </filter>
    <filter id="poster" color-interpolation-filters="sRGB"><feComponentTransfer>
    <feFuncR type="discrete" tableValues="0 .2 .4 .6 .8 1"/>
    <feFuncG type="discrete" tableValues="0 .2 .4 .6 .8 1"/>
    <feFuncB type="discrete" tableValues="0 .2 .4 .6 .8 1"/></feComponentTransfer></filter>
    <pattern id="strokes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
    <path d="M0 3.5 H4.6" stroke="${tokens.burrow}" stroke-width="1.7" stroke-linecap="round" opacity=".28"/>
    </pattern>
    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 0 L0 4" stroke="${tokens.burrow}" stroke-width="1.1" opacity=".5"/></pattern>
</defs></svg>`;
let serial = 0;
const FOOT = 140,
  CENTER = 60,
  BOX_H = 150;
function mix(a: string, b: string, amount: number) {
  const rgb = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const A = rgb(a),
    B = rgb(b);
  return (
    "#" +
    A.map((v, i) =>
      Math.round(v + (B[i]! - v) * amount)
        .toString(16)
        .padStart(2, "0")
    ).join("")
  );
}
export function paintV2(
  document: Document,
  params: CritterV2,
  state: PortraitOptions & { delighted?: boolean },
  look: PortraitLook = inkedPortraitLook
): SVGSVGElement {
  function s<K extends keyof SVGElementTagNameMap>(
    tag: K,
    attrs: Attributes = {},
    parent?: SVGElement
  ): SVGElementTagNameMap[K] {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attrs))
      if (value !== null && value !== undefined) node.setAttribute(key, String(value));
    parent?.append(node);
    return node;
  }
  function paintedFill(defs: SVGElement, id: string, tone: Tone) {
    const grad = s(
      "radialGradient",
      { id: `${id}-g${++serial}`, cx: 0.34, cy: 0.28, r: 0.95 },
      defs
    );
    s("stop", { offset: 0, "stop-color": tone.light }, grad);
    s("stop", { offset: 0.46, "stop-color": tone.base }, grad);
    s("stop", { offset: 1, "stop-color": tone.shadow }, grad);
    return `url(#${grad.id})`;
  }
  function shaded(
    parent: SVGElement,
    defs: SVGElement,
    id: string,
    e: Ellipse,
    tone: Tone,
    st: PortraitLook,
    strokeWidth: number,
    extra: Attributes = {}
  ) {
    const fill = st.shading === "paint" ? paintedFill(defs, id, tone) : tone.base;
    s("ellipse", { ...e, fill, ...extra }, parent);
    const clip = s("clipPath", { id: `${id}-c${++serial}` }, defs);
    s("ellipse", e, clip);
    const inner = s("g", { "clip-path": `url(#${clip.id})`, ...extra }, parent);
    if (st.shading === "flat") {
      s(
        "ellipse",
        {
          cx: e.cx + e.rx * 0.42,
          cy: e.cy + e.ry * 0.5,
          rx: e.rx * 1.05,
          ry: e.ry,
          fill: tone.shadow,
        },
        inner
      );
    } else {
      const crescent = s("clipPath", { id: `${id}-k${++serial}` }, defs);
      s(
        "ellipse",
        { cx: e.cx + e.rx * 0.5, cy: e.cy + e.ry * 0.58, rx: e.rx * 1.02, ry: e.ry * 0.98 },
        crescent
      );
      const cel = s("g", { "clip-path": `url(#${crescent.id})` }, inner);
      s(
        "rect",
        {
          x: e.cx - e.rx * 1.2,
          y: e.cy - e.ry * 1.2,
          width: e.rx * 2.4,
          height: e.ry * 2.4,
          fill: tone.shadow,
          opacity: 0.5,
        },
        cel
      );
      s(
        "rect",
        {
          x: e.cx - e.rx * 1.2,
          y: e.cy - e.ry * 1.2,
          width: e.rx * 2.4,
          height: e.ry * 2.4,
          fill: st.hatch ? "url(#hatch)" : "url(#strokes)",
        },
        cel
      );
    }
    s(
      "ellipse",
      {
        ...e,
        fill: "none",
        stroke: st.line,
        "stroke-width": strokeWidth * 0.55,
        opacity: 0.32,
        filter: "url(#loose2)",
        transform: `${extra.transform ?? ""} translate(1.2 .8)`,
      },
      parent
    );
    s(
      "ellipse",
      {
        ...e,
        fill: "none",
        stroke: st.line,
        "stroke-width": strokeWidth,
        opacity: 0.9,
        filter: "url(#loose)",
        ...extra,
      },
      parent
    );
  }
  function paint(
    params: CritterV2,
    st: PortraitLook,
    { size = 0, delighted = false, fed = 0, asleep = false }: DrawState = {}
  ) {
    const el = ELEMENT[params.element],
      id = `pc${++serial}`;
    const own = palette(params).body.css;
    const base = st.element
      ? { base: el.light, shadow: el.base, light: el.soft, soft: el.soft }
      : st.tones[Math.floor(params.idlePhase * 3) % 3]!;
    const PAGE = tokens.oat,
      LINE = st.line,
      PEACH = tokens["portrait-cheek"],
      EYE = tokens["portrait-eye"],
      lw = st.lineW;
    /* the critter's own colour, softened toward the look's cream: lights warm, shadows cool (Appendix A) */
    const softened = mix(own, st.cream, 0.55);
    const tone = st.element
      ? base
      : {
          base: mix(softened, base.base, 0.25),
          shadow: mix(mix(own, LINE, 0.3), base.shadow, 0.3),
          light: mix(softened, tokens["portrait-light"], 0.45),
          soft: base.soft,
        };
    const svg = s("svg", {
      viewBox: `0 0 120 ${BOX_H}`,
      class: `critter${delighted ? " delighted" : ""}${asleep ? " asleep" : ""}`,
      "aria-hidden": "true",
    });
    if (size) svg.style.width = `${size}px`;
    svg.style.setProperty("--head-tilt", `${params.headTilt}deg`);
    svg.style.setProperty("--cheeks", delighted || params.cheeks ? "1" : "0");
    svg.style.setProperty("--mouth", delighted ? "1" : "0");
    svg.style.setProperty("--d", `${(params.idlePhase * 5).toFixed(2)}s`);
    const defs = s("defs", {}, svg);
    const { R, W, H, Rt, bodyY, headY, earLength, fit, extent } = portraitMetrics(params, fed);
    for (const [key, value] of Object.entries(extent))
      svg.dataset[key === "headY" ? "hy" : key === "headRadius" ? "hr" : key] = value.toFixed(3);
    s(
      "ellipse",
      { cx: CENTER, cy: FOOT + 2, rx: W * 1.3 * fit, ry: 4.5, fill: LINE, opacity: 0.14 },
      svg
    );
    const fitGroup = s(
      "g",
      {
        transform:
          fit < 1
            ? `translate(${CENTER} ${FOOT}) scale(${fit.toFixed(4)}) translate(${-CENTER} ${-FOOT})`
            : null,
      },
      svg
    );
    const figure = s("g", { class: "portrait__figure" }, fitGroup);
    const body = s(
      "g",
      {
        transform: fed
          ? `translate(${CENTER} ${FOOT}) scale(${(1 + 0.2 * fed).toFixed(3)}) translate(${-CENTER} ${-FOOT})`
          : null,
      },
      figure
    );
    const tx = CENTER + W * 0.9,
      ty = bodyY + H * 0.3;
    const tails: Record<string, () => unknown> = {
      puff: () =>
        shaded(
          body,
          defs,
          id,
          { cx: CENTER + W * 0.95, cy: bodyY + H * 0.45, rx: Rt * 0.46, ry: Rt * 0.42 },
          tone,
          st,
          lw * 0.8
        ),
      stub: () =>
        shaded(
          body,
          defs,
          id,
          { cx: CENTER + W * 1.02, cy: bodyY + H * 0.5, rx: Rt * 0.5, ry: Rt * 0.26 },
          tone,
          st,
          lw * 0.75
        ),
      branch: () => {
        s(
          "path",
          {
            d: `M${tx} ${ty} q${Rt * 0.9} ${-Rt * 0.2} ${Rt * 1.3} ${-Rt * 1.4}`,
            fill: "none",
            stroke: tone.shadow,
            "stroke-width": Rt * 0.14,
            "stroke-linecap": "round",
          },
          body
        );
        for (const [dx, dy, sz, turn] of [
          [0.5, -0.3, 0.34, -35],
          [1.0, -0.8, 0.3, -60],
          [1.25, -1.35, 0.26, -80],
        ] as const)
          s(
            "ellipse",
            {
              cx: tx + dx * Rt,
              cy: ty + dy * Rt,
              rx: sz * Rt,
              ry: sz * Rt * 0.55,
              transform: `rotate(${turn} ${tx + dx * Rt} ${ty + dy * Rt})`,
              fill: el.base,
              stroke: LINE,
              "stroke-width": lw * 0.6,
              filter: "url(#loose)",
            },
            body
          );
      },
      tadpole: () => {
        s(
          "path",
          {
            d: `M${tx - Rt * 0.2} ${ty - Rt * 0.15} q${Rt * 1.1} ${-Rt * 0.1} ${Rt * 1.5} ${-Rt * 0.9} q${-Rt * 0.2} ${Rt * 0.7} ${-Rt * 1.2} ${Rt * 1.15} z`,
            fill: tone.base,
            stroke: LINE,
            "stroke-width": lw * 0.7,
            filter: "url(#loose)",
          },
          body
        );
        s("circle", { cx: tx + Rt * 1.2, cy: ty - Rt * 0.85, r: Rt * 0.14, fill: el.light }, body);
      },
      spark: () => {
        for (const [dx, dy, sz] of [
          [0.45, -0.5, 0.2],
          [0.85, -1.0, 0.16],
          [1.15, -1.55, 0.12],
        ] as const)
          s(
            "circle",
            {
              cx: tx + dx * Rt,
              cy: ty + dy * Rt,
              r: sz * Rt,
              fill: el.light,
              stroke: el.base,
              "stroke-width": 0.8,
            },
            body
          );
      },
      emberwisp: () => {
        s(
          "path",
          {
            d: `M${tx - Rt * 0.2} ${ty - Rt * 0.1} q${Rt * 0.9} ${-Rt * 0.4} ${Rt * 1.1} ${-Rt * 1.4} q${-Rt * 0.05} ${Rt * 0.8} ${-Rt * 0.8} ${Rt * 1.25} z`,
            fill: tone.base,
            stroke: LINE,
            "stroke-width": lw * 0.7,
            filter: "url(#loose)",
          },
          body
        );
        s(
          "circle",
          {
            cx: tx + Rt * 0.9,
            cy: ty - Rt * 1.45,
            r: Rt * 0.17,
            fill: el.light,
            stroke: el.base,
            "stroke-width": 0.8,
          },
          body
        );
      },
      cloudwisp: () => {
        for (const [dx, dy, sz] of [
          [0.4, 0, 0.4],
          [0.95, -0.28, 0.3],
        ] as const)
          s(
            "circle",
            {
              cx: tx + dx * Rt,
              cy: ty + dy * Rt,
              r: sz * Rt,
              fill: tone.light,
              stroke: LINE,
              "stroke-width": lw * 0.6,
              filter: "url(#loose)",
            },
            body
          );
      },
      longwisp: () =>
        s(
          "path",
          {
            d:
              `M${tx - Rt * 0.2} ${ty} q${Rt * 1.2} ${-Rt * 0.1} ${Rt * 1.7} ${-Rt * 0.8} ` +
              `q${Rt * 0.15} ${-Rt * 0.45} ${Rt * 0.45} ${-Rt * 0.8} q${-Rt * 0.6} ${Rt * 0.9} ` +
              `${-Rt * 1.95} ${Rt * 1.75} z`,
            fill: tone.light,
            stroke: LINE,
            "stroke-width": lw * 0.65,
            filter: "url(#loose)",
          },
          body
        ),
    };
    tails[params.tailType]?.();
    const furGroup = s("g", { filter: st.grain ? "url(#fur)" : null }, body);
    shaded(furGroup, defs, id, { cx: CENTER, cy: bodyY, rx: W, ry: H }, tone, st, lw);
    const belly = params.markings === "belly" ? mix(tone.soft, el.light, 0.45) : tone.soft;
    s(
      "ellipse",
      {
        cx: CENTER + W * 0.05,
        cy: bodyY + H * 0.32,
        rx: W * 0.56,
        ry: H * 0.52,
        fill: belly,
        opacity: 0.9,
      },
      body
    );
    if (["moss", "dew", "sky"].includes(params.markings))
      for (const [x, y, r] of [
        [-0.52, -0.18, 0.17],
        [0.44, 0.06, 0.14],
        [-0.3, 0.5, 0.11],
      ] as const)
        s(
          "ellipse",
          {
            cx: CENTER + x * W,
            cy: bodyY + y * H,
            rx: W * r,
            ry: H * r * 0.7,
            fill: el.light,
            opacity: 0.78,
          },
          body
        );
    /* one soft glow point: chest, throat or brow */
    const glowAt =
      params.spot === "throat"
        ? [CENTER, bodyY - H * 0.55]
        : params.spot === "brow"
          ? null
          : [CENTER + W * 0.05, bodyY + H * 0.05];
    if (glowAt) {
      const glow = s("radialGradient", { id: `${id}-w${++serial}` }, defs);
      s("stop", { offset: 0, "stop-color": params.glow, "stop-opacity": 0.75 }, glow);
      s("stop", { offset: 1, "stop-color": params.glow, "stop-opacity": 0 }, glow);
      s("circle", { cx: glowAt[0], cy: glowAt[1], r: W * 0.42, fill: `url(#${glow.id})` }, body);
    }
    /* front paws on the belly, and slightly oversized feet */
    for (const side of [-1, 1])
      shaded(
        body,
        defs,
        id,
        { cx: CENTER + side * W * 0.6, cy: bodyY + H * 0.1, rx: R * 0.24, ry: R * 0.32 },
        tone,
        st,
        lw * 0.75,
        { transform: `rotate(${side * -22} ${CENTER + side * W * 0.6} ${bodyY + H * 0.1})` }
      );
    for (const side of [-1, 1]) {
      s(
        "ellipse",
        {
          cx: CENTER + side * W * 0.46,
          cy: FOOT - 3.5,
          rx: W * 0.36,
          ry: W * 0.21,
          fill: tone.base,
          stroke: LINE,
          "stroke-width": lw * 0.8,
          filter: "url(#loose)",
        },
        body
      );
      s(
        "ellipse",
        {
          cx: CENTER + side * W * 0.46,
          cy: FOOT - 3,
          rx: W * 0.2,
          ry: W * 0.1,
          fill: mix(tone.base, tone.shadow, 0.35),
        },
        body
      );
    }
    const headAnchor = s("g", { transform: `translate(${CENTER} ${headY})` }, body);
    const head = s(
      "g",
      { class: "portrait__head", transform: `rotate(${params.headTilt})` },
      headAnchor
    );
    for (const side of [-1, 1]) {
      const earAnchor = s("g", { transform: `translate(${side * R * 0.64} ${-R * 0.62})` }, head);
      const anchor = s(
        "g",
        {
          class: `portrait__ear portrait__ear--${side < 0 ? "l" : "r"}`,
          style: `--ear-base:${side * params.earSpread}deg`,
        },
        earAnchor
      );
      const w = earLength * 0.46,
        L = earLength * 0.95;
      const shapes: Record<string, string> = {
        pointed: `M${-w} 0 Q${-w * 0.8} ${-L * 0.55} 0 ${-L} Q${w * 0.8} ${-L * 0.55} ${w} 0 Z`,
        tufts: `M${-w} 0 L${-w * 0.8} ${-L * 0.65} L${-w * 0.15} ${-L * 0.5} L0 ${-L} L${w * 0.35} ${-L * 0.55} L${w} ${-L * 0.7} L${w} 0 Z`,
        leaf: `M0 0 C${-w * 1.3} ${-L * 0.35} ${-w * 0.7} ${-L * 0.8} 0 ${-L} C${w * 0.7} ${-L * 0.8} ${w * 1.3} ${-L * 0.35} 0 0 Z`,
        fin: `M${-w * 0.9} 0 C${-w * 0.6} ${-L * 0.5} ${w * 0.1} ${-L * 0.9} ${w * 0.7} ${-L} C${w * 0.5} ${-L * 0.6} ${w * 0.8} ${-L * 0.25} ${w} 0 Z`,
        flame: (
          [
            [-w * 0.55, 0.7],
            [0, 1],
            [w * 0.55, 0.75],
          ] as const
        )
          .map(
            ([dx, hh]) =>
              `M${dx - w * 0.4} 0 C${dx - w * 0.45} ${-L * hh * 0.5} ${dx - w * 0.1} ` +
              `${-L * hh * 0.7} ${dx} ${-L * hh} C${dx + w * 0.1} ${-L * hh * 0.7} ` +
              `${dx + w * 0.45} ${-L * hh * 0.5} ${dx + w * 0.4} 0 Z`
          )
          .join(" "),
        cloud: (
          [
            [0, -L * 0.42, L * 0.42],
            [w * 0.55, -L * 0.78, L * 0.28],
          ] as const
        )
          .map(
            ([cx, cy, sz]) =>
              `M${cx - sz} ${cy} a${sz} ${sz} 0 1 0 ${2 * sz} 0 a${sz} ${sz} 0 1 0 ${-2 * sz} 0`
          )
          .join(" "),
        fern:
          `M${-w * 0.45} 0 C${-w * 0.7} ${-L * 0.45} ${-w * 0.35} ${-L * 0.85} ${w * 0.15} ` +
          `${-L * 0.95} C${w * 0.75} ${-L * 1.02} ${w * 0.8} ${-L * 0.62} ${w * 0.3} ` +
          `${-L * 0.62} C${w * 0.05} ${-L * 0.62} ${w * 0.05} ${-L * 0.78} ${w * 0.25} ` +
          `${-L * 0.78} C${w * 0.1} ${-L * 0.55} ${w * 0.45} ${-L * 0.3} ${w * 0.45} 0 Z`,
      };
      const d =
        shapes[params.earType] ??
        `M${-w} 0 C${-w * 1.4} ${-L * 0.7} ${-w * 0.7} ${-L} 0 ${-L} C${w * 0.9} ${-L} ${w * 1.3} ${-L * 0.6} ${w} 0 Z`;
      const mirror = side < 0 ? s("g", { transform: "scale(-1 1)" }, anchor) : anchor;
      s(
        "path",
        {
          d,
          fill: tone.base,
          stroke: LINE,
          "stroke-width": lw * 0.8,
          "stroke-linejoin": "round",
          filter: "url(#loose)",
        },
        mirror
      );
      s(
        "path",
        { d, fill: mix(el.soft, el.light, 0.35), opacity: 0.9, transform: "scale(.56 .68)" },
        mirror
      );
    }
    shaded(
      head,
      defs,
      id,
      {
        cx: 0,
        cy: 0,
        rx: R,
        ry: R * (params.headShape === "egg" ? 1.12 : params.headShape === "squarish" ? 0.95 : 1),
      },
      tone,
      st,
      lw
    );
    const top = -R * (params.headShape === "egg" ? 1.12 : 0.98);
    const crests: Record<string, () => unknown> = {
      sapling: () => {
        s(
          "rect",
          {
            x: -R * 0.05,
            y: top - R * 0.5,
            width: R * 0.1,
            height: R * 0.58,
            rx: R * 0.05,
            fill: el.shadow,
          },
          head
        );
        for (const [cx, cy, turn] of [
          [-R * 0.24, top - R * 0.5, -28],
          [R * 0.24, top - R * 0.36, 24],
        ] as const) {
          s(
            "ellipse",
            {
              cx,
              cy,
              rx: R * 0.26,
              ry: R * 0.13,
              transform: `rotate(${turn} ${cx} ${cy})`,
              fill: el.base,
              stroke: LINE,
              "stroke-width": lw * 0.55,
              filter: "url(#loose)",
            },
            head
          );
          s(
            "ellipse",
            {
              cx: cx - R * 0.06,
              cy: cy - R * 0.04,
              rx: R * 0.12,
              ry: R * 0.05,
              transform: `rotate(${turn} ${cx} ${cy})`,
              fill: el.light,
            },
            head
          );
        }
      },
      droplet: () => {
        s(
          "path",
          {
            d:
              `M0 ${top - R * 0.72} C${R * 0.27} ${top - R * 0.35} ${R * 0.24} ` +
              `${top + R * 0.06} 0 ${top + R * 0.06} C${-R * 0.24} ${top + R * 0.06} ` +
              `${-R * 0.27} ${top - R * 0.35} 0 ${top - R * 0.72} Z`,
            fill: el.base,
            stroke: LINE,
            "stroke-width": lw * 0.6,
            filter: "url(#loose)",
          },
          head
        );
        s("circle", { cx: -R * 0.07, cy: top - R * 0.3, r: R * 0.07, fill: el.light }, head);
      },
      reed: () => {
        s(
          "rect",
          {
            x: -R * 0.04,
            y: top - R * 0.8,
            width: R * 0.08,
            height: R * 0.85,
            rx: R * 0.04,
            fill: el.shadow,
          },
          head
        );
        s(
          "ellipse",
          {
            cx: 0,
            cy: top - R * 0.78,
            rx: R * 0.1,
            ry: R * 0.2,
            fill: el.base,
            stroke: LINE,
            "stroke-width": lw * 0.5,
          },
          head
        );
      },
      ember: () => {
        s(
          "path",
          {
            d:
              `M${-R * 0.17} ${top + R * 0.05} C${-R * 0.22} ${top - R * 0.3} ${-R * 0.02} ` +
              `${top - R * 0.45} ${R * 0.05} ${top - R * 0.78} C${R * 0.13} ${top - R * 0.4} ` +
              `${R * 0.27} ${top - R * 0.25} ${R * 0.19} ${top + R * 0.05} Z`,
            fill: el.base,
            stroke: LINE,
            "stroke-width": lw * 0.6,
            filter: "url(#loose)",
          },
          head
        );
        s(
          "path",
          {
            d:
              `M${-R * 0.07} ${top + R * 0.02} C${-R * 0.09} ${top - R * 0.2} ${R * 0.02} ` +
              `${top - R * 0.3} ${R * 0.04} ${top - R * 0.5} C${R * 0.07} ${top - R * 0.25} ` +
              `${R * 0.12} ${top - R * 0.15} ${R * 0.09} ${top + R * 0.02} Z`,
            fill: el.light,
          },
          head
        );
      },
      seedpods: () => {
        for (const dx of [-0.3, 0, 0.3]) {
          s(
            "circle",
            {
              cx: dx * R,
              cy: top - R * (dx === 0 ? 0.28 : 0.13),
              r: R * 0.16,
              fill: el.base,
              stroke: LINE,
              "stroke-width": lw * 0.5,
            },
            head
          );
          s(
            "circle",
            {
              cx: dx * R - R * 0.05,
              cy: top - R * (dx === 0 ? 0.33 : 0.18),
              r: R * 0.06,
              fill: el.light,
            },
            head
          );
        }
      },
    };
    crests[params.crest]?.();
    if (params.element === "air")
      for (const [dx, sz] of [
        [-0.12, 0.2],
        [0.14, 0.15],
      ] as const)
        s(
          "circle",
          {
            cx: dx * R,
            cy: top - R * 0.08,
            r: sz * R,
            fill: el.light,
            stroke: LINE,
            "stroke-width": lw * 0.5,
            filter: "url(#loose)",
          },
          head
        );
    if (params.markings !== "none")
      s(
        "ellipse",
        {
          cx: R * 0.14,
          cy: -R * 0.6,
          rx: R * 0.17,
          ry: R * 0.11,
          transform: `rotate(-12 ${R * 0.14} ${-R * 0.6})`,
          fill: el.light,
          opacity: 0.8,
        },
        head
      );
    if (params.spot === "brow") {
      const glow = s("radialGradient", { id: `${id}-b${++serial}` }, defs);
      s("stop", { offset: 0, "stop-color": params.glow, "stop-opacity": 0.8 }, glow);
      s("stop", { offset: 1, "stop-color": params.glow, "stop-opacity": 0 }, glow);
      s("circle", { cx: 0, cy: -R * 0.55, r: R * 0.4, fill: `url(#${glow.id})` }, head);
    }
    if (params.snout === "muzzle")
      s(
        "ellipse",
        {
          cx: R * 0.04,
          cy: R * 0.42,
          rx: R * 0.22,
          ry: R * 0.14,
          fill: tone.soft,
          stroke: LINE,
          "stroke-width": lw * 0.45,
          filter: "url(#loose)",
        },
        head
      );
    /* big round dark matte eyes, one small highlight; asleep, two closed lids */
    const eyeR = R * (0.24 + params.eyeSize * 0.8),
      spread = Math.min(1, Math.max(0, (params.eyeSpacing - 0.32) / 0.3));
    const ex = Math.max(eyeR + R * 0.1, R * (0.38 + 0.16 * spread)),
      ey = R * (-0.02 + (0.5 - params.eyeHeight) * 1.2);
    for (const side of [-1, 1]) {
      const eye = s("g", { transform: `translate(${side * ex} ${ey})` }, head);
      {
        s(
          "path",
          {
            d: `M${-eyeR * 0.78} ${eyeR * 0.05} Q0 ${eyeR * 0.62} ${eyeR * 0.78} ${eyeR * 0.05}`,
            fill: "none",
            stroke: LINE,
            "stroke-width": lw * 0.85,
            "stroke-linecap": "round",
            class: "portrait__sleep-eye",
          },
          eye
        );
      }
      const open = s("g", { class: "portrait__eye" }, eye);
      const clip = s("clipPath", { id: `${id}-e${++serial}` }, defs);
      s("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06 }, clip);
      s("ellipse", { cx: 0, cy: 0, rx: eyeR, ry: eyeR * 1.06, fill: EYE }, open);
      s(
        "ellipse",
        {
          cx: eyeR * 0.05,
          cy: eyeR * 0.5,
          rx: eyeR * 0.72,
          ry: eyeR * 0.42,
          fill: tokens["portrait-eye-shade"],
          opacity: 0.55,
          "clip-path": `url(#${clip.id})`,
        },
        open
      );
      s("circle", { cx: -eyeR * 0.34, cy: -eyeR * 0.38, r: eyeR * 0.2, fill: PAGE }, open);
      s(
        "ellipse",
        {
          cx: 0,
          cy: 0,
          rx: eyeR,
          ry: eyeR * 1.06,
          fill: "none",
          stroke: LINE,
          "stroke-width": lw * 0.5,
        },
        open
      );
    }
    for (const side of [-1, 1])
      s(
        "ellipse",
        {
          cx: side * R * 0.74,
          cy: R * 0.52,
          rx: R * 0.14,
          ry: R * 0.08,
          fill: PEACH,
          class: "portrait__cheek",
          style: params.cheeks ? "opacity:.5" : "",
        },
        head
      );
    if (params.snout === "button")
      s(
        "ellipse",
        { cx: R * 0.02, cy: R * 0.32, rx: R * 0.09, ry: R * 0.06, fill: tone.shadow },
        head
      );
    s(
      "path",
      {
        d: `M${-R * 0.1} ${R * 0.52} Q0 ${R * 0.58} ${R * 0.1} ${R * 0.52}`,
        fill: "none",
        stroke: LINE,
        "stroke-width": lw * 0.6,
        "stroke-linecap": "round",
        class: "p-calm",
      },
      head
    );
    s(
      "path",
      {
        d: `M${-R * 0.13} ${R * 0.5} Q0 ${R * 0.68} ${R * 0.13} ${R * 0.5}`,
        fill: "none",
        stroke: LINE,
        "stroke-width": lw * 0.65,
        "stroke-linecap": "round",
        class: "portrait__mouth",
      },
      head
    );
    rememberPortrait(svg, { headRadius: R, eyeRadius: eyeR });
    svg.dataset.asleep = String(asleep);
    svg.classList.add("portrait", "portrait-v2");
    return svg;
  }

  const svg = paint(params, look, {
    ...state,
    size: typeof state.size === "number" ? state.size : 0,
  });
  const source = new DOMParser().parseFromString(paintDefinitions, "image/svg+xml");
  const defs = document.importNode(source.documentElement.querySelector("defs")!, true);
  svg.prepend(defs);
  for (const node of svg.querySelectorAll("[id]")) {
    const previous = node.id;
    const next = `paint-${++serial}-${previous}`;
    node.id = next;
    for (const drawn of svg.querySelectorAll("*"))
      for (const attribute of Array.from(drawn.attributes))
        if (attribute.value.includes(`url(#${previous})`))
          drawn.setAttribute(
            attribute.name,
            attribute.value.replaceAll(`url(#${previous})`, `url(#${next})`)
          );
  }
  svg.dataset.version = params.version;
  svg.dataset.size = String(state.size ?? "stage");
  if (typeof state.size === "number") {
    svg.setAttribute("width", String(state.size));
    svg.setAttribute("height", String(state.size * 1.25));
  }
  if (state.decorative) {
    svg.setAttribute("aria-hidden", "true");
  } else {
    svg.removeAttribute("aria-hidden");
    svg.setAttribute("role", "img");
    s("title", {}, svg).textContent = state.name;
  }
  return svg;
}
