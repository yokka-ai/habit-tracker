const COLOURS = ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];

type Piece = { x: number; y: number; vx: number; vy: number; size: number; colour: string };

/** A burst of pieces from the bottom centre, flying up and out. */
export function createPieces(width: number, height: number, count = 80): Piece[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
    const speed = 6 + Math.random() * 8;
    return {
      x: width / 2,
      y: height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 5,
      colour: COLOURS[index % COLOURS.length] as string,
    };
  });
}

/** Advance one frame: gravity pulls pieces down, and drag slows them sideways. */
export function stepPieces(pieces: Piece[]): Piece[] {
  return pieces.map((p) => ({
    ...p,
    x: p.x + p.vx,
    y: p.y + p.vy,
    vx: p.vx * 0.99,
    vy: p.vy + 0.35,
  }));
}

const FRAMES = 120;

/** Play a short confetti burst on `canvas`, then clear it. Returns a function that stops early. */
export function playConfetti(canvas: HTMLCanvasElement, onDone: () => void): () => void {
  const context = canvas.getContext("2d");
  if (!context) {
    onDone();
    return () => {};
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let pieces = createPieces(canvas.width, canvas.height);
  let frame = 0;
  let handle = 0;
  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    frame += 1;
    if (frame > FRAMES) {
      onDone();
      return;
    }
    pieces = stepPieces(pieces);
    for (const p of pieces) {
      context.fillStyle = p.colour;
      context.fillRect(p.x, p.y, p.size, p.size);
    }
    handle = window.requestAnimationFrame(draw);
  };
  handle = window.requestAnimationFrame(draw);
  return () => window.cancelAnimationFrame(handle);
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
