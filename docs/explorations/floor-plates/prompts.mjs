// Writes the instruction for one take of one plate and prints the images to attach (see paint.sh). The words are the
// project's own plate prompts (docs/explorations/scatter-layouts/index.html: SCENE_STYLE, VIEW, PLATES) changed in one
// way: the back wall arches around the circle of critters instead of running straight across, because the circle's back
// row stands about 14 % down the phone's scene and 22 % down the desktop's (packages/app/src/game/layout.ts, geometry),
// where a straight wall a fifth of the scene tall would have critters standing on it.
// Usage: node prompts.mjs <work folder> <scene>:<device>:<take>[:plain] ...   ("plain" leaves the block-in out)
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const STYLE = 'Illustrated like a background painting from a hand-drawn animated series: confident ink outlines of varying weight, pen hatching in the shadows on bark and stone, flat colour blocking with hard-edged cel shadow shapes, a visible pencil underdrawing left in place beneath the colour, saturated natural colours. Environment art only: no people, no creatures, no animals, no characters, no text, no logos, no border and no frame.';

const DEVICES = {
  phone: {
    size: '1024 x 2048', shape: 'a tall portrait image, twice as tall as it is wide',
    curve: 'The camera is almost straight overhead, so the back wall is strongly foreshortened. In the middle of the width the wall is only a low band, a tenth of the image tall: the far edge of the floor there is a tenth of the way down from the top. From the middle that edge sweeps down towards both sides and meets the left and right edges of the frame about halfway down, so the wall and the roots fill the two upper corners like the shoulders of an arch. Everything inside that curve, and all of the lower half of the image, is floor.',
    props: 'Every prop is small and stands against the wall inside the top fifth of the image; nothing stands on the open floor.',
    foot: 'The bottom third of the image is plain floor.',
  },
  desktop: {
    size: '1536 x 1024', shape: 'a landscape image, three wide by two tall',
    curve: 'The camera is high overhead, so the back wall is foreshortened. In the middle of the width the wall is a band a sixth of the image tall: the far edge of the floor there is a sixth of the way down from the top. From the middle that edge sweeps down towards both sides and meets the left and right edges of the frame about two thirds of the way down, so the wall and the roots fill the two upper corners like the shoulders of an arch. Everything inside that curve, and all of the lower third of the image, is floor.',
    props: 'Every prop stands against the wall inside the top quarter of the image and within the middle three quarters of the width; nothing stands on the open floor.',
    foot: 'The bottom quarter of the image is plain floor.',
  },
};

const SCENES = {
  window: {
    keep: 'its warm sunlight from the upper left, and its exact colours: cream stone, warm brown roots, an orange cushion, cool blue-grey shadows, a bright blue sky',
    place: 'the inside of a burrow under the roots of an old tree, by day: a round chamber',
    wall: 'The curved back wall is cream stone blocks laced with twisting brown roots, and thick roots run down both sides of the frame. In the middle of the wall is the small round opening onto bright blue sky, whole and inside the low band of wall, with two or three shallow stone steps under it. To the right, against the wall: the small low wooden table with the bowl of bread rolls and two clay bowls, the orange cushion at its foot and the clay jar beside it. To the left, against the wall: a stone shelf with two candles, and moss at the foot of the wall.',
    floor: 'The floor is big pale cream flagstones with thin cool blue-grey joints and a little moss in the joints near the walls. It is open, flat and evenly lit from wall to wall, drawn in large simple shapes with little detail and nothing standing on it, and no strong shadows fall across it, so small characters and their name labels read clearly on it. A soft pool of sunlight lies across the middle.',
  },
  dusk: {
    keep: 'its dusk light, and its exact colours: deep teal-blue stone, a mossy olive trunk, a warm gold glow from the round window and the lantern, yellow-green grass, a red-brown clay bowl',
    place: 'the inside of the burrow at dusk: a round chamber',
    wall: 'The curved back wall is teal-blue stone blocks. The mossy tree trunk and its roots run down the left side of the frame, and darker stone down the right side. Right of the middle of the wall is the small round window glowing warm gold, whole and inside the low band of wall. Further right, against the wall: the small low wooden bench with the lantern and the red-brown clay bowl on it, and tufts of grass at its feet.',
    floor: 'The floor is big blue-teal flagstones with thin darker joints and a little grass in the joints near the walls. It is open, flat and evenly lit from wall to wall, drawn in large simple shapes with little detail and nothing standing on it, and no strong shadows fall across it, so small characters and their name labels read clearly on it. A soft warm pool of light from the lantern and the window lies across the middle.',
  },
};

const view = device => `Repaint the same place as a game background: ${device.shape}, looking down into the room like the play area of a cosy top-down life-sim game. ${device.curve} ${device.foot}`;

function prompt(sceneId, deviceId, take, guided) {
  const scene = SCENES[sceneId], device = DEVICES[deviceId], out = `out/${sceneId}-${deviceId}-${take}.png`;
  const attached = guided
    ? `Two images are attached. The first is a finished painting: it is the reference for the place, its things, its colours and the hand it is painted in. The second is a rough block-in of the new picture's layout, not artwork: flat shapes that show how large the wall, the roots, the round window and each prop are and exactly where they go, and how much of the picture is open floor. Keep every shape where the block-in puts it and no larger than it is drawn there, but paint a real place: none of the block-in's flat colour, blur or simple shapes may show.`
    : `The attached painting is the reference for the place, its things, its colours and the hand it is painted in.`;
  return `Use your image generation tool exactly once, with ${guided ? 'both attached images' : 'the attached painting'} as its reference${guided ? 's' : ''}, to paint the image described below. Then copy the generated PNG into this working directory as ${out}. Do not edit, create or delete any other file, and do not run any other command. Reply with the saved path and its pixel size.

Ask the image tool for ${device.shape} (${device.size}). If it cannot make that size, use the nearest shape it offers and say which.

Pass this description to the image tool as written:

${attached}

Keep the first painting's ink outlines of varying weight, the pen hatching in its shadows, its flat colour blocking with hard-edged cel shadow shapes, the visible pencil underdrawing beneath the colour, ${scene.keep}.

${view(device)}

The scene: ${scene.place}. ${scene.wall} ${device.props}

${scene.floor}

${STYLE}
`;
}

const [, , work, ...jobs] = process.argv;
await mkdir(join(work, 'prompts'), { recursive: true });
for (const job of jobs) {
  const [scene, device, take, mode] = job.split(':');
  if (!SCENES[scene] || !DEVICES[device] || !take) throw new Error(`Not a take: ${job}`);
  const guided = mode !== 'plain';
  await writeFile(join(work, 'prompts', `${scene}-${device}-${take}.txt`), prompt(scene, device, take, guided));
  console.log(`${scene}-${device}-${take}\trefs/${scene}.png${guided ? ` guides/${scene}-${device}.png` : ''}`);
}
