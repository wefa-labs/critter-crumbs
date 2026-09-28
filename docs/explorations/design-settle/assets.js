// Where the page finds the app's stylesheets, its font and the pictures. In the repository these
// are the app's own files; build-artifact.sh copies them beside the page and writes its own
// version of this module for the published Artifact.
const here = path => new URL(path, import.meta.url).href;
export const ASSETS = {
  appCss: here('../../../packages/app/src/styles/app.css'),
  portraitsCss: here('../../../packages/app/src/styles/portraits.css'),
  youngSerif: here('../../../packages/app/public/fonts/young-serif-latin.woff2'),
  arrival: {
    entrance: here('../../../packages/app/public/images/arrival.webp'),
    window: here('../../pitch/assets/scene-feast.webp'),
    dusk: here('../../pitch/assets/scene-dusk.webp'),
  },
  art: Object.fromEntries(['earth', 'water', 'fire', 'air'].map(element => [element, here(`../../pitch/assets/${element}.webp`)])),
};
