// Radiant Core: Docket's Pulse orb in three.js.
// Every fragment renders two ways: light-emitting glow over dark sections, ink over light sections.
// The split between the two follows section edges passed in as uniforms, so the orb inverts exactly at the seam.
import * as THREE from 'three'

type Uniforms = Record<string, THREE.IUniform>
type RingDef = { n: number[]; r: number; v: number; arcs: number[][]; ticks: number[][]; wave: number[][] }
type RingObj = { holder: THREE.Group; n: THREE.Vector3; R: RingDef; anchorDeg: number; at: (deg: number, rad: number) => THREE.Vector3 }

export type CoreFrame = {
  ignite: number; speak: number; think: number; listen: number; lod: number; alpha: number; inkTop: number
  bounds: number[]; flare: number[]
  tiltX?: number; tiltY?: number; roll?: number; spinOffset?: number; scale?: number
  hot?: number; charge?: number; ripple?: number[]; mouse?: { x: number; y: number }
}
export type RadiantCore = ReturnType<typeof createRadiantCore>

const CAM_Z = 7.2, FOV = 30;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function geodesic(freq: number) {
  const P = (1 + Math.sqrt(5)) / 2;
  const V = [[-1, P, 0], [1, P, 0], [-1, -P, 0], [1, -P, 0], [0, -1, P], [0, 1, P], [0, -1, -P], [0, 1, -P], [P, 0, -1], [P, 0, 1], [-P, 0, -1], [-P, 0, 1]];
  const F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const verts: number[][] = [], map = new Map<string, number>(), edges = new Set<string>();
  const vid = (p: number[]): number => {
    const l = Math.hypot(p[0], p[1], p[2]);
    const n = [p[0] / l, p[1] / l, p[2] / l];
    const k = n.map((x) => x.toFixed(4)).join(',');
    if (!map.has(k)) { map.set(k, verts.length); verts.push(n); }
    return map.get(k) as number;
  };
  const tri = (t: number[]) => { for (let q = 0; q < 3; q++) { const a = t[q], b = t[(q + 1) % 3]; edges.add(a < b ? a + '_' + b : b + '_' + a); } };
  for (const [a, b, c] of F) {
    const A = V[a], B = V[b], C = V[c], g: number[][] = [];
    for (let i = 0; i <= freq; i++) {
      g[i] = [];
      for (let j = 0; j <= freq - i; j++) {
        const k = freq - i - j;
        g[i][j] = vid([0, 1, 2].map((d) => (A[d] * k + B[d] * i + C[d] * j) / freq));
      }
    }
    for (let i = 0; i < freq; i++) for (let j = 0; j < freq - i; j++) {
      tri([g[i][j], g[i + 1][j], g[i][j + 1]]);
      if (j < freq - i - 1) tri([g[i + 1][j], g[i + 1][j + 1], g[i][j + 1]]);
    }
  }
  return { verts, edges: [...edges].map((s) => s.split('_').map(Number)) };
}

function farthest(verts: number[][], k: number, start: number) {
  const pick = [start];
  const dmin = verts.map((v) => 1 - (v[0] * verts[start][0] + v[1] * verts[start][1] + v[2] * verts[start][2]));
  while (pick.length < k) {
    let best = 0, bi = 0;
    for (let i = 0; i < verts.length; i++) if (dmin[i] > best) { best = dmin[i]; bi = i; }
    pick.push(bi);
    for (let i = 0; i < verts.length; i++) {
      const d = 1 - (verts[i][0] * verts[bi][0] + verts[i][1] * verts[bi][1] + verts[i][2] * verts[bi][2]);
      if (d < dmin[i]) dmin[i] = d;
    }
  }
  return pick;
}

// ---------------------------------------------------------------- shared GLSL
const DUAL = /* glsl */`
uniform vec4 uB;
uniform float uInkTop;
uniform float uAlpha;
float inkK() {
  float y = gl_FragCoord.y;
  float n = (1.0 - smoothstep(uB.x - 0.8, uB.x + 0.8, y)) + (1.0 - smoothstep(uB.y - 0.8, uB.y + 0.8, y))
          + (1.0 - smoothstep(uB.z - 0.8, uB.z + 0.8, y)) + (1.0 - smoothstep(uB.w - 0.8, uB.w + 0.8, y));
  float f = 1.0 - abs(mod(n, 2.0) - 1.0);
  return mix(uInkTop, 1.0 - uInkTop, f);
}
// g: additive glow colour (already multiplied by intensity). ink: premultiplied colour and alpha.
vec4 dual(vec3 g, vec4 ink) {
  float k = inkK();
  float ga = clamp(max(g.r, max(g.g, g.b)), 0.0, 1.0) * 0.28;
  vec4 o = mix(vec4(g, ga), ink, k);
  return o * uAlpha;
}
vec4 over(vec4 top, vec4 under) { return top + under * (1.0 - top.a); }
vec4 pm(vec3 c, float a) { return vec4(c * a, a); }
`;

