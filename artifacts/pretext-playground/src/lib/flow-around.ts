export interface WordPos {
  text: string;
  x: number;
  y: number;
  w: number;
}

let cachedCtx: CanvasRenderingContext2D | null = null;
function getCtx(font: string) {
  if (!cachedCtx) {
    const c = document.createElement("canvas");
    cachedCtx = c.getContext("2d");
  }
  if (cachedCtx) cachedCtx.font = font;
  return cachedCtx;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

function intersects(
  wx: number,
  wy: number,
  ww: number,
  wh: number,
  ob: Obstacle,
) {
  return !(wx + ww < ob.x || wx > ob.x + ob.w || wy + wh < ob.y || wy > ob.y + ob.h);
}

// Find the obstacle (if any) the candidate word rect intersects. Returns the
// rightmost edge of any intersected obstacle so we can hop past it.
function firstHit(
  wx: number,
  wy: number,
  ww: number,
  wh: number,
  obs: Obstacle[],
): Obstacle | null {
  for (const ob of obs) {
    if (intersects(wx, wy, ww, wh, ob)) return ob;
  }
  return null;
}

export function layoutAround(
  words: string[],
  containerW: number,
  containerH: number,
  lineHeight: number,
  font: string,
  obstacle: Obstacle | Obstacle[] | null,
  spaceW = 5,
): WordPos[] {
  const ctx = getCtx(font);
  if (!ctx) return [];
  const obs: Obstacle[] = obstacle == null ? [] : Array.isArray(obstacle) ? obstacle : [obstacle];
  const positions: WordPos[] = [];
  let x = 0;
  let y = 0;
  for (const word of words) {
    const w = ctx.measureText(word).width;
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 12) {
      attempts++;
      if (x + w > containerW) {
        y += lineHeight;
        x = 0;
      }
      if (y + lineHeight > containerH) return positions;
      const hit = obs.length ? firstHit(x, y, w, lineHeight, obs) : null;
      if (hit) {
        // Try to jump to right of this obstacle on the same line
        const jumpX = hit.x + hit.w + spaceW;
        if (jumpX + w <= containerW && jumpX > x) {
          x = jumpX;
        } else {
          // Wrap to next line and try again
          y += lineHeight;
          x = 0;
        }
      } else {
        placed = true;
      }
    }
    if (!placed) continue;
    positions.push({ text: word, x, y, w });
    x += w + spaceW;
  }
  return positions;
}
