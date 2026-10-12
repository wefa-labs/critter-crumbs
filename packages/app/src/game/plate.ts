/**
 * A plate: one painting of the room seen from above, made for a device (design pass §22 and §26). Its wall arches over
 * the top and its floor fills the rest. `aspect` is its width over its height; `wallFoot` is how far down it the wall
 * ends in the middle, at the foot of the wall or of its steps, as a share of its height.
 */
export interface PlateShape { aspect: number; wallFoot: number }

/** The strip of floor kept between the foot of the wall and the feet of the circle's back row. */
export const PLATE_GAP = 8;

/**
 * A plate fills the scene from its top, fitted as `background-size: cover` fits it. The circle's back row stands
 * `backRow` pixels down the scene, higher on a short screen than a tall one, so a wall painted for one screen would have
 * critters standing on it on another. This is how far the plate is raised, and grown so that it still covers the scene,
 * for the foot of its wall to come PLATE_GAP above the back row: the top of the wall leaves the screen, and the floor
 * meets the feet. A plate whose wall already ends above the row is left where it is.
 */
export function plateLift(scene: { width: number; height: number }, plate: PlateShape, backRow: number) {
  const foot = backRow - PLATE_GAP;
  /* raised by `lift`, the plate is drawn `scene.height + lift` tall, or `scene.width / aspect` where that is taller */
  return Math.max(0, plate.wallFoot * scene.width / plate.aspect - foot, (plate.wallFoot * scene.height - foot) / (1 - plate.wallFoot));
}