// brand palette (linear-ish sRGB triples, used straight in the shaders)
const C = {
  white: 'vec3(1.0)', e50: 'vec3(0.925,0.992,0.961)', e100: 'vec3(0.82,0.98,0.898)', e200: 'vec3(0.655,0.953,0.816)',
  e300: 'vec3(0.431,0.906,0.718)', e400: 'vec3(0.204,0.827,0.6)', e500: 'vec3(0.063,0.725,0.506)', e600: 'vec3(0.02,0.588,0.412)',
  e700: 'vec3(0.016,0.471,0.341)', e900: 'vec3(0.024,0.306,0.231)',
  z50: 'vec3(0.98)', z100: 'vec3(0.957,0.957,0.961)', z200: 'vec3(0.894,0.894,0.906)', z300: 'vec3(0.831,0.831,0.847)',
  z400: 'vec3(0.631,0.631,0.667)', z500: 'vec3(0.443,0.443,0.478)', z600: 'vec3(0.322,0.322,0.357)', z700: 'vec3(0.247,0.247,0.275)',
  z800: 'vec3(0.153,0.153,0.165)', z900: 'vec3(0.094,0.094,0.106)',
};
const pal = (s: string) => s.replace(/\$(\w+)/g, (_: string, k: string) => C[k as keyof typeof C]);

const common = () => ({
  uB: { value: new THREE.Vector4(-1e6, -1e6, -1e6, -1e6) },
  uInkTop: { value: 0 },
  uAlpha: { value: 1 },
});

function mat(uniforms: Uniforms, vs: string, fs: string, extra: THREE.ShaderMaterialParameters = {}) {
  return new THREE.ShaderMaterial({
    uniforms, vertexShader: vs, fragmentShader: DUAL + pal(fs), transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor, ...extra,
  });
}

