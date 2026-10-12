#!/bin/sh
# Draws the rough block-in each plate is painted over: flat shapes for the wall, the roots, the round window and each
# prop, and the open floor. The floor's far edge follows the back of the circle the critters stand in
# (packages/app/src/game/layout.ts, geometry). The image tool paints the wall and the props about half as tall again as
# they are drawn here; the app raises a plate to suit (packages/app/src/game/plate.ts), so that is no fault.
# Needs ImageMagick 7 (`magick`). Writes to .scratch/floor-plates/guides.
work="$(git rev-parse --show-toplevel)/.scratch/floor-plates"
mkdir -p "$work/guides" && cd "$work" || exit 1
WALL='#a8997a'; FLOOR='#eadfbd'; ROOT='#6b4a2e'; STONE='#8a8272'; SKY='#6fb6e0'; WOOD='#9a6b3c'; CUSHION='#d8642c'; CANDLE='#f0d37a'
TEAL='#2f6f78'; TEALFLOOR='#3f8f8a'; GOLD='#f2cf4a'; MOSS='#6f7d3a'

# phone, 1024 x 2048: the floor's far edge is a tenth down in the middle and meets the sides about halfway down
magick -size 1024x2048 xc:"$WALL" \
  -fill "$FLOOR" -draw 'ellipse 512,1126 512,922 0,360' -draw 'rectangle 0,1126 1024,2048' \
  -fill "$ROOT" -draw 'polygon 0,0 150,0 110,260 70,520 30,800 0,980' -draw 'polygon 1024,0 874,0 914,260 954,520 994,800 1024,980' \
  -fill "$STONE" -draw 'circle 512,100 512,5' -fill "$SKY" -draw 'circle 512,100 512,30' \
  -fill '#c9c2ad' -draw 'rectangle 452,150 572,172' -draw 'rectangle 444,172 580,194' -draw 'rectangle 436,194 588,216' \
  -fill "$WOOD" -draw 'polygon 770,215 960,200 985,300 800,318' \
  -fill "$CUSHION" -draw 'ellipse 800,372 62,30 0,360' -fill '#a65f36' -draw 'ellipse 955,385 40,44 0,360' \
  -fill '#b9ad90' -draw 'rectangle 150,250 290,280' -fill "$CANDLE" -draw 'rectangle 180,205 198,250' -draw 'rectangle 232,215 250,250' \
  -blur 0x3 guides/window-phone.png

magick -size 1024x2048 xc:"$TEAL" \
  -fill "$TEALFLOOR" -draw 'ellipse 512,1126 512,922 0,360' -draw 'rectangle 0,1126 1024,2048' \
  -fill "$MOSS" -draw 'polygon 0,0 190,0 150,240 110,500 50,820 0,1000' \
  -fill '#24545c' -draw 'polygon 1024,0 900,0 930,300 980,640 1024,900' \
  -fill '#3d8c93' -draw 'circle 640,100 640,8' -fill "$GOLD" -draw 'circle 640,100 640,34' \
  -fill '#5d6b63' -draw 'polygon 770,235 965,220 990,300 800,318' \
  -fill "$CANDLE" -draw 'rectangle 850,165 885,235' -fill '#a8482c' -draw 'ellipse 935,222 34,18 0,360' \
  -fill 'rgba(244,220,122,0.3)' -draw 'ellipse 512,900 300,330 0,360' \
  -blur 0x8 guides/dusk-phone.png

# desktop, 1536 x 1024: the floor's far edge is a sixth down in the middle and meets the sides about two thirds down
magick -size 1536x1024 xc:"$WALL" \
  -fill "$FLOOR" -draw 'ellipse 768,686 768,512 0,360' -draw 'rectangle 0,686 1536,1024' \
  -fill "$ROOT" -draw 'polygon 0,0 230,0 170,200 100,420 40,600 0,700' -draw 'polygon 1536,0 1306,0 1366,200 1436,420 1496,600 1536,700' \
  -fill "$STONE" -draw 'circle 768,78 768,4' -fill "$SKY" -draw 'circle 768,78 768,22' \
  -fill '#c9c2ad' -draw 'rectangle 716,120 820,138' -draw 'rectangle 708,138 828,156' -draw 'rectangle 700,156 836,174' \
  -fill "$WOOD" -draw 'polygon 1085,128 1330,116 1352,204 1108,222' \
  -fill "$CUSHION" -draw 'ellipse 1130,262 58,26 0,360' -fill '#a65f36' -draw 'ellipse 1378,250 36,40 0,360' \
  -fill '#b9ad90' -draw 'rectangle 230,150 400,176' -fill "$CANDLE" -draw 'rectangle 268,108 284,150' -draw 'rectangle 322,116 338,150' \
  -blur 0x3 guides/window-desktop.png

magick -size 1536x1024 xc:"$TEAL" \
  -fill "$TEALFLOOR" -draw 'ellipse 768,686 768,512 0,360' -draw 'rectangle 0,686 1536,1024' \
  -fill "$MOSS" -draw 'polygon 0,0 290,0 220,190 140,420 60,620 0,720' \
  -fill '#24545c' -draw 'polygon 1536,0 1340,0 1390,220 1460,460 1536,640' \
  -fill '#3d8c93' -draw 'circle 930,82 930,6' -fill "$GOLD" -draw 'circle 930,82 930,26' \
  -fill '#5d6b63' -draw 'polygon 1090,150 1330,138 1352,206 1112,224' \
  -fill "$CANDLE" -draw 'rectangle 1180,90 1212,150' -fill '#a8482c' -draw 'ellipse 1272,140 34,16 0,360' \
  -fill 'rgba(244,220,122,0.3)' -draw 'ellipse 768,560 380,230 0,360' \
  -blur 0x8 guides/dusk-desktop.png
ls guides
