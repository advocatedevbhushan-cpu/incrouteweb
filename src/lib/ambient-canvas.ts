/**
 * Particle Network Background — Premium connected particles
 * 50 particles drifting slowly, connected by gold lines when close.
 * Adapts opacity for light/dark mode. 60fps with fallback.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const PARTICLE_COUNT = 50;
const CONNECTION_DISTANCE = 100;
const PARTICLE_RADIUS = 2;
const COLORS_DARK = ["#C7A86B", "#2B5B84", "#1A1C1E"];
const COLORS_LIGHT = ["#C7A86B", "#2B5B84", "#94A3B8"];

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let particles: Particle[] = [];

function isLightMode(): boolean {
  return document.documentElement.classList.contains("light");
}

function getParticleOpacity(): number {
  return isLightMode() ? 0.4 : 0.7;
}

function getLineOpacity(): number {
  return isLightMode() ? 0.06 : 0.1;
}

function randomVelocity(): number {
  return (Math.random() - 0.5) * 0.4; // range: -0.2 to 0.2
}

function createParticles(w: number, h: number): Particle[] {
  const colors = isLightMode() ? COLORS_LIGHT : COLORS_DARK;
  const result: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    result.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: randomVelocity(),
      vy: randomVelocity(),
      radius: PARTICLE_RADIUS,
      color: colors[i % colors.length],
    });
  }
  return result;
}

function render() {
  if (!ctx || !canvas) return;

  const w = canvas.width;
  const h = canvas.height;
  const particleAlpha = getParticleOpacity();
  const lineAlpha = getLineOpacity();

  ctx.clearRect(0, 0, w, h);

  // Update positions
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    // Wrap around edges
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  }

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONNECTION_DISTANCE) {
        const opacity = lineAlpha * (1 - dist / CONNECTION_DISTANCE);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(199, 168, 107, ${opacity})`; // Gold lines
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Draw particles
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = particleAlpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  animationId = requestAnimationFrame(render);
}

function handleResize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = createParticles(canvas.width, canvas.height);
}

export function initAmbientCanvas() {
  if (typeof window === "undefined") return;

  try {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1";
    canvas.style.pointerEvents = "none";

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = createParticles(canvas.width, canvas.height);

    document.body.prepend(canvas);

    animationId = requestAnimationFrame(render);

    window.addEventListener("resize", handleResize, { passive: true });
  } catch {
    destroyAmbientCanvas();
  }
}

export function destroyAmbientCanvas() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
  window.removeEventListener("resize", handleResize);
  canvas = null;
  ctx = null;
}
