// Engraved light. The night chapters are drawn as ruled lines, the way an engraver draws a night sky: where the lines
// close up the page is black, where they thin out the paper shows through. The Radiant Core is the light source:
// at night its glow opens a halo in the rules (the paper glows emerald there), and at daybreak its light spreads
// until every rule has thinned to nothing and the page is white paper.
//
// One full-viewport canvas behind the content, raw WebGL2, one triangle, one fragment shader. It is drawn only while
// a night stage (the start-up, the hero, Daybreak, the final scan) is on screen, and only when an input changed.
// Everything it draws is fixed to the screen, so it never has to keep up with scrolling content.

export type BackdropFrame = {
  core: { x: number; y: number; r: number } // css px, viewport coordinates
  dawn: number   // 0 night .. 1 the whole page is paper
  glow: number   // strength of the night halo around the core
  charge: number
  speak: number
  ripple: number[] // [phase 0..1, strength]
  time: number
  /** the hero's orbit: near the core the rules become rings on this tilted ellipse, and slow ripples ride it */
  orbit?: { rx: number; ry: number; angle: number; k: number } | null
  pointer?: { x: number; y: number }
  rm?: boolean
}

const VS = `#version 300 es
in vec2 aP;
void main() { gl_Position = vec4(aP, 0.0, 1.0); }`

const FS = `#version 300 es
precision highp float;
uniform vec2 uRes;     // device px
uniform float uDpr;
uniform vec3 uCore;    // x, y (css px, y down), radius of the orb (css px)
uniform float uDawn, uGlow, uCharge, uSpeak, uTime, uDmax, uPitch;
uniform vec2 uRip;
uniform vec4 uOrb;   // rx, ry (css px), tilt (rad), strength 0..1
uniform vec3 uPtr;   // pointer x, y (css px), lens strength
uniform float uWave; // the ripple clock (seconds); 0 holds the rings still
out vec4 o;

const vec3 NIGHT = vec3(0.0353, 0.0353, 0.0431);   // #09090B, matches the CSS night exactly
const vec3 PAPER = vec3(1.0);
const vec3 E900 = vec3(0.024, 0.306, 0.231);
const vec3 E500 = vec3(0.063, 0.725, 0.506);
const vec3 E300 = vec3(0.431, 0.906, 0.718);

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 q = p - uCore.xy;
  float d = length(q), R = max(uCore.z, 1.0);

  // daybreak: the paper spreads out from the core, with a tapered band where the rules thin
  float e = uDawn;
  float W = mix(R * 0.8, uDmax * 0.4, e);
  float F = mix(-R * 0.2, uDmax + W * 1.02, e);
  float Lf = 1.0 - smoothstep(F - W, F, d);

  // night: a halo of open rules around the orb, kept solid under the orb itself
  float halo = exp(-pow(max(d - R * 0.92, 0.0) / (R * (1.0 + 0.5 * uCharge)), 1.3));
  float Lh = uGlow * (0.62 + 0.25 * uCharge + 0.15 * uSpeak) * halo * smoothstep(R * 0.72, R * 0.98, d);
  float L = clamp(max(Lh, Lf), 0.0, 1.0);

  // the rules bow around the orb like a lens, and carry the core's ripple and voice outwards
  float y = p.y - q.y * 0.2 * exp(-pow(d / (R * 1.45), 2.0));
  y += 1.1 * sin(p.x * 0.011 + p.y * 0.0023) + 0.6 * sin(p.x * 0.031 - p.y * 0.004); // a burin's hand, not a scanline
  float rr = mix(R * 0.9, R * 5.0, uRip.x);
  y += uRip.y * (1.0 - uRip.x) * 6.0 * sin((d - rr) * 0.22) * exp(-pow((d - rr) / (R * 0.35), 2.0));
  y += uSpeak * 2.2 * sin(p.x * 0.05 - uTime * 7.0) * exp(-pow(d / (R * 2.4), 2.0));

  // the hero only (uniform branches, so the other stages pay nothing for it):
  // the pointer is a soft lens that parts the rules, and around the core the rules turn into rings on the tilted
  // orbit ellipse, with slow ripples travelling out along them
  float lens = 0.0, ringK = 0.0, ye = 0.0;
  if (uPtr.z > 0.0) {
    vec2 pq = p - uPtr.xy;
    lens = uPtr.z * exp(-dot(pq, pq) / (95.0 * 95.0));
    y += pq.y * 0.32 * lens;
  }
  if (uOrb.w > 0.0) {
    float ca = cos(uOrb.z), sa = sin(uOrb.z);
    vec2 qr = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float de = length(vec2(qr.x * (uOrb.y / max(uOrb.x, 1.0)), qr.y));   // elliptical radius, on the minor axis
    float ry = max(uOrb.y, 1.0);
    ringK = uOrb.w * exp(-pow(max(de - ry * 0.25, 0.0) / (ry * 1.25), 2.0)) * smoothstep(R * 0.8, R * 1.1, d);
    ye = de * (1.0 + 0.32 * lens);
    float ph = fract(uWave / 5.0);
    float wave = step(0.001, uWave) * exp(-pow((de - ph * ry * 2.6) / (ry * 0.05), 2.0)) * (1.0 - ph);
    L = clamp(L + uOrb.w * wave * 0.32 + lens * 0.12 * uGlow, 0.0, 1.0);
  }

  // line coverage: 1 means the rule is as wide as its pitch (solid night)
  float c = 1.0 - L;
  float P = uPitch;
  float hw = c * P * 0.5;
  float v = abs(fract(y / P) - 0.5) * P;
  float fw = max(fwidth(y), 1e-3) * 0.7;
  float inkK = 1.0 - smoothstep(hw - fw, hw + fw, v);
  if (ringK > 0.0005) {
    float ve = abs(fract(ye / (P * 1.25)) - 0.5) * P * 1.25;
    float fe = max(fwidth(ye), 1e-3) * 0.7;
    float inkE = 1.0 - smoothstep(hw * 1.25 - fe, hw * 1.25 + fe, ve);
    inkK = mix(inkK, inkE, ringK);
  }
  inkK = mix(inkK, 1.0, smoothstep(0.93, 0.985, c));   // far from any light the rules close into solid night
  inkK *= smoothstep(0.015, 0.08, c);                   // in full daylight the last hairlines vanish

  // what shows between the rules: the core's emerald light at night, paper once the day reaches it
  float near = exp(-max(d - R, 0.0) / (R * 0.9));
  vec3 glow = mix(E900 * 0.55, mix(E500 * 0.62, E300 * 0.7, uCharge), near);
  vec3 gap = mix(glow, PAPER, smoothstep(0.0, 0.85, Lf));
  // the front of the day carries the core's colour: emerald where the paper is only just showing
  float front = smoothstep(0.02, 0.35, Lf) * (1.0 - smoothstep(0.35, 0.9, Lf));
  gap = mix(gap, mix(E500, E300, 0.35), front * 0.55);
  o = vec4(mix(gap, NIGHT, inkK), 1.0);
}`