export function createRadiantCore(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, CAM_Z);

  const shared = {
    uTime: { value: 0 }, uIgnite: { value: 1 }, uSpeak: { value: 0 }, uThink: { value: 0 }, uListen: { value: 0 },
    uLod: { value: 0 }, uRpx: { value: 200 }, uCamZ: { value: CAM_Z },
    uMouse: { value: new THREE.Vector2(-1e4, -1e4) }, uHot: { value: 0 }, uHotR: { value: 80 }, uRes: { value: new THREE.Vector2(1, 1) }, uOrigin: { value: new THREE.Vector2(0, 0) },
    uRipple: { value: new THREE.Vector2(1, 0) }, uCharge: { value: 0 },
  };
  const all: Uniforms[] = [];
  const U = (extra: Uniforms = {}): Uniforms => { const u = { ...shared, ...common(), ...extra }; all.push(u); return u; };

  const orb = new THREE.Group();      // scale + tilt
  const lattice = new THREE.Group();  // slow spin
  orb.add(lattice);
  scene.add(orb);
  const flat = new THREE.Group();     // screen-aligned: halo, core, face rings
  scene.add(flat);

  // ---------------------------------------------------------- geometry data
  const r = rng(71);
  let { verts, edges } = geodesic(4);
  edges = edges.filter(() => r() > 0.12);
  const deg = new Array(verts.length).fill(0);
  edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  const warm = verts.map(() => (r() < 0.34 ? 1 : 0));
  const ign = verts.map((v) => 0.15 + 0.55 * (1 - (v[2] * 0.5 + 0.5)) * 0.6 + r() * 0.25);
  const spokes = farthest(verts, 26, 0).sort((a, b) => Math.atan2(verts[a][1], verts[a][0]) - Math.atan2(verts[b][1], verts[b][0]));

  // ---------------------------------------------------------- halo (screen aligned)
  {
    const g = new THREE.PlaneGeometry(3.8, 3.8);
    const m = mat(U(), /* glsl */`
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, /* glsl */`
      uniform float uIgnite, uSpeak, uTime, uLod, uCharge;
      uniform vec2 uRipple;
      varying vec2 vP;
      void main() {
        float d = length(vP) / 0.78;
        float rr = mix(0.3, 1.85, uRipple.x);
        float rw = 0.03 + 0.06 * uRipple.x;
        float rip = exp(-pow((length(vP) - rr) / rw, 2.0)) * pow(1.0 - uRipple.x, 1.4) * uRipple.y;
        float br = 1.0 + 0.09 * sin(uTime * 1.2566) + uSpeak * 0.35;
        vec3 c = mix($e400 * 0.42, $e600 * 0.2, smoothstep(0.0, 0.22, d));
        c = mix(c, $e900 * 0.14, smoothstep(0.22, 0.55, d));
        c = mix(c, vec3(0.0), smoothstep(0.55, 1.0, d));
        vec3 wide = $e500 * 0.11 * exp(-pow(length(vP) / 1.15, 2.0) * 1.6);
        br += uCharge * 0.9;
        vec3 g = (c * 1.65 + wide) * br * smoothstep(0.0, 0.6, uIgnite) + ($e300 * 0.9 + $e50 * 0.3) * rip;
        float ia = 0.7 * exp(-pow(length(vP) / 1.05, 2.0) * 2.2) * smoothstep(0.0, 0.6, uIgnite) * (1.0 + uCharge * 0.5);
        gl_FragColor = dual(g, over(pm($e600, rip * 0.85), pm($e100, ia)));
      }`);
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 0; flat.add(mesh);
  }

  // ---------------------------------------------------------- membranes
  const MEMB: { n: number[]; r: number; w: number; ph: number }[] = [{ n: [0.04, 0.12, 1], r: 0.86, w: 0.09, ph: 0.3 }, { n: [0.25, 0.95, 0.2], r: 0.93, w: 0.07, ph: 1.7 }, { n: [-0.75, 0.35, 0.55], r: 0.8, w: 0.06, ph: 3.1 }];
  for (const M of MEMB) {
    const N = 160, pos = [], aA = [], aS = [], idx = [];
    for (let i = 0; i <= N; i++) for (const s of [-1, 1]) { pos.push(0, 0, 0); aA.push((i / N) * Math.PI * 2); aS.push(s); }
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aA', new THREE.Float32BufferAttribute(aA, 1));
    g.setAttribute('aS', new THREE.Float32BufferAttribute(aS, 1));
    g.setIndex(idx);
    const n = new THREE.Vector3(...M.n).normalize();
    const u = new THREE.Vector3(0, 1, 0).cross(n); if (u.lengthSq() < 1e-4) u.set(1, 0, 0); u.normalize();
    const v = n.clone().cross(u).normalize();
    const m = mat(U({ uN: { value: n }, uU: { value: u }, uV: { value: v }, uR: { value: M.r }, uW: { value: M.w }, uPh: { value: M.ph } }), /* glsl */`
      attribute float aA; attribute float aS;
      uniform vec3 uN, uU, uV; uniform float uR, uW, uPh, uTime, uListen, uSpeak, uCamZ;
      varying float vS; varying float vF;
      void main() {
        float pull = 1.0 - 0.11 * uListen;
        float rip = sin(aA * 3.0 - uTime * (1.2 + uSpeak * 3.0) + uPh) * (0.018 + 0.05 * uSpeak);
        float rr = uR * pull + rip;
        float wv = sin(aA * 2.0 + uTime * 0.7 + uPh) * 0.06;
        vec3 p = (uU * cos(aA) + uV * sin(aA)) * rr + uN * (aS * uW * 0.5 + wv);
        vS = aS;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vF = clamp((mv.z + uCamZ) * 0.5 + 0.5, 0.0, 1.0);
        gl_Position = projectionMatrix * mv;
      }`, /* glsl */`
      uniform float uIgnite, uLod;
      varying float vS; varying float vF;
      void main() {
        float s = abs(vS);
        float fill = (1.0 - s * s) * mix(0.07, 0.12, vF);
        float rim = smoothstep(0.82, 1.0, s) * mix(0.35, 0.55, vF);
        float k = smoothstep(0.3, 1.0, uIgnite) * mix(1.0, 0.6, uLod);
        vec3 g = ($e500 * fill + $e50 * rim * 0.8) * k;
        vec4 ink = over(pm($e600, rim * 0.5 * k), pm($e400, fill * 0.9 * k));
        gl_FragColor = dual(g, ink);
      }`, { side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 2; lattice.add(mesh);
  }

  // ---------------------------------------------------------- lattice edges
  {
    const pos: number[] = [], aI: number[] = [];
    for (const [a, b] of edges) { pos.push(...verts[a], ...verts[b]); aI.push(ign[a], ign[b]); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aI', new THREE.Float32BufferAttribute(aI, 1));
    const m = mat(U(), /* glsl */`
      attribute float aI; uniform float uIgnite, uCamZ;
      varying float vF; varying float vI;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vF = clamp((mv.z + uCamZ) * 0.5 + 0.5, 0.0, 1.0);
        vI = smoothstep(aI, aI + 0.25, uIgnite * 1.3);
        gl_Position = projectionMatrix * mv;
      }`, /* glsl */`
      uniform float uLod, uListen, uHot, uHotR, uCharge;
      uniform vec2 uMouse;
      varying float vF; varying float vI;
      void main() {
        float hot = uHot * (1.0 - smoothstep(0.0, uHotR * 1.3, distance(gl_FragCoord.xy, uMouse)));
        float a = (mix(0.07, 0.34, vF * vF) * mix(1.0, 0.5, uLod) * (1.0 + uListen * 0.3 + uCharge * 0.8) + hot * 0.7) * vI;
        float ia = (mix(0.12, 0.5, vF) * mix(1.0, 0.6, uLod) + hot * 0.4) * vI;
        gl_FragColor = dual(mix($z200, $e300, hot) * a, pm(mix($z500, $e600, hot), clamp(ia, 0.0, 1.0)));
      }`);
    const ls = new THREE.LineSegments(g, m); ls.renderOrder = 1; lattice.add(ls);
  }

  // ---------------------------------------------------------- spokes
  {
    const pos: number[] = [], aT: number[] = [], aK: number[] = [];
    spokes.forEach((si, k) => {
      const v = verts[si];
      pos.push(v[0] * 0.3, v[1] * 0.3, v[2] * 0.3, v[0], v[1], v[2]);
      aT.push(0, 1); aK.push(k, k);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1));
    g.setAttribute('aK', new THREE.Float32BufferAttribute(aK, 1));
    const m = mat(U(), /* glsl */`
      attribute float aT; attribute float aK; uniform float uCamZ;
      varying float vT; varying float vK; varying float vF;
      void main() {
        vT = aT; vK = aK;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vF = clamp((mv.z + uCamZ) * 0.5 + 0.5, 0.0, 1.0);
        gl_Position = projectionMatrix * mv;
      }`, /* glsl */`
      uniform float uTime, uThink, uSpeak, uListen, uIgnite, uLod, uCharge;
      varying float vT; varying float vK; varying float vF;
      void main() {
        float ph = fract(uTime * 0.23 + fract(vK * 0.6180339));
        float p = ph * 1.8 - 0.4;
        p = mix(p, 1.0 - p, step(0.5, uListen));
        float seq = fract(uTime * 0.85 - vK / 26.0) * 1.5 - 0.25;
        float ig = fract(-vK / 26.0 + uIgnite * 1.1) * 1.4 - 0.2;
        p = mix(p, seq, uThink);
        float b = exp(-pow((vT - p) / 0.075, 2.0));
        float gain = (0.45 + 0.75 * uThink + 0.6 * uSpeak + 1.2 * uCharge) * mix(1.0, 0.7, uLod);
        float base = 0.2 * mix(0.45, 1.0, vF);
        float on = smoothstep(0.1, 0.5, uIgnite);
        vec3 g = (mix($z200, $e300, 0.4) * base + $e400 * b * gain * 0.75 + $e50 * pow(b, 6.0) * gain * 0.6) * on;
        vec4 ink = over(pm($e600, b * gain * 0.85 * on), pm($z300, 0.5 * mix(0.5, 1.0, vF) * on));
        gl_FragColor = dual(g, ink);
      }`);
    const ls = new THREE.LineSegments(g, m); ls.renderOrder = 3; lattice.add(ls);
  }

  // ---------------------------------------------------------- nodes
  {
    const pos: number[] = [], aW: number[] = [], aI: number[] = [], aSd: number[] = [];
    verts.forEach((v, i) => { if (!deg[i]) return; pos.push(...v); aW.push(warm[i]); aI.push(ign[i]); aSd.push(r()); });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aW', new THREE.Float32BufferAttribute(aW, 1));
    g.setAttribute('aI', new THREE.Float32BufferAttribute(aI, 1));
    g.setAttribute('aSd', new THREE.Float32BufferAttribute(aSd, 1));
    const m = mat(U(), /* glsl */`
      attribute float aW; attribute float aI; attribute float aSd;
      uniform float uRpx, uIgnite, uTime, uListen, uSpeak, uCamZ, uLod, uHot, uHotR, uCharge;
      uniform vec2 uMouse, uRes, uOrigin;
      varying float vF; varying float vW; varying float vI; varying float vDot; varying float vTw; varying float vHot;
      void main() {
        vec4 p0 = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec2 sp = uOrigin + (p0.xy / p0.w * 0.5 + 0.5) * uRes;
        float hot = uHot * (1.0 - smoothstep(0.0, uHotR, distance(sp, uMouse)));
        vHot = hot;
        vec4 mv = modelViewMatrix * vec4(position * (1.0 + 0.09 * hot + 0.03 * uCharge), 1.0);
        vF = clamp((mv.z + uCamZ) * 0.5 + 0.5, 0.0, 1.0);
        vW = aW;
        vI = smoothstep(aI, aI + 0.2, uIgnite * 1.3);
        float dotR = mix(1.5, 3.6, vF) / 104.0;
        float haloR = mix(9.0, 6.0, uLod) / 104.0;
        gl_PointSize = max(haloR * uRpx, 3.0) * (1.0 + 1.5 * hot);
        vDot = clamp(dotR / haloR, 0.12, 1.0);
        vTw = 0.78 + 0.22 * sin(uTime * 1.6 + aSd * 6.2832) + uListen * 0.45 * aW + uSpeak * 0.2 + uCharge * 0.6 + hot * 1.4;
        gl_Position = projectionMatrix * mv;
      }`, /* glsl */`
      varying float vF; varying float vW; varying float vI; varying float vDot; varying float vTw; varying float vHot;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float dotA = 1.0 - smoothstep(vDot * 0.6, vDot, d);
        float halo = exp(-d * d * 4.5) * mix(0.14, 0.34, vW);
        vec3 cool = mix($z500 * 0.8, mix($z200, $white, smoothstep(0.65, 1.0, vF)), smoothstep(0.0, 0.6, vF));
        vec3 hot = mix($e600 * 0.75, mix($e300, $e50, smoothstep(0.65, 1.0, vF)), smoothstep(0.0, 0.6, vF));
        vec3 cDot = mix(mix(cool, hot, vW), $e50, vHot * 0.8);
        vec3 cHalo = mix($z200, $e400, vW);
        float br = mix(0.55, 1.0, vF) * vI * vTw;
        vec3 g = (cDot * dotA + cHalo * halo) * br;
        vec3 ic = mix(mix($z700, $e600, vW), $e500, vHot);
        float ia = clamp(dotA * mix(0.35, 0.95, vF) * vI + vHot * 0.5 * dotA + halo * vHot * 0.6, 0.0, 1.0);
        gl_FragColor = dual(g, pm(ic, ia));
      }`);
    const pts = new THREE.Points(g, m); pts.renderOrder = 5; lattice.add(pts);
  }

  // ---------------------------------------------------------- core + face rings (screen aligned)
  {
    const Q = 0.84;
    const g = new THREE.PlaneGeometry(Q * 2, Q * 2);
    const m = mat(U(), /* glsl */`
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, /* glsl */`
      uniform float uTime, uIgnite, uSpeak, uThink, uListen, uLod, uCharge;
      varying vec2 vP;
      const float TAU = 6.2831853;
      float ringL(float r, float ri, float w) {
        float fw = max(fwidth(r), 1e-5);
        float hw = max(w * 0.5, fw * 0.5);
        return (1.0 - smoothstep(hw - fw * 0.5, hw + fw * 0.5, abs(r - ri))) * min(1.0, w / fw);
      }
      float dash(float th, float ri, float rot, vec4 pat) {
        float circ = TAU * ri * 104.0;
        float s = fract(th / TAU + rot) * circ;
        float P = pat.x + pat.y + pat.z + pat.w;
        float m = mod(s, P);
        return step(m, pat.x) + step(pat.x + pat.y, m) * step(m, pat.x + pat.y + pat.z);
      }
      float ig(float ri) { return smoothstep(ri * 0.85, ri * 0.85 + 0.3, uIgnite * 1.25); }
      void main() {
        float r = length(vP);
        float th = atan(vP.y, vP.x);
        float t = uTime;
        float spd = 1.0 + 2.8 * uThink + 6.0 * uCharge;
        float br = 1.0 + 0.09 * sin(t * 1.2566) + uSpeak * 0.55 + uCharge * 0.5;
        float on = smoothstep(0.0, 0.35, uIgnite);
        // core gradient
        float d = r / 0.29;
        vec3 cg = mix($white, $e50 * 0.95, smoothstep(0.0, 0.42, d));
        cg = mix(cg, $e400 * 0.6, smoothstep(0.42, 0.72, d));
        cg = mix(cg, vec3(0.0), smoothstep(0.72, 1.0, d));
        float nuc = 1.0 - smoothstep(0.035, 0.075, r);
        float band = ringL(r, 0.245, 0.05);
        vec3 g = (cg * br + $white * nuc * 0.9) * on;
        g *= 1.0 - 0.82 * band;
        g += $z900 * 0.0;
        // rings
        float rim = ringL(r, 0.2, 0.0135) * ig(0.2);
        float rim2 = ringL(r, 0.272, 0.0087) * ig(0.272);
        float tk = ringL(r, 0.31, 0.035) * dash(th, 0.31, -5.0 / 360.0 * t * spd, vec4(0.7, 3.3, 0.0, 0.0)) * ig(0.31);
        float l1 = ringL(r, 0.36, 0.0087) * dash(th, 0.36, 7.0 / 360.0 * t * spd, vec4(46.0, 6.0, 14.0, 6.0)) * ig(0.36);
        float l2 = ringL(r, 0.47, 0.0077) * dash(th, 0.47, -3.0 / 360.0 * t * spd, vec4(90.0, 10.0, 30.0, 10.0)) * ig(0.47);
        float tk2 = ringL(r, 0.505, 0.022) * dash(th, 0.505, 4.0 / 360.0 * t * spd, vec4(0.6, 5.0, 0.0, 0.0)) * ig(0.505);
        float l3 = ringL(r, 0.64, 0.0067) * dash(th, 0.64, 2.0 / 360.0 * t * spd, vec4(140.0, 18.0, 40.0, 18.0)) * ig(0.64);
        float l4 = ringL(r, 0.78, 0.0067) * ig(0.78);
        float fl = 1.0 + uSpeak * 0.45;
        float lod = mix(1.0, 0.0, uLod);
        g += $e50 * rim * 1.0 * fl + $e400 * rim2 * 0.45 * fl;
        g += $z100 * tk * 0.5 + $z200 * l1 * 0.45 + $z300 * l2 * 0.32 * lod + $e400 * tk2 * 0.6 + $z400 * l3 * 0.3 * lod + $z400 * l4 * 0.14 * lod;
        // a soft rim glow around the white rim
        g += $e400 * exp(-pow((r - 0.2) / 0.03, 2.0)) * 0.25 * fl * on;
        // ink: an instrument drawn on paper
        float disc = 1.0 - smoothstep(0.228, 0.236, r);
        vec3 dc = mix($e300, $e600, smoothstep(0.0, 0.23, r));
        dc = mix(dc, $e700, smoothstep(0.17, 0.23, r));
        vec4 ink = pm(dc, disc * on);
        ink = over(pm($white, nuc * on), ink);
        ink = over(pm($e100, rim * 0.9), ink);
        ink = over(pm($z900, band * 0.92 * on), ink);
        ink = over(pm($e600, rim2 * 0.8), ink);
        ink = over(pm($z600, tk * 0.75), ink);
        ink = over(pm($z400, l1 * 0.7), ink);
        ink = over(pm($z400, l2 * 0.55 * lod), ink);
        ink = over(pm($e600, tk2 * 0.85), ink);
        ink = over(pm($z300, l3 * 0.7 * lod), ink);
        ink = over(pm($z200, l4 * 0.8 * lod), ink);
        gl_FragColor = dual(g, ink);
      }`);
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 4; flat.add(mesh);
  }

  // ---------------------------------------------------------- outer arcs with waveform
  const RINGS: RingDef[] = [
    { n: [0.12, 0.8, 0.58], r: 1.3, v: 0.12, arcs: [[190, 335, 1], [345, 372, 0]], ticks: [[200, 250, 4, 0.05]], wave: [[268, 322]] },
    { n: [-0.34, 0.84, 0.42], r: 1.19, v: -0.2, arcs: [[10, 140, 0], [152, 230, 1]], ticks: [[160, 224, 3, 0.035]], wave: [[40, 110]] },
    { n: [0.42, 0.72, -0.55], r: 1.42, v: 0.08, arcs: [[95, 200, 0]], ticks: [[100, 150, 2.5, 0.03]], wave: [[160, 196]] },
  ];
  const ringObjs: RingObj[] = [], ringMats: Uniforms[] = [];
  RINGS.forEach((R, ri) => {
    const pos: number[] = [], dir: number[] = [], aO: number[] = [], aKd: number[] = [], aLn: number[] = [], aSd: number[] = [], aAg: number[] = [];
    const n = new THREE.Vector3(...R.n).normalize();
    const u = new THREE.Vector3(0, 0, 1).cross(n); if (u.lengthSq() < 1e-4) u.set(1, 0, 0); u.normalize();
    const v = n.clone().cross(u).normalize();
    const at = (deg: number, rad: number) => { const a = deg * Math.PI / 180; return u.clone().multiplyScalar(Math.cos(a) * rad).add(v.clone().multiplyScalar(Math.sin(a) * rad)); };
    const rd = (deg: number) => at(deg, 1);
    const push = (p: THREE.Vector3, d: THREE.Vector3, o: number, k: number, ln: number, sd: number, ag: number) => { pos.push(p.x, p.y, p.z); dir.push(d.x, d.y, d.z); aO.push(o); aKd.push(k); aLn.push(ln); aSd.push(sd); aAg.push(ag); };
    let total = 0; R.arcs.forEach(([a, b]) => { total += b - a; });
    let acc = 0;
    for (const [a, b, dbl] of R.arcs) {
      for (let d = a; d < b; d += 1.5) {
        const e = Math.min(b, d + 1.5);
        for (const rr of dbl ? [R.r, R.r + 0.028] : [R.r]) {
          push(at(d, rr), rd(d), 0, 0, 0, 0, (acc + d - a) / total);
          push(at(e, rr), rd(e), 0, 0, 0, 0, (acc + e - a) / total);
        }
      }
      acc += b - a;
    }
    for (const [a, b, sp, ln] of R.ticks) for (let d = a; d <= b; d += sp) {
      push(at(d, R.r + 0.04), rd(d), 0, 1, ln, 0, 0.5); push(at(d, R.r + 0.04), rd(d), 1, 1, ln, 0, 0.5);
    }
    for (const [a, b] of R.wave) for (let d = a, i = 0; d <= b; d += 1.7, i++) {
      const s = r();
      push(at(d, R.r - 0.012), rd(d), 0, 2, 0, s, 0.5); push(at(d, R.r - 0.012), rd(d), -1, 2, 0, s, 0.5);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aDir', new THREE.Float32BufferAttribute(dir, 3));
    g.setAttribute('aO', new THREE.Float32BufferAttribute(aO, 1));
    g.setAttribute('aKd', new THREE.Float32BufferAttribute(aKd, 1));
    g.setAttribute('aLn', new THREE.Float32BufferAttribute(aLn, 1));
    g.setAttribute('aSd', new THREE.Float32BufferAttribute(aSd, 1));
    g.setAttribute('aAg', new THREE.Float32BufferAttribute(aAg, 1));
    const uni = U({ uFlare: { value: 0 } });
    const m = mat(uni, /* glsl */`
      attribute vec3 aDir; attribute float aO; attribute float aKd; attribute float aLn; attribute float aSd; attribute float aAg;
      uniform float uTime, uSpeak, uThink, uFlare, uCamZ, uCharge;
      varying float vF; varying float vKd; varying float vAg; varying float vO;
      void main() {
        float h = aLn;
        if (aKd > 1.5) {
          float n = 0.5 + 0.5 * sin(uTime * (7.0 + aSd * 9.0) + aSd * 40.0) * sin(uTime * 2.3 + aSd * 13.0);
          h = 0.014 + (0.018 + 0.12 * max(max(uSpeak, uFlare * 0.8), uCharge) + 0.04 * uThink) * n;
        }
        vec3 p = position + aDir * abs(aO) * h;
        vKd = aKd; vAg = aAg; vO = abs(aO);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vF = clamp((mv.z + uCamZ) / 1.4 * 0.5 + 0.5, 0.0, 1.0);
        gl_Position = projectionMatrix * mv;
      }`, /* glsl */`
      uniform float uIgnite, uFlare, uSpeak, uLod, uCharge;
      varying float vF; varying float vKd; varying float vAg; varying float vO;
      void main() {
        float sweep = step(vAg, (uIgnite - 0.35) * 1.8);
        float fr = max(uFlare, uCharge);
        vec3 g; vec4 ink;
        if (vKd < 0.5) {
          float a = mix(0.16, 0.55, vF) * (1.0 + fr * 0.8);
          g = mix($z100, $e300, fr * 0.7) * a;
          ink = pm(mix($z700, $e600, fr), mix(0.28, 0.75, vF));
        } else if (vKd < 1.5) {
          float a = mix(0.12, 0.55, vF);
          g = $z300 * a;
          ink = pm($z500, mix(0.22, 0.7, vF));
        } else {
          float a = mix(0.3, 0.9, vF) * (1.0 + fr);
          g = mix($e400, $e50, fr * 0.6) * a;
          ink = pm($e600, mix(0.45, 0.95, vF));
        }
        float k = sweep * mix(1.0, 0.75, uLod);
        gl_FragColor = dual(g * k, ink * k);
      }`);
    const ls = new THREE.LineSegments(g, m); ls.renderOrder = 6;
    const holder = new THREE.Group(); holder.add(ls); orb.add(holder);
    ringObjs.push({ holder, n, R, anchorDeg: (R.wave[0][0] + R.wave[0][1]) / 2, at }); ringMats.push(uni);
  });

  // ---------------------------------------------------------- api
  let cssSize = 0, dpr = 1;
  // The canvas is allocated once (resize) and never re-allocated while scrolling: the orb is drawn at its
  // current size into a centred viewport of that fixed canvas (view), so lines stay crisp at every size.
  let viewBox = 0
  renderer.setScissorTest(true)
  function resize(size: number, ratio: number) {
    cssSize = size; dpr = ratio;
    renderer.setPixelRatio(ratio);
    renderer.setSize(size, size, false);
    view(viewBox || size)
  }
  function view(box: number) {
    viewBox = Math.min(box, cssSize)
    const o = (cssSize - viewBox) / 2
    renderer.setViewport(o, o, viewBox, viewBox)
    renderer.setScissor(o, o, viewBox, viewBox)
    const unit = (viewBox * dpr) / (2 * Math.tan((FOV / 2) * Math.PI / 180) * CAM_Z);
    for (const u of all) u.uRpx.value = unit;
    shared.uRes.value.set(viewBox * dpr, viewBox * dpr)
    shared.uOrigin.value.set(o * dpr, o * dpr)
    shared.uHotR.value = Math.max(40, viewBox * dpr * 0.16)
  }

  const q = new THREE.Quaternion();
  const tmp = new THREE.Vector3();
  function render(time: number, s: CoreFrame) {
    shared.uTime.value = time;
    shared.uIgnite.value = s.ignite;
    shared.uSpeak.value = s.speak;
    shared.uThink.value = s.think;
    shared.uListen.value = s.listen;
    shared.uLod.value = s.lod;
    shared.uHot.value = s.hot || 0;
    shared.uCharge.value = s.charge || 0;
    shared.uRipple.value.set(s.ripple ? s.ripple[0] : 1, s.ripple ? s.ripple[1] : 0);
    if (s.mouse) shared.uMouse.value.set(s.mouse.x * dpr, (cssSize - s.mouse.y) * dpr);
    for (const u of all) {
      u.uInkTop.value = s.inkTop;
      u.uB.value.set(s.bounds[0], s.bounds[1], s.bounds[2], s.bounds[3]);
      u.uAlpha.value = s.alpha;
    }
    ringMats.forEach((u, i) => { u.uFlare.value = s.flare[i] || 0; });
    const spin = 1 + 2.8 * s.think + 5 * (s.charge || 0);
    lattice.rotation.set(-0.14, time * 0.05 * spin + (s.spinOffset || 0), 0);
    orb.rotation.set(s.tiltX || 0, s.tiltY || 0, s.roll || 0);
    const sc = s.scale || 1;
    orb.scale.setScalar(sc); flat.scale.setScalar(sc);
    ringObjs.forEach((o, i) => { q.setFromAxisAngle(o.n, time * o.R.v * spin * 0.9); o.holder.quaternion.copy(q); });
    renderer.setScissor(0, 0, cssSize, cssSize)
    renderer.clear()
    const o = (cssSize - viewBox) / 2
    renderer.setScissor(o, o, viewBox, viewBox)
    renderer.render(scene, camera);
  }

  // canvas-local css px of the anchor on arc i (where a docked card's leader starts)
  function anchor(i: number) {
    const o = ringObjs[i];
    tmp.copy(o.at(o.anchorDeg, o.R.r + 0.07));
    o.holder.updateMatrixWorld(true);
    tmp.applyMatrix4(o.holder.matrixWorld).project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * cssSize, y: (1 - (tmp.y * 0.5 + 0.5)) * cssSize, front: tmp.z };
  }

  // canvas-local css px of n points around ring i, with front (0 back to 1 front)
  const w = new THREE.Vector3();
  function ringPoints(i: number, n = 48) {
    const o = ringObjs[i];
    o.holder.updateMatrixWorld(true);
    const out: { x: number; y: number; front: number }[] = [];
    for (let k = 0; k < n; k++) {
      w.copy(o.at((k / n) * 360, o.R.r)).applyMatrix4(o.holder.matrixWorld);
      const front = 0.5 + 0.5 * (w.z / (o.R.r * orb.scale.x));
      w.project(camera);
      out.push({ x: (w.x * 0.5 + 0.5) * cssSize, y: (1 - (w.y * 0.5 + 0.5)) * cssSize, front });
    }
    return out;
  }

  function dispose() {
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.geometry) m.geometry.dispose()
      if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose())
    })
    renderer.dispose()
  }

  return { resize, view, render, anchor, ringPoints, dispose, renderer, get size() { return cssSize; }, nodes: verts.length, edges: edges.length };
}
