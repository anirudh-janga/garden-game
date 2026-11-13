/**
 * The cottage's plan: every number from docs/cottage-design.md as a named constant.
 * Local coordinates, metres, before the group's scale (`COTTAGE_SCALE`): x along the front
 * (right is +x), y up, z toward the garden (the front is +z).
 */

export const COTTAGE_SCALE = 1.1;

// --- The main range -----------------------------------------------------------------------
export const PLINTH_H = 0.4;
export const WALL_X0 = -2.6;
export const WALL_X1 = 2.6;
export const WALL_Z0 = -1.8; // back
export const WALL_Z1 = 1.8; // front
/** Top of the walls: the wall plate, where the roof begins. */
export const PLATE_Y = 2.5;
export const RIDGE_Y = 4.65;
export const EAVE_OVER = 0.35;
export const VERGE_OVER = 0.3;
export const RIDGE_SAG = 0.1;
/** The roof's slope: 50 degrees, so the eaves edge sits this far below the wall plate. */
export const ROOF_PITCH = Math.atan2(RIDGE_Y - PLATE_Y, WALL_Z1);
export const EAVE_Y = PLATE_Y - EAVE_OVER * Math.tan(ROOF_PITCH);
export const EAVE_Z = WALL_Z1 + EAVE_OVER;
export const ROOF_X0 = WALL_X0 - VERGE_OVER;
export const ROOF_X1 = WALL_X1 + VERGE_OVER;

// --- The chimney (outside the left gable, centred on the ridge line) ---------------------------
export const CHIMNEY = {
  /** Sections of stone, from the ground up: [x0, x1, z0, z1, y0, y1]. */
  base: [-3.15, WALL_X0, -0.65, 0.65, 0, 1.7],
  shoulder: [-3.0, WALL_X0, -0.52, 0.52, 1.7, 3.1],
  shaft: [-2.95, -2.35, -0.35, 0.35, 3.1, 5.5],
  top: 5.5,
} as const;

// --- The lean-to wing on the right gable --------------------------------------------------
export const WING = {
  x0: WALL_X1,
  x1: 4.5,
  z0: -1.3,
  z1: 1.3,
  /** Where the pantry ends and the open log store begins (z). */
  bayZ: 0.43,
  /** Roof: a single slope from the gable wall (high) to the eaves (low). */
  roofHigh: 2.75,
  roofLow: 1.55,
  plinth: 0.3,
} as const;

// --- Openings (windows and the door) ------------------------------------------------------
export type Wall = 'front' | 'back' | 'right';
export interface Opening {
  id: string;
  wall: Wall;
  /** Centre along the wall (x for front and back, z for the right wall), width, height, sill height. */
  c: number;
  w: number;
  h: number;
  sill: number;
  /** Casement lights across (windows). */
  lights: number;
  /** Rows of small panes in each light. */
  rows: number;
}
export const DOOR: Opening = { id: 'door', wall: 'front', c: -0.7, w: 0.86, h: 1.85, sill: PLINTH_H, lights: 1, rows: 1 };
export const WINDOWS: Opening[] = [
  { id: 'kitchen', wall: 'front', c: -1.85, w: 0.8, h: 0.85, sill: 1.3, lights: 2, rows: 3 },
  { id: 'parlour', wall: 'front', c: 1.25, w: 1.45, h: 0.95, sill: 1.2, lights: 3, rows: 3 },
  { id: 'back-left', wall: 'back', c: -1.3, w: 0.7, h: 0.75, sill: 1.35, lights: 2, rows: 3 },
  { id: 'back-right', wall: 'back', c: 1.2, w: 0.7, h: 0.75, sill: 1.35, lights: 2, rows: 3 },
];
/** The round attic window in the right gable. */
export const ATTIC = { z: 0, y: 3.6, r: 0.22 } as const;
/** The pantry's little window, in the wing's right wall. */
export const PANTRY_WINDOW = { z: -0.45, y: 0.95, w: 0.36, h: 0.44 } as const;

/** Depth the glass is set behind the wall's face. */
export const REVEAL = 0.1;

// --- Footprint, for keeping beds, paths and ponds off the cottage -------------------------------
/** Rectangles [x0, x1, z0, z1] in local coordinates, each with the walk-room round it built in. */
export const FOOTPRINT: readonly [number, number, number, number][] = [
  [WALL_X0 - 0.6, WALL_X1 + 0.5, WALL_Z0 - 0.6, WALL_Z1 + 0.55], // the main range and its plinth
  [-3.75, WALL_X0, -0.95, 0.95], // the chimney
  [WALL_X1, WING.x1 + 0.5, WING.z0 - 0.5, WING.z1 + 0.5], // the lean-to wing
  [-1.7, 0.3, WALL_Z1, 3.0], // the doorstep
];

// --- Colours ------------------------------------------------------------------------------
export const COLOURS = {
  limewash: '#efe2c6',
  limewashDamp: '#d6c6a6',
  limewashGreen: '#cfcfa6',
  oak: ['#6f5a47', '#7d6650', '#5f4c3c'],
  oakBleached: '#8a7a68',
  stone: ['#a79d8c', '#b9ae9a', '#94897a', '#c4b9a4', '#a79d8c'],
  stoneGap: '#7f766a',
  stoneLichen: '#b8b77a',
  tiles: ['#b5623f', '#a85738', '#c1704a', '#9a4e36', '#ca7d55'],
  tileDark: '#7d4233',
  tileMoss: '#7e8a55',
  tileLichen: '#d8c79a',
  batten: '#4a3a2e',
  ridge: '#9a4e36',
  paint: '#5f8f88',
  paintWorn: '#77a39b',
  windowPaint: '#f4efe4',
  boards: ['#8f8676', '#9a917f', '#7f7768'],
  flag: ['#b3a894', '#a59a87', '#bfb5a2'],
  iron: '#3b3a3c',
  snow: '#f1f5fa',
} as const;

// --- The porch over the front door and the dormer over the parlour ---------------------------
export const PORCH = {
  /** Centre (the door's), half-width of the roof's eaves, and how far the roof reaches out and back (z). */
  cx: DOOR.c,
  half: 0.95,
  apexY: 2.85,
  eaveY: 1.9,
  frontZ: 2.78,
  backZ: 1.5,
  /** The two posts (offset from the centre) and the height of the collar beam. */
  postX: 0.65,
  postZ: 2.6,
  beamY: 2.2,
  floorY: 0.14,
} as const;

export const DORMER = {
  cx: 1.25,
  /** Half the width of its face, and the face's plane (z), sill height and the height of the face. */
  half: 0.475,
  faceZ: 1.45,
  sillY: 2.95,
  faceH: 0.75,
  /** Its own roof: 45 degrees, eaves a little out from the face. */
  eaveHalf: 0.62,
  eaveY: 3.63,
  apexY: 4.25,
  /** Its roof runs back this far: well inside the main slope, so the two meet in a clean valley. */
  backZ: 0.2,
} as const;