export function createBackdrop(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' })
  if (!ctx) throw new Error('webgl2 unavailable')
  const gl: WebGL2RenderingContext = ctx
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS))
  gl.bindAttribLocation(prog, 0, 'aP')
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link')
  const vao = gl.createVertexArray(), buf = gl.createBuffer()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  const u = Object.fromEntries(['uRes', 'uDpr', 'uCore', 'uDawn', 'uGlow', 'uCharge', 'uSpeak', 'uTime', 'uDmax', 'uPitch', 'uRip', 'uOrb', 'uPtr', 'uWave']
    .map((k) => [k, gl.getUniformLocation(prog, k)]))

  let w = 0, h = 0, dpr = 1, last = ''
  function resize(cssW: number, cssH: number, ratio: number) {
    w = cssW; h = cssH; dpr = ratio
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    last = ''
  }

  function render(f: BackdropFrame) {
    // only draw when something visible changed (the rules are static unless the core moves, speaks or ripples)
    const orb = f.orbit && f.orbit.k > 0.001 ? f.orbit : null
    const waving = !!orb && !f.rm
    const moving = f.speak > 0.01 || (f.ripple[1] > 0.01 && f.ripple[0] < 1)
    // the idle orbit ripple redraws at 30 fps; anything the visitor does redraws every frame
    const tick = waving && !moving ? Math.floor(f.time * 30) : moving ? f.time : 0
    const px = orb ? f.pointer?.x ?? -1e4 : -1e4, py = orb ? f.pointer?.y ?? -1e4 : -1e4
    const key = [f.core.x, f.core.y, f.core.r, f.dawn, f.glow, f.charge, px, py, orb ? orb.k : 0].map((v) => v.toFixed(2)).join() + tick
    if (key === last) return
    last = key
    const cx = f.core.x, cy = f.core.y
    const dmax = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy))
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(prog)
    gl.bindVertexArray(vao)
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    gl.uniform1f(u.uDpr, dpr)
    gl.uniform3f(u.uCore, cx, cy, f.core.r)
    gl.uniform1f(u.uDawn, f.dawn)
    gl.uniform1f(u.uGlow, f.glow)
    gl.uniform1f(u.uCharge, f.charge)
    gl.uniform1f(u.uSpeak, f.speak)
    gl.uniform1f(u.uTime, f.time)
    gl.uniform1f(u.uDmax, dmax)
    gl.uniform1f(u.uPitch, w < 640 ? 4 : 5)
    gl.uniform2f(u.uRip, f.ripple[0], f.ripple[1])
    gl.uniform4f(u.uOrb, orb ? orb.rx : 1, orb ? orb.ry : 1, orb ? orb.angle : 0, orb ? orb.k : 0)
    gl.uniform3f(u.uPtr, px, py, orb && !f.rm ? 1 : 0)
    gl.uniform1f(u.uWave, waving ? f.time + 0.0001 : 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function dispose() {
    gl.deleteBuffer(buf); gl.deleteVertexArray(vao); gl.deleteProgram(prog)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
  return { resize, render, dispose }
}
export type Backdrop = ReturnType<typeof createBackdrop>
