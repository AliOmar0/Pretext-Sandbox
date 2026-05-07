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

export function layoutAround(
  words: string[],
  containerW: number,
  containerH: number,
  lineHeight: number,
  font: string,
  obstacle: Obstacle | null,
  spaceW = 5,
): WordPos[] {
  const ctx = getCtx(font);
  if (!ctx) return [];
  const positions: WordPos[] = [];
  let x = 0;
  let y = 0;
  for (const word of words) {
    const w = ctx.measureText(word).width;
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 4) {
      attempts++;
      if (x + w > containerW) {
        y += lineHeight;
        x = 0;
      }
      if (y + lineHeight > containerH) return positions;
      if (obstacle && intersects(x, y, w, lineHeight, obstacle)) {
        if (x < obstacle.x + obstacle.w) {
          x = obstacle.x + obstacle.w + spaceW;
          if (x + w > containerW) {
            y += lineHeight;
            x = 0;
          } else {
            placed = true;
          }
        } else {
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
