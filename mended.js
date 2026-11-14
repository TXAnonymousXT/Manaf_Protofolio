// =================================================================
// Mended. A porcelain network switch, broken once and rejoined with
// gold, and marked in Royal Indigo. Custom WebGL2 renderer: studio softboxes
// as analytic reflections, glaze over a warm white body, raised gold seams,
// rough biscuit on the broken faces, a shadow map, a soft floor, and depth of field.
// Plain script, so the page opens straight from disk.
// =================================================================
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const smoother = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };

const SEAL = [0, 201, -14];     // the maker's mark, on the back of the shield, clear of every crack
const SEAL_SIZE = 70;           // millimetres covered by its texture
const STEP = 52 * Math.PI / 180;   // how far the ring turns from one plaque to the next
const PW = 540, PH = 360, PT = 14; // a plaque, in millimetres
const REST = 30 * Math.PI / 180;   // where a plaque stops, to the right of the column
const FIRST = 2;                   // the chapter the first plaque belongs to

/* ---------- small vector and matrix helpers ---------- */
const V = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  mix: (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)],
};
const M = {
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[r + 4] * b[c * 4 + 1] + a[r + 8] * b[c * 4 + 2] + a[r + 12] * b[c * 4 + 3];
    return o;
  },
  look(eye, at, up) {
    const z = V.norm(V.sub(eye, at)), x = V.norm(V.cross(up, z)), y = V.cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -V.dot(x, eye), -V.dot(y, eye), -V.dot(z, eye), 1]);
  },
  persp(fovy, aspect, n, f, sx = 0, sy = 0) {
    const t = 1 / Math.tan(fovy / 2);
    return new Float32Array([t / aspect, 0, 0, 0, 0, t, 0, 0, -sx, -sy, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
  },
  // position, then yaw about y, pitch about x, roll about z
  trs(p, yaw, pitch, roll) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch), cz = Math.cos(roll), sz = Math.sin(roll);
    return new Float32Array([cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz, 0, -cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz, 0, sy * cx, -sx, cy * cx, 0, p[0], p[1], p[2], 1]);
  },
  apply: (m, v) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]],
  ortho(l, r, b, t, n, f) {
    return new Float32Array([2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]);
  },
  invert(m) {
    const a = m, o = new Float32Array(16);
    const b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6];
    const b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    det = 1 / det;
    o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * det; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * det; o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * det; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * det;
    o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * det; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * det; o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * det; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * det;
    o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * det; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * det; o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * det; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * det;
    o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * det; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * det; o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * det; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * det;
    return o;
  },
};
const Q = {
  axis(ax, an) { const s = Math.sin(an / 2); return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(an / 2)]; },
  mul(a, b) {
    return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
  },
  nlerp(a, b, t) {
    const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3], k = d < 0 ? -1 : 1;
    const o = [lerp(a[0], b[0] * k, t), lerp(a[1], b[1] * k, t), lerp(a[2], b[2] * k, t), lerp(a[3], b[3] * k, t)];
    const l = Math.hypot(o[0], o[1], o[2], o[3]) || 1;
    return [o[0] / l, o[1] / l, o[2] / l, o[3] / l];
  },
  rot(q, v) {
    const t = V.mul(V.cross([q[0], q[1], q[2]], v), 2);
    return V.add(V.add(v, V.mul(t, q[3])), V.cross([q[0], q[1], q[2]], t));
  },
};

/* ---------- shaders ---------- */
const COMMON_VS = `#version 300 es
precision highp float; precision highp int;
layout(location=0) in vec3 aPos;
layout(location=1) in uint aShard;
layout(location=2) in vec2 aOct;
layout(location=3) in vec3 aMisc;
uniform vec3 uLo, uHi;
uniform highp sampler2D uXf;
uniform mat4 uVP;
out vec3 vWorld; centroid out vec3 vN; out vec3 vRest; centroid out vec3 vRestN; centroid out vec3 vMisc;
vec3 qrot(vec4 q, vec3 v){ vec3 t = 2.0*cross(q.xyz, v); return v + q.w*t + cross(q.xyz, t); }
void main(){
  vec3 rest = mix(uLo, uHi, aPos);
  vec3 n = vec3(aOct, 1.0 - abs(aOct.x) - abs(aOct.y));
  if (n.z < 0.0) { vec2 s = vec2(n.x >= 0.0 ? 1.0 : -1.0, n.y >= 0.0 ? 1.0 : -1.0); n.xy = (1.0 - abs(n.yx))*s; }
  n = normalize(n);
  int id = int(aShard);
  vec3 t = texelFetch(uXf, ivec2(0, id), 0).xyz;
  vec4 q = texelFetch(uXf, ivec2(1, id), 0);
  vec4 cs = texelFetch(uXf, ivec2(2, id), 0);
  vec3 w = t + qrot(q, (rest - cs.xyz)*cs.w);
  vWorld = w; vN = qrot(q, n); vRest = rest; vRestN = n; vMisc = aMisc;
  gl_Position = uVP*vec4(w, 1.0);
}`;

const GOBO_GLSL = `
// the shadow of a window frame, projected along the sun; uv is the light's view of the set
uniform vec4 uWin;     // where the window lands: centre, and half its size, in millimetres in the light's view
uniform float uSoft;   // how soft the edges of the light are, in millimetres
vec2 goboAt(vec2 uv){
  vec2 p = (uv - 0.5)*1800.0;
  return vec2(p.x*0.974 + p.y*0.225, -p.x*0.225 + p.y*0.974) + vec2(26.0, 96.0) - uWin.xy;
}
float gobo(vec2 p){
  vec2 pane = vec2(392.0, 560.0);
  vec2 g = abs(mod(p + pane*0.5, pane) - pane*0.5);
  float bars = smoothstep(pane.x*0.5 - 9.0 - uSoft, pane.x*0.5 - 9.0, g.x);
  bars = max(bars, smoothstep(pane.y*0.5 - 9.0 - uSoft, pane.y*0.5 - 9.0, g.y));
  float frame = (1.0 - smoothstep(uWin.z, uWin.z + uSoft, abs(p.x)))*(1.0 - smoothstep(uWin.w, uWin.w + uSoft, abs(p.y)));
  return frame*(1.0 - bars);
}`;

const ENV_GLSL = `
#define NB 6
uniform vec4 uBC[NB], uBU[NB], uBV[NB];
uniform vec3 uBL[NB];
uniform vec3 uSky, uWall, uGround;
float fall(float lo, float hi, float x){ return 1.0 - smoothstep(lo, hi, x); }
vec3 envBase(vec3 d, float rough){
  float k = 0.10 + rough*0.8;
  vec3 c = mix(uGround, uWall, smoothstep(-k, k, d.y));
  return mix(c, uSky, smoothstep(0.15, 1.0, d.y));
}
float boxMask(vec3 d, int i, float rough){
  float dn = dot(d, uBC[i].xyz);
  if (dn <= 0.02) return 0.0;
  vec3 p = d/dn;
  float s = 0.025 + rough*rough*1.6 + rough*0.25;
  float hu = uBU[i].w, hv = uBV[i].w;
  float u = abs(dot(p, uBU[i].xyz)), v = abs(dot(p, uBV[i].xyz));
  float a = fall(hu - s, hu + s, u)*fall(hv - s, hv + s, v);
  return a*min(1.0, hu/(hu + s*0.8))*min(1.0, hv/(hv + s*0.8))*smoothstep(0.02, 0.25, dn);
}
vec3 envAll(vec3 d, float rough, float sh){
  vec3 c = envBase(d, rough);
  for (int i = 0; i < NB; i++) c += uBL[i]*boxMask(d, i, rough)*(i == 0 ? sh : 1.0);
  return c;
}
vec3 irradiance(vec3 n, float sh){
  vec3 c = mix(uGround, uWall, smoothstep(-1.0, 0.0, n.y));
  c = mix(c, uSky, smoothstep(0.0, 1.0, n.y));
  for (int i = 0; i < NB; i++) c += uBL[i]*uBC[i].w*max(0.0, dot(n, uBC[i].xyz)*0.82 + 0.18)*(i == 0 ? sh : 1.0);
  return c;
}`;

const OBJ_FS = `#version 300 es
precision highp float; precision highp int;
in vec3 vWorld; centroid in vec3 vN; in vec3 vRest; centroid in vec3 vRestN; centroid in vec3 vMisc;
uniform vec3 uEye, uImpact;
uniform mat4 uLightVP;
uniform highp sampler2DShadow uShadow;
uniform sampler2D uNoise, uFront, uSeal;
uniform float uGold, uHeat, uShadowR, uTime, uGoldGain, uGlow, uPulse;
uniform vec3 uGlaze, uGlazeDeep, uFace, uMatte, uMark, uHair, uGoldBase;
out vec4 o;
${ENV_GLSL}
${GOBO_GLSL}
const vec2 PD[12] = vec2[](vec2(-.326,-.406),vec2(-.840,-.074),vec2(-.696,.457),vec2(-.203,.621),vec2(.962,-.195),vec2(.473,-.480),vec2(.519,.767),vec2(.185,-.893),vec2(.507,.064),vec2(.896,.412),vec2(-.322,-.933),vec2(-.792,-.598));
float ign(vec2 p){ return fract(52.9829189*fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float shadowAt(vec3 p){
  vec4 q = uLightVP*vec4(p, 1.0);
  vec3 s = q.xyz*0.5 + 0.5;
  if (s.x < 0.0 || s.y < 0.0 || s.x > 1.0 || s.y > 1.0 || s.z > 1.0) return 1.0;
  float a = ign(gl_FragCoord.xy)*6.2832, c = cos(a), n = sin(a);
  mat2 R = mat2(c, n, -n, c);
  float sum = 0.0;
  for (int i = 0; i < 12; i++) sum += texture(uShadow, vec3(s.xy + R*PD[i]*uShadowR, s.z - 0.0009));
  return sum/12.0;
}
void main(){
  vec3 N = normalize(vN);
  vec3 Vw = normalize(uEye - vWorld);
  if (!gl_FrontFacing) N = -N;
  float ao = vMisc.x;
  { float flc = floor(vMisc.z*255.0 + 0.5); if (abs(flc - 1.0) < 0.5) ao = mix(ao, 1.0, 0.82); }
  float sv = vMisc.y*24.0 - 12.0;              // mm along the glaze from the break; negative on a broken face
  float fl = floor(vMisc.z*255.0 + 0.5);
  bool matte = abs(fl - 1.0) < 0.5, gilded = fl > 1.5;

  vec3 rn = vRest;
  vec3 aw = abs(normalize(vRestN)) + 0.001; aw /= aw.x + aw.y + aw.z;
  vec4 n1 = texture(uNoise, rn.zy*0.0071)*aw.x + texture(uNoise, rn.xz*0.0071)*aw.y + texture(uNoise, rn.xy*0.0071)*aw.z;   // broad, about 140 mm
  vec4 n2 = texture(uNoise, rn.zy*0.041)*aw.x + texture(uNoise, rn.xz*0.041)*aw.y + texture(uNoise, rn.xy*0.041)*aw.z;      // about 25 mm
  vec4 n3 = texture(uNoise, rn.zy*0.29)*aw.x + texture(uNoise, rn.xz*0.29)*aw.y + texture(uNoise, rn.xy*0.29)*aw.z;         // about 3 mm

  // the surface gradient of the break coordinate: which way is "away from the crack" on this surface
  vec3 dpx = dFdx(vWorld), dpy = dFdy(vWorld);
  float dsx = dFdx(sv), dsy = dFdy(sv);
  vec3 r1 = cross(dpy, N), r2 = cross(N, dpx);
  float det = dot(dpx, r1);
  vec3 grad = (dsx*r1 + dsy*r2)*(det >= 0.0 ? 1.0 : -1.0)/max(abs(det), 1e-5);
  float aa = max(fwidth(sv)*0.9, 0.02);

  // the gold arrives from the point of impact
  float arr = distance(vRest, uImpact)/720.0 + (n2.r - 0.5)*0.05;
  float g = smoothstep(arr - 0.018, arr, uGold - 0.02);
  float hot = g*exp(-max(uGold - arr, 0.0)*10.0);

  float wid = (1.3 + 1.6*smoothstep(0.34, 0.74, n2.g) + 0.35*(n3.r - 0.5))*mix(0.5, 1.0, smoothstep(0.45, 0.85, ao))*mix(0.42, 1.0, smoothstep(0.3, 0.85, length(grad)));      // the line is drawn by hand
  float seam = (sv >= 0.0) ? fall(wid - aa, wid + aa, sv) : 0.0;
  float band = 2.2 + 2.6*n2.b;
  float face = sv < -0.05 ? 1.0 : 0.0;
  float faceGold = face*fall(band - 0.5, band + 0.5, -sv + (n2.g - 0.5)*1.3 + (n3.g - 0.5)*0.5);

  float goldMask = max(seam, faceGold)*g;
  if (gilded) {
    float ag = arr + 0.42, gg = smoothstep(ag - 0.05, ag, uGold - 0.02);
    goldMask = gg;
    hot = max(hot, gg*exp(-max(uGold - ag, 0.0)*7.0));
  }
  float hair = (sv >= 0.0 && !gilded) ? (1.0 - g)*fall(0.12, 0.55 + aa, sv) : 0.0;

  // base layers
  vec3 alb; float rough; vec3 F0; float coat = 1.0;
  vec3 Nb = N;
  // glaze: never perfectly flat, so the softboxes wander slightly in it
  vec3 wob = (n1.rgb - 0.5)*0.015 + (n2.gba - 0.5)*0.008 + (n3.gbr - 0.5)*0.003;
  if (face > 0.5) {
    alb = uFace*(0.9 + 0.18*n3.a);
    rough = 0.82;
    F0 = vec3(0.03);
    Nb = normalize(N + (n3.rgb - 0.5)*0.75);
    coat = 0.0;
  } else if (matte) {
    alb = uMatte*(0.96 + 0.06*n3.a);
    rough = 0.58;
    F0 = vec3(0.04);
    Nb = normalize(N + (n3.rgb - 0.5)*0.18);
    coat = 0.0;
  } else {
    alb = uGlaze*(1.0 - 0.02*n1.g);
    alb = mix(alb, uGlazeDeep, (1.0 - ao)*0.42);   // glaze runs thicker in the recesses, and takes the room's colour
    rough = 0.09 + 0.05*n2.r;
    F0 = vec3(0.046);
    Nb = normalize(N + wob);
    // underglaze ink: the markings on the front plate and lid, in Royal Indigo
    float cb = 0.0;
    if (vRestN.z > 0.7 && vRest.z > 139.0) cb = texture(uFront, vec2((vRest.x + 220.0)/440.0, (22.0 - vRest.y)/44.0)).r;
    else if (vRestN.z < -0.7 && vRest.z < ${(SEAL[2] + 1.5).toFixed(1)}) {
      vec2 su = vec2(${SEAL[0].toFixed(1)} - vRest.x, ${SEAL[1].toFixed(1)} - vRest.y)/${SEAL_SIZE.toFixed(1)} + 0.5;
      if (all(greaterThan(su, vec2(0.0))) && all(lessThan(su, vec2(1.0)))) cb = texture(uSeal, su).r;
    }
    alb = mix(alb, uMark*(0.8 + 0.4*n3.b), pow(cb, 0.72)*(0.88 + 0.12*n2.a));
    alb = mix(alb, uHair, hair*0.85);
  }

  { vec3 fn = fwidth(N); rough = clamp(sqrt(rough*rough + min(dot(fn, fn)*0.5, 0.22)), rough, 1.0); }
  vec4 lq = uLightVP*vec4(vWorld, 1.0);
  vec2 gp = goboAt(lq.xy*0.5 + 0.5);
  float sh = shadowAt(vWorld + N*1.8)*gobo(gp);
  float NdV = max(dot(Nb, Vw), 1e-3);

  // porcelain or biscuit
  vec3 F = F0 + (max(vec3(1.0 - rough), F0) - F0)*pow(max(1.0 - NdV, 0.0), 5.0);
  float so = clamp(pow(NdV + ao, exp2(-16.0*rough - 1.0)) - 1.0 + ao, 0.0, 1.0);
  vec3 R = reflect(-Vw, Nb);
  float aoD = mix(0.13, 1.0, pow(ao, 1.2));
  vec3 col = alb*irradiance(Nb, sh)*aoD*(1.0 - F*coat*0.8) + envAll(R, rough, sh)*F*so;
  // a touch of light carried through the body at grazing angles
  col += alb*vec3(1.0, 0.86, 0.72)*0.035*pow(max(1.0 - NdV, 0.0), 2.0)*(1.0 - face);

  // gold
  if (goldMask > 0.001) {
    vec3 Ng = N;
    if (!gilded) {
      float gl = length(grad);
      if (gl > 1e-4 && sv >= 0.0) {
        float x = clamp(sv/wid, 0.0, 0.98);
        float slope = x/sqrt(1.0 - x*x)*0.75;
        Ng = normalize(N + grad/gl*slope);
      }
      Ng = normalize(Ng + (n3.rgb - 0.5)*0.07 + (n2.gba - 0.5)*0.05);
    } else {
      Ng = normalize(N + (n3.rgb - 0.5)*0.05);
    }
    if (face > 0.5 && !gilded) Ng = normalize(N + (n3.rgb - 0.5)*0.10 + (n2.gba - 0.5)*0.14);
    float gr = gilded ? 0.22 : 0.26 + 0.08*n3.a;
    vec3 Rg = reflect(-Vw, Ng);
    float NdVg = max(dot(Ng, Vw), 1e-3);
    vec3 F0g = vec3(1.0, 0.74, 0.29);
    vec3 Fg = F0g + (max(vec3(1.0 - gr), F0g) - F0g)*pow(max(1.0 - NdVg, 0.0), 5.0);
    // gold needs something dark to reflect, as a product photographer would flag it
    vec3 e = envAll(Rg, gr, sh);
    // ...and dark cards at the sides of the set, so flat gold never reflects a flat wall
    float flag = mix(0.5, 1.7, smoothstep(-0.25, 0.55, Rg.y))*(0.62 + 0.62*smoothstep(-0.5, 0.5, sin(Rg.x*4.4 + Rg.z*2.1 + 1.3)));
    float sog = clamp(pow(NdVg + ao, exp2(-16.0*gr - 1.0)) - 1.0 + ao, 0.0, 1.0);
    vec3 gc = (e*flag*1.12 + uGoldBase)*Fg*sog*(0.55 + 0.45*ao)*mix(0.84, 1.14, sh);
    gc += vec3(1.0, 0.82, 0.45)*pow(max(n3.a - 0.84, 0.0)/0.16, 3.0)*0.16*sh;      // flecks in the gold powder
    gc = min(gc*uGoldGain, vec3(1.3, 1.02, 0.56)*uGoldGain);       // a highlight on gold stays gold
    if (!gilded) gc += vec3(0.36, 0.19, 0.04)*uGlow*(0.45 + 0.55*n2.r);       // in the dark, the seams keep a little of the kiln
    col = mix(col, gc, goldMask);
    // molten at the front of the pour, and for a moment when the seams are rejoined
    float glow = max(hot, uHeat)*goldMask;
    col += vec3(2.1, 0.72, 0.09)*glow*(0.55 + 0.45*n2.r);
    if (gilded && uPulse > 0.001) {
      float rr = length(vRest.xy - vec2(0.0, 186.0));
      float ph = fract(uTime/5.5);
      float pk = exp(-pow((rr - (150.0 + ph*330.0))/12.0, 2.0))*step(152.0, rr)*smoothstep(0.0, 0.1, ph)*(1.0 - smoothstep(0.85, 1.0, ph));
      float sw = (vRest.x + vRest.y - 186.0)*0.7071, ph2 = fract(uTime/7.0 + 0.35);
      float shine = exp(-pow((sw - (-260.0 + ph2*640.0))/16.0, 2.0))*(1.0 - step(152.0, rr));
      col += (vec3(2.6, 1.8, 0.7)*pk + vec3(1.4, 1.15, 0.75)*shine*0.55)*uPulse*goldMask;
    }
  }
  if (any(isnan(col)) || any(isinf(col))) col = vec3(0.7);
  col = min(col, vec3(30.0));
  o = vec4(col/(1.0 + max(col.r, max(col.g, col.b))), 1.0);    // averaged across samples in this space, so bright edges stay clean
}`;

const PLAQUE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNor;
layout(location=2) in vec3 aUvr;
uniform mat4 uVP, uModel;
out vec3 vWorld; out vec3 vN; out vec3 vUvr; out float vFront;
void main(){
  vec4 w = uModel*vec4(aPos, 1.0);
  vWorld = w.xyz; vN = mat3(uModel)*aNor; vUvr = aUvr; vFront = step(0.9, aNor.z);
  gl_Position = uVP*w;
}`;

const PLAQUE_SHADE = `
uniform vec3 uEye;
uniform mat4 uLightVP;
uniform highp sampler2DShadow uShadow;
uniform sampler2D uNoise, uCard;
uniform float uShadowR, uGoldGain, uGlow, uFill, uInkOn;
uniform vec3 uGlaze, uMark, uGoldBase;
out vec4 o;
${ENV_GLSL}
${GOBO_GLSL}
const vec2 PD[12] = vec2[](vec2(-.326,-.406),vec2(-.840,-.074),vec2(-.696,.457),vec2(-.203,.621),vec2(.962,-.195),vec2(.473,-.480),vec2(.519,.767),vec2(.185,-.893),vec2(.507,.064),vec2(.896,.412),vec2(-.322,-.933),vec2(-.792,-.598));
float ign(vec2 p){ return fract(52.9829189*fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float shadowAt(vec3 p){
  vec4 q = uLightVP*vec4(p, 1.0);
  vec3 s = q.xyz*0.5 + 0.5;
  if (s.x < 0.0 || s.y < 0.0 || s.x > 1.0 || s.y > 1.0 || s.z > 1.0) return 1.0;
  float a = ign(gl_FragCoord.xy)*6.2832, c = cos(a), n = sin(a);
  mat2 R = mat2(c, n, -n, c);
  float sum = 0.0;
  for (int i = 0; i < 12; i++) sum += texture(uShadow, vec3(s.xy + R*PD[i]*uShadowR, s.z - 0.0012));
  return sum/12.0;
}
vec3 shadePlaque(vec3 world, vec3 N0, vec2 uv, float front, float gilt){
  vec3 Vw = normalize(uEye - world);
  vec3 N = N0;
  vec2 q = uv*vec2(1.5, 1.0);
  vec4 n2 = texture(uNoise, q*1.7), n3 = texture(uNoise, q*11.0);
  vec4 card = texture(uCard, uv);
  float ink = card.r*front*((uv.x > 0.54 && uv.y > 0.36) ? uInkOn : 1.0);
  vec3 alb = uGlaze*(1.0 - 0.02*n2.g);
  alb = mix(alb, uMark*(0.8 + 0.4*n3.b), ink*(0.92 + 0.08*n2.a));
  float rough = 0.13 + 0.05*n2.r;
  vec3 Nb = normalize(N + (n2.rgb - 0.5)*0.012 + (n3.gba - 0.5)*0.003);
  vec4 lq = uLightVP*vec4(world, 1.0);
  vec2 gp = goboAt(lq.xy*0.5 + 0.5);
  float sh = shadowAt(world + N*2.0)*gobo(gp);
  float NdV = max(dot(Nb, Vw), 1e-3);
  vec3 F = vec3(0.046) + (max(vec3(1.0 - rough), vec3(0.046)) - vec3(0.046))*pow(max(1.0 - NdV, 0.0), 5.0);
  vec3 col = alb*(irradiance(Nb, sh) + uFill)*(1.0 - F*0.8) + envAll(reflect(-Vw, Nb), rough, sh)*F*(1.0 - ink*0.8);
  float goldM = max(card.g*front, gilt);
  if (goldM > 0.001) {
    vec3 Ng = normalize(N + (n3.rgb - 0.5)*0.10 + (n2.gba - 0.5)*0.06);
    float gr = 0.26 + 0.08*n3.a;
    vec3 Rg = reflect(-Vw, Ng);
    float NdVg = max(dot(Ng, Vw), 1e-3);
    vec3 F0g = vec3(1.0, 0.74, 0.29);
    vec3 Fg = F0g + (max(vec3(1.0 - gr), F0g) - F0g)*pow(max(1.0 - NdVg, 0.0), 5.0);
    float flag = mix(0.5, 1.7, smoothstep(-0.25, 0.55, Rg.y))*(0.62 + 0.62*smoothstep(-0.5, 0.5, sin(Rg.x*4.4 + Rg.z*2.1 + 1.3)));
    vec3 gc = (envAll(Rg, gr, sh)*flag*1.12 + uGoldBase)*Fg*mix(0.84, 1.14, sh);
    gc = min(gc*uGoldGain, vec3(1.3, 1.02, 0.56)*uGoldGain);
    gc += vec3(0.36, 0.19, 0.04)*uGlow*(0.45 + 0.55*n2.r);
    col = mix(col, gc, goldM);
  }
  if (any(isnan(col)) || any(isinf(col))) col = vec3(0.7);
  return min(col, vec3(30.0));
}`;

const PLAQUE_FS = `#version 300 es
precision highp float; precision highp int;
in vec3 vWorld; in vec3 vN; in vec3 vUvr; in float vFront;
${PLAQUE_SHADE}
void main(){
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 col = shadePlaque(vWorld, N, vUvr.xy, vFront, vUvr.z);
  o = vec4(col/(1.0 + max(col.r, max(col.g, col.b))), 1.0);
}`;

// the same plaque, in pieces: each piece is one cell of a broken pattern, drawn as its own patch
const CELL_GLSL = `
const vec2 GRID = vec2(9.0, 6.0);
vec2 hash22(vec2 p){ vec3 a = fract(p.xyx*vec3(0.1031, 0.1030, 0.0973)); a += dot(a, a.yzx + 33.33); return fract((a.xx + a.yz)*a.zy); }`;

const CELL_VS = `#version 300 es
precision highp float; precision highp int;
uniform mat4 uVP, uModel;
uniform float uDis, uTime;
flat out vec2 vCell; out vec2 vUv; out vec3 vWorld; out vec3 vN;
${CELL_GLSL}
vec3 rotAxis(vec3 v, vec3 k, float a){ float c = cos(a), s = sin(a); return v*c + cross(k, v)*s + k*dot(k, v)*(1.0 - c); }
void main(){
  vec2 cell = vec2(float(gl_InstanceID % 11) - 1.0, float(gl_InstanceID/11) - 1.0);
  vec2 rnd = hash22(cell + 7.0), rn2 = hash22(cell*1.7 + 31.0);
  vec2 seed = (cell + hash22(cell)*0.6 + 0.2)/GRID;
  vec2 cr = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1));
  vec2 uv = (cell - 0.6 + cr*2.2)/GRID;
  vec2 size = vec2(${PW.toFixed(1)}, ${PH.toFixed(1)});
  vec2 lc = vec2(uv.x - 0.5, 0.5 - uv.y)*size;
  vec2 cc = vec2(clamp(seed.x, 0.0, 1.0) - 0.5, 0.5 - clamp(seed.y, 0.0, 1.0))*size;
  // the side nearest the column goes first
  float a = clamp((uDis - (0.16 + 0.44*clamp(seed.x, 0.0, 1.0) + 0.10*rnd.x))/0.30, 0.0, 1.0);
  if (a >= 0.999) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vCell = cell; vUv = uv; vWorld = vec3(0.0); vN = vec3(0.0, 0.0, 1.0); return; }
  float e = a*a*(3.0 - 2.0*a);
  vec3 ax = normalize(vec3(rnd.y - 0.5, rn2.x - 0.5, (rn2.y - 0.5)*0.6));
  float ang = e*(1.6 + 2.2*rnd.x);
  vec3 lp = rotAxis(vec3(lc - cc, 0.0), ax, ang)*(1.0 - 0.72*e);
  vec3 ln = rotAxis(vec3(0.0, 0.0, 1.0), ax, ang);
  vec3 start = (uModel*vec4(cc, 7.0, 1.0)).xyz;
  float th = rnd.x*40.0 + e*2.6 + uTime*0.1;
  float rr = 30.0 + rn2.x*110.0;
  vec3 end = vec3(cos(th)*rr, start.y + (rn2.y - 0.5)*360.0, sin(th)*rr);
  vec3 c = mix(start, end, e) + vec3(sin(rnd.x*50.0), cos(rn2.y*50.0), sin(rn2.x*50.0))*46.0*sin(e*3.14159);
  vec3 w = c + mat3(uModel)*lp;
  vCell = cell; vUv = uv; vWorld = w; vN = mat3(uModel)*ln;
  gl_Position = uVP*vec4(w, 1.0);
}`;

const CELL_FS = `#version 300 es
precision highp float; precision highp int;
flat in vec2 vCell; in vec2 vUv; in vec3 vWorld; in vec3 vN;
uniform float uCrack;
${CELL_GLSL}
${PLAQUE_SHADE}
void main(){
  vec2 x = vUv*GRID, n = floor(x), f = x - n, mg = vec2(0.0), mr = vec2(0.0);
  float md = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j)), r = g + hash22(n + g)*0.6 + 0.2 - f;
    float d = dot(r, r);
    if (d < md) { md = d; mr = r; mg = g; }
  }
  if (any(greaterThan(abs(n + mg - vCell), vec2(0.5)))) discard;
  vec2 lc = abs(vUv - 0.5)*vec2(${PW.toFixed(1)}, ${PH.toFixed(1)}) - vec2(${(PW / 2 - 22).toFixed(1)}, ${(PH / 2 - 22).toFixed(1)});
  float sd = length(max(lc, 0.0)) + min(max(lc.x, lc.y), 0.0) - 22.0;
  if (sd > 0.0) discard;
  float b = 8.0;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(float(i), float(j)), r = g + hash22(n + g)*0.6 + 0.2 - f;
    if (dot(mr - r, mr - r) > 1e-5) b = min(b, dot(0.5*(mr + r), normalize(r - mr)));
  }
  // the gold runs out from where the plaque was struck, then every piece has its gold edge
  float run = 1.0 - smoothstep(uCrack - 0.1, uCrack, distance(vUv*vec2(1.5, 1.0), vec2(0.18, 0.72))/1.5);
  float edge = (1.0 - smoothstep(0.018, 0.03, b))*run;
  float rim = 1.0 - smoothstep(-3.2, -2.2, sd);
  rim = 1.0 - rim;
  vec3 N = normalize(vN);
  float front = step(0.0, dot(N, uEye - vWorld));   // the printed side, whichever way the piece has turned
  if (front < 0.5) N = -N;
  vec3 col = shadePlaque(vWorld, N, vUv, front, max(edge, rim));
  o = vec4(col/(1.0 + max(col.r, max(col.g, col.b))), 1.0);
}`;

const CDUST_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aS;
uniform mat4 uVP, uModel;
uniform float uDis, uPx, uTime;
uniform sampler2D uCard;
uniform vec3 uGlaze, uMark;
out vec3 vC;
void main(){
  float a = clamp((uDis - aS.z*0.55)/0.45, 0.0, 1.0);    // every grain leaves at its own moment
  if (a <= 0.001 || a >= 0.999) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 1.0; vC = vec3(0.0); return; }
  vec4 card = textureLod(uCard, aS.xy, 2.0);
  vec3 start = (uModel*vec4((aS.x - 0.5)*${PW.toFixed(1)}, (0.5 - aS.y)*${PH.toFixed(1)}, 8.0, 1.0)).xyz;
  float th = aS.z*40.0 + a*3.4 + uTime*0.3;
  float rr = 26.0 + aS.z*150.0;
  vec3 end = vec3(cos(th)*rr, start.y + (aS.y - 0.5)*520.0*a, sin(th)*rr);
  float e = a*a*(3.0 - 2.0*a);
  vec3 p = mix(start, end, e) + vec3(sin(aS.z*91.0), cos(aS.z*47.0), sin(aS.z*23.0))*70.0*sin(a*3.14159);
  vC = mix(uGlaze, uMark*2.0, clamp(card.r*1.6, 0.0, 1.0));
  gl_Position = uVP*vec4(p, 1.0);
  gl_PointSize = clamp(1.9*uPx/gl_Position.w, 1.0, 4.0)*(1.0 - a*0.6);
}`;

const DUST_VS = `#version 300 es
precision highp float;
layout(location=0) in vec4 aA;
layout(location=1) in vec3 aB;
uniform mat4 uVP;
uniform float uTime, uSwirl, uPx, uAmt;
uniform vec3 uDustA, uDustB;
out vec3 vC;
void main(){
  if (aB.y > uAmt) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 1.0; vC = vec3(0.0); return; }
  float th = aA.x + uSwirl*(0.4 + 120.0/(aA.y + 80.0)) + uTime*(0.008 + 0.022*aB.z);
  float y = mod(aA.z + uTime*(1.2 + 5.0*aB.x), 1300.0) - 60.0;
  float wob = sin(uTime*0.2 + aB.z*40.0)*14.0;
  vec3 p = vec3(cos(th)*(aA.y + wob), y, sin(th)*(aA.y + wob));
  vC = aB.x > 0.74 ? uDustB : uDustA;
  gl_Position = uVP*vec4(p, 1.0);
  gl_PointSize = clamp(aA.w*uPx/gl_Position.w, 1.0, 6.0);
}`;

const QUAD_VS = `#version 300 es
out vec2 vUv;
void main(){ vec2 p = vec2(float((gl_VertexID & 1) << 2), float((gl_VertexID & 2) << 1)); vUv = p*0.5; gl_Position = vec4(p - 1.0, 1.0, 1.0); }`;

const BG_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform vec3 uEye;
uniform mat4 uInvVP;
uniform float uFloor, uExtent, uLime, uBarLine, uBeamGlow, uTitleA, uTitleWipe;
uniform sampler2D uTitle;
uniform vec4 uTitleRect;
uniform vec3 uTitleInk;
uniform vec2 uRes;
uniform sampler2D uFS, uNoise, uKey;
uniform vec3 uRoom, uShTint, uFloorBeam, uSheen, uFringe, uBounce;
uniform mat4 uLightVP;
${GOBO_GLSL}
// pigment in lime, not paint from a can: it never lies quite even
float lime(vec2 p){ return 1.0 + uLime*((texture(uNoise, p*0.00042).r - 0.5) + (texture(uNoise, p*0.0031).g - 0.5)*0.5); }
void main(){
  vec4 f = uInvVP*vec4(vUv*2.0 - 1.0, 1.0, 1.0);
  vec3 ray = normalize(f.xyz/f.w - uEye);
  vec3 wall = uRoom*lime(ray.xy/(abs(ray.z) + 0.4)*2400.0);
  vec3 col = wall;
  if (ray.y < -0.0005) {
    float t = (uFloor - uEye.y)/ray.y;
    vec3 hit = uEye + ray*t;
    float dist = length(hit.xz);
    float li = lime(hit.xz);
    vec3 fc = uRoom*li;
    vec4 lq = uLightVP*vec4(hit, 1.0);
    vec2 gp = goboAt(lq.xy*0.5 + 0.5);
    vec2 uv = vec2(hit.x, -hit.z)/(2.0*uExtent) + 0.5;
    float win = gobo(gp), key = texture(uKey, uv).r, beam = win*key;
    // sunlight shows the surface: slow clouds in the lime, drifting between yellow and orange
    float cloud = texture(uNoise, hit.xz*0.0011).b*0.6 + texture(uNoise, hit.xz*0.0063).r*0.4;
    vec3 sun = uFloorBeam*(1.0 + uBeamGlow*exp(-dot(hit.xz, hit.xz)/640000.0))*(1.0 + (li - 1.0)*2.2)*(0.9 + 0.2*cloud)*(1.0 - 0.12*dot(gp/uWin.zw, gp/uWin.zw));
    // shadows inside a sunlit room are never empty: the floor throws colour back into them
    vec3 shade = fc + uBounce*exp(-length(max(abs(gp) - uWin.zw, 0.0))/240.0);
    float fr = (1.0 - smoothstep(uWin.z, uWin.z + uSoft, abs(gp.x)))*(1.0 - smoothstep(uWin.w, uWin.w + uSoft, abs(gp.y)));
    fc = mix(shade, sun, beam) + uFringe*mix(fr*(1.0 - fr), win*(1.0 - win), uBarLine)*4.0*key;
    vec4 s = texture(uFS, uv);
    float edge = 1.0 - smoothstep(0.42, 0.5, max(abs(uv.x - 0.5), abs(uv.y - 0.5)));
    float sh = (s.r*0.62 + s.g*0.34)*edge;
    fc = mix(fc, fc*uShTint, sh);
    fc += uSheen*pow(max(dot(reflect(ray, vec3(0.0, 1.0, 0.0)), normalize(vec3(0.32, 0.24, -0.92))), 0.0), 16.0)*(1.0 - sh*0.7);
    col = mix(fc, wall, smoothstep(1500.0, 5200.0, dist));
  }
  if (uTitleA > 0.001) {
    vec2 tq = (gl_FragCoord.xy/uRes - uTitleRect.xy)/uTitleRect.zw;
    if (all(greaterThan(tq, vec2(0.0))) && all(lessThan(tq, vec2(1.0)))) {
      float a = texture(uTitle, vec2(tq.x, 1.0 - tq.y)).a*uTitleA*(1.0 - smoothstep(uTitleWipe - 0.10, uTitleWipe, tq.x));
      vec3 ink = mix(uTitleInk, vec3(1.6, 1.1, 0.42), exp(-pow((tq.x - uTitleWipe + 0.06)/0.045, 2.0))*step(uTitleWipe, 1.08));
      col = mix(col, ink, a);
    }
  }
  o = vec4(col/(1.0 + max(col.r, max(col.g, col.b))), 1.0);
}`;

const KEY_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform mat4 uLightVP;
uniform highp sampler2DShadow uShadow;
uniform float uFloor, uExtent;
const vec2 PD[12] = vec2[](vec2(-.326,-.406),vec2(-.840,-.074),vec2(-.696,.457),vec2(-.203,.621),vec2(.962,-.195),vec2(.473,-.480),vec2(.519,.767),vec2(.185,-.893),vec2(.507,.064),vec2(.896,.412),vec2(-.322,-.933),vec2(-.792,-.598));
void main(){
  vec3 hit = vec3((vUv.x - 0.5)*2.0*uExtent, uFloor, (0.5 - vUv.y)*2.0*uExtent);
  vec3 s = (uLightVP*vec4(hit, 1.0)).xyz*0.5 + 0.5;
  float sum = 12.0;
  if (s.x > 0.0 && s.y > 0.0 && s.x < 1.0 && s.y < 1.0) {
    sum = 0.0;
    for (int i = 0; i < 12; i++) sum += texture(uShadow, vec3(s.xy + PD[i]*0.0085, s.z - 0.0012));
  }
  o = vec4(sum/12.0);
}`;

const FS_OBJ_FS = `#version 300 es
precision highp float;
in vec3 vWorld; out vec4 o;
uniform float uFloor;
void main(){
  float h = vWorld.y - uFloor;
  o = vec4(1.0 - smoothstep(0.0, 46.0, h), exp(-h/520.0), 0.0, 1.0);
}`;

const BLUR_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uT;
uniform vec2 uDir;
uniform float uWideK;
void main(){
  // two widths in one pass: the contact shadow stays close, the room shadow spreads
  float r = 0.0, g = 0.0, wr = 0.0, wg = 0.0;
  for (int i = -8; i <= 8; i++) {
    float t = float(i)/8.0;
    float w = exp(-t*t*2.6);
    r += texture(uT, vUv + uDir*t*2.2).r*w; wr += w;
    g += texture(uT, vUv + uDir*t*uWideK).g*w; wg += w;
  }
  o = vec4(r/wr, g/wg, 0.0, 1.0);
}`;

const DOF_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uHdr;
uniform highp sampler2D uDepth;
uniform vec2 uTexel, uClip;
uniform float uFocus, uAp, uMaxR;
float zOf(vec2 uv){ float d = texture(uDepth, uv).r*2.0 - 1.0; return 2.0*uClip.x*uClip.y/(uClip.y + uClip.x - d*(uClip.y - uClip.x)); }
float coc(float z){ return min(uMaxR, abs(z - uFocus)/max(z, 1.0)*uAp); }
vec3 expand(vec3 c){ return c/max(1.0 - max(c.r, max(c.g, c.b)), 0.03); }
void main(){
  vec3 c = expand(texture(uHdr, vUv).rgb);
  float zc = zOf(vUv);
  float cc = coc(zc);
  vec3 sum = min(c, vec3(4.0)); float wsum = 1.0, near = 0.0;
  const float GA = 2.39996323;
  for (int i = 1; i < 52; i++) {
    float fr = sqrt(float(i)/51.0);
    float r = fr*uMaxR;
    float a = float(i)*GA;
    vec2 q = vUv + vec2(cos(a), sin(a))*r*uTexel;
    float zs = zOf(q);
    float cs = coc(zs);
    bool front = zs < zc - 2.0;
    float reach = front ? cs : min(cs, cc*1.6 + 0.5);
    float w = smoothstep(r - 1.2, r + 1.2, reach + 0.5);
    sum += min(expand(texture(uHdr, q).rgb), vec3(4.0))*w; wsum += w;
    if (front) near += w;
  }
  o = vec4(sum/wsum, max(smoothstep(0.7, 2.6, cc), clamp(near/12.0, 0.0, 1.0)));
}`;

const FILL_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uT;
uniform highp sampler2D uDepth;
uniform vec2 uTexel, uClip;
uniform float uFocus, uAp, uMaxR;
float zOf(vec2 uv){ float d = texture(uDepth, uv).r*2.0 - 1.0; return 2.0*uClip.x*uClip.y/(uClip.y + uClip.x - d*(uClip.y - uClip.x)); }
float coc(float z){ return min(uMaxR, abs(z - uFocus)/max(z, 1.0)*uAp); }
const vec2 D[8] = vec2[](vec2(1.0,0.0),vec2(0.51,0.51),vec2(0.0,1.0),vec2(-0.51,0.51),vec2(-1.0,0.0),vec2(-0.51,-0.51),vec2(0.0,-1.0),vec2(0.51,-0.51));
void main(){
  vec4 c = texture(uT, vUv);
  float cc = coc(zOf(vUv));
  float r = max(cc*0.36, max(c.a - smoothstep(0.7, 2.6, cc), 0.0)*uMaxR*0.26);
  vec3 sum = c.rgb;
  for (int i = 0; i < 8; i++) sum += texture(uT, vUv + D[i]*r*uTexel).rgb;
  o = vec4(sum/9.0, c.a);
}`;

const BRIGHT_FS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform sampler2D uT; uniform float uThresh;
void main(){ vec3 c = texture(uT, vUv).rgb; c /= max(1.0 - max(c.r, max(c.g, c.b)), 0.03); float l = max(c.r, max(c.g, c.b)); float k = max(l - uThresh, 0.0); k = k*k/(k + 0.5); o = vec4(c*(k/max(l, 1e-4)), 1.0); }`;
const BBLUR_FS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform sampler2D uT; uniform vec2 uDir;
void main(){ vec3 s = texture(uT, vUv).rgb*0.2270270270; s += (texture(uT, vUv + uDir*1.3846153846).rgb + texture(uT, vUv - uDir*1.3846153846).rgb)*0.3162162162; s += (texture(uT, vUv + uDir*3.2307692308).rgb + texture(uT, vUv - uDir*3.2307692308).rgb)*0.0702702703; o = vec4(s, 1.0); }`;

const FINAL_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uHdr, uDof, uBloom;
uniform float uDofOn, uGrain, uTime, uVig, uExposure, uBloomAmt, uCA;
uniform vec2 uHalfTexel;
vec3 neutral(vec3 c){
  const float start = 0.76, desat = 0.15;
  float x = min(c.r, min(c.g, c.b));
  float off = x < 0.08 ? x - 6.25*x*x : 0.04;
  c -= off;
  float peak = max(c.r, max(c.g, c.b));
  if (peak < start) return c;
  float d = 1.0 - start;
  float np = 1.0 - d*d/(peak + d - start);
  c *= np/peak;
  float g = 1.0 - 1.0/(desat*(peak - np) + 1.0);
  return mix(c, vec3(np), g);
}
float grain(vec2 p){ vec3 q = fract(vec3(p.xyx)*0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y)*q.z); }
vec3 fetch(vec2 uv){
  vec3 c = texture(uHdr, uv).rgb;
  c /= max(1.0 - max(c.r, max(c.g, c.b)), 0.03);
  if (uDofOn > 0.5) {
    vec2 h = uHalfTexel;
    vec4 d = texture(uDof, uv)*0.36 + (texture(uDof, uv + vec2(h.x, h.y)) + texture(uDof, uv + vec2(-h.x, h.y)) + texture(uDof, uv + vec2(h.x, -h.y)) + texture(uDof, uv + vec2(-h.x, -h.y)))*0.16;
    c = mix(c, d.rgb, d.a);
  }
  return c;
}
void main(){
  vec2 q = vUv - 0.5;
  // a real lens: the colours part a little toward the corners, and what shines bleeds softly
  vec2 off = q*dot(q, q)*uCA*4.0;
  vec3 c = vec3(fetch(vUv + off).r, fetch(vUv).g, fetch(vUv - off).b);
  c += texture(uBloom, vUv).rgb*uBloomAmt;
  c *= 1.0 - uVig*dot(q, q);
  c = neutral(max(c, 0.0)*uExposure);
  c = mix(12.92*c, 1.055*pow(max(c, vec3(0.0031)), vec3(1.0/2.4)) - 0.055, step(0.0031308, c));
  float n = grain(gl_FragCoord.xy + fract(uTime)*97.0) - 0.5;
  o = vec4(c + n*uGrain, 1.0);
}`;

const FLECK_VS = `#version 300 es
precision highp float;
layout(location=0) in vec4 aP;
layout(location=1) in vec3 aR;
layout(location=2) in vec3 aT;
uniform mat4 uVP, uCard; uniform float uTime, uPx, uAmt, uSwirl, uForm, uSink;
uniform vec3 uEye, uFwd;
out vec3 vC; out float vD;
void main(){
  float rr = length(aP.xz), sw = uSwirl*(0.35 + 90.0/(rr + 60.0)) + uTime*0.012;
  float cs = cos(sw), sn = sin(sw);
  float rise = rr < 190.0 ? 15.0 + 22.0*aR.x : 1.2*aR.x;
  vec3 b = vec3(cs*aP.x - sn*aP.z, mod(aP.y + 40.0 + uTime*rise, 1240.0) - 40.0, sn*aP.x + cs*aP.z);
  vec3 p = b + vec3(sin(uTime*0.11 + aR.x*6.28)*9.0, sin(uTime*0.09 + aR.y*6.28)*7.0, cos(uTime*0.10 + aR.z*6.28)*9.0);
  // each fleck has a place in the portrait: they gather into it, hold, and settle into the glaze
  float f = uForm > 0.001 ? smoothstep(0.0, 1.0, clamp((uForm - fract(aR.x*7.0)*0.35)/0.65, 0.0, 1.0)) : 0.0;
  if (f > 0.0) {
    vec3 tp = (uCard*vec4(aT.x, aT.y, aT.z*(1.0 - uSink), 1.0)).xyz;
    vec3 arc = vec3(sin(aR.y*6.28), 0.6 + aR.z, cos(aR.x*6.28))*120.0*sin(f*3.14159);
    p = mix(p, tp, f) + arc*(1.0 - uSink);
  }
  float tw = uTime*(0.4 + aR.y*1.2) + aR.x*40.0;
  vec3 n = normalize(vec3(sin(tw), cos(tw*0.77 + 1.0), sin(tw*0.61 + 2.0)));
  vec3 v = normalize(uEye - p);
  float sp = pow(max(0.0, dot(n, normalize(v + vec3(-0.2, 0.9, 0.35)))), 30.0);
  vC = mix(vec3(0.46, 0.30, 0.07), vec3(0.86, 0.60, 0.20), aR.z) + vec3(5.0, 3.8, 1.7)*sp;
  vC = mix(vC, vec3(0.40, 0.25, 0.06) + vec3(2.2, 1.6, 0.6)*sp, f);
  vD = dot(p - uEye, uFwd);
  gl_Position = uVP*vec4(p, 1.0);
  float show = max(step(0.002, uAmt)*smoothstep(fract(aR.y*13.0) - 0.05, fract(aR.y*13.0) + 0.05, uAmt), f);
  gl_PointSize = mix(clamp(aP.w*1.35*uPx/gl_Position.w, 1.0, uPx/260.0), clamp(2.3*uPx/gl_Position.w, 1.0, 5.0), f)*show*smoothstep(180.0, 340.0, vD)*(1.0 - uSink*f);
}`;
const FLECK_FS = `#version 300 es
precision highp float;
in vec3 vC; out vec4 o;
void main(){ vec2 q = gl_PointCoord - 0.5; if (dot(q, q) > 0.25) discard; o = vec4(vC/(1.0 + max(vC.r, max(vC.g, vC.b))), 1.0); }`;

/* ---------- GL helpers ---------- */
function program(gl, vs, fs) {
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.split('\n').slice(0, 4).join('\n')); return s; };
  const p = gl.createProgram();
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); const name = info.name.replace(/\[0\]$/, ''); u[name] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}
const b64 = (s) => { const bin = atob(s), n = bin.length, a = new Uint8Array(n); for (let i = 0; i < n; i++) a[i] = bin.charCodeAt(i); return a; };

function makeNoise(gl) {
  // four channels of periodic value noise, summed over octaves; it tiles, so it can repeat over any surface
  const S = 256, data = new Uint8Array(S * S * 4);
  let seed = 7;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let ch = 0; ch < 4; ch++) {
    const acc = new Float32Array(S * S);
    let amp = 1, total = 0;
    for (let oct = 0; oct < 5; oct++) {
      const cells = 4 << oct, lat = new Float32Array(cells * cells);
      for (let i = 0; i < lat.length; i++) lat[i] = rnd();
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const fx = x / S * cells, fy = y / S * cells, ix = fx | 0, iy = fy | 0;
        const tx = smooth(fx - ix), ty = smooth(fy - iy);
        const a = lat[iy * cells + ix], b = lat[iy * cells + ((ix + 1) % cells)], c = lat[((iy + 1) % cells) * cells + ix], d = lat[((iy + 1) % cells) * cells + ((ix + 1) % cells)];
        acc[y * S + x] += lerp(lerp(a, b, tx), lerp(c, d, tx), ty) * amp;
      }
      total += amp; amp *= 0.55;
    }
    for (let i = 0; i < S * S; i++) data[i * 4 + ch] = clamp((acc[i] / total - 0.5) * 2.0 + 0.5) * 255;
  }
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, S, S, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  return t;
}

/* ---------- the markings, painted with the page's own fonts ---------- */
function paintMarkings(portX) {
  const ink = '#fff';
  // front plate: 440 x 44 mm
  const fc = document.createElement('canvas'); fc.width = 4096; fc.height = 410;
  const f = fc.getContext('2d');
  const px = 4096 / 440, X = (x) => (x + 220) * px, Y = (y) => (22 - y) * px;
  f.fillStyle = '#000'; f.fillRect(0, 0, fc.width, fc.height);
  f.fillStyle = ink; f.textAlign = 'center'; f.textBaseline = 'middle';
  f.font = '600 30px "Instrument Sans"';
  portX.forEach((x, i) => {
    f.fillText(String(i * 2 + 1), X(x), Y(18.2));
    f.fillText(String(i * 2 + 2), X(x), Y(-18.2));
  });
  f.font = '600 26px "Instrument Sans"';
  [[69, 18.0, '25'], [88, 18.0, '26'], [69, -18.0, '27'], [88, -18.0, '28']].forEach(([x, y, t]) => f.fillText(t, X(x - 3.6), Y(y)));
  f.fillText('CONSOLE', X(122), Y(18.2));
  f.fillText('USB', X(122), Y(-3.2));
  f.textAlign = 'left';
  f.font = '500 italic 74px Fraunces';
  f.fillText('Manaf', X(-213), Y(13.4));
  f.font = '600 28px "Instrument Sans"';
  f.fillText('M5000-24', X(-213), Y(5.2));
  f.font = '600 24px "Instrument Sans"';
  f.fillText('PWR', X(-159.6), Y(11));
  f.fillText('SYS', X(-159.6), Y(3.5));
  f.fillText('FAN', X(-159.6), Y(-4));
  f.fillText('MODE', X(-200.2), Y(-11));
  f.textAlign = 'right';
  f.font = '500 italic 44px Fraunces';
  f.fillText('24-port managed', X(212), Y(11));
  f.font = '600 26px "Instrument Sans"';
  f.fillText('PORCELAIN, GOLD', X(212), Y(3.6));
  // the maker's mark, drawn the way a porcelain backstamp is: lettering on a ring around the name
  const tc = document.createElement('canvas'); tc.width = tc.height = 1024;
  const t = tc.getContext('2d');
  const k = 1024 / SEAL_SIZE, C = 512;
  t.fillStyle = '#000'; t.fillRect(0, 0, 1024, 1024);
  t.fillStyle = ink; t.strokeStyle = ink;
  const ring = (r, w) => { t.lineWidth = w * k; t.beginPath(); t.arc(C, C, r * k, 0, 6.28319); t.stroke(); };
  ring(30.4, 0.62); ring(29.2, 0.2); ring(21.4, 0.26);
  t.textAlign = 'center'; t.textBaseline = 'middle';
  t.font = '600 ' + (3.5 * k) + 'px "Instrument Sans"';
  const line = 'PORCELAIN \u00B7 HANDLE WITH CARE \u00B7 DOHA 2026 \u00B7 ';
  const chars = [...line], widths = chars.map((c) => t.measureText(c).width), total = widths.reduce((a2, b2) => a2 + b2, 0);
  const ringR = 25.2 * k, gapEach = (6.28319 * ringR - total) / chars.length;
  let run = 0;
  chars.forEach((c, i) => {
    const mid = run + widths[i] / 2, ang = mid / (total + gapEach * chars.length) * 6.28319;
    t.save(); t.translate(C, C); t.rotate(ang); t.translate(0, -ringR); t.fillText(c, 0, 0); t.restore();
    run += widths[i] + gapEach;
  });
  t.font = '700 ' + (15.5 * k) + 'px "Aref Ruqaa"';
  t.fillText('\u0645\u0646\u0627\u0641', C, C - 2.4 * k);
  t.font = 'italic 500 ' + (4.0 * k) + 'px Fraunces';
  t.fillText('Manaf', C, C + 12.2 * k);
  return [fc, tc];
}

/* ---------- the plaques: Royal Indigo ink on white, gold along the mends ---------- */
const PLAQUES = [
  { title: 'Manaf', sub: 'COMPUTER ENGINEER  ·  NETWORK SECURITY  ·  EMBEDDED SYSTEMS', art: 'portrait', seed: 7, crack: [0.2, 1.01, -1.2] },
  { title: 'KraftxLab', sub: 'NETWORK ENGINEER  ·  DEC 2025 – PRESENT', art: 'topology', seed: 11 },
  { title: 'Meeza', sub: 'NOC ENGINEER  ·  NOV 2024 – DEC 2025', art: 'ticks', seed: 23 },
  { title: 'Projects', sub: 'FROM HARDWARE PROTOTYPES TO FULL-STACK APPS', art: 'index', seed: 53 },
  { title: 'Skills', sub: 'A LIVE SPECTRUM OF WHAT I WORK WITH', art: 'signal', seed: 61 },
  { title: 'Security', sub: 'DEFENSE IN DEPTH  ·  HANDS-ON SECURITY ENGINEERING', art: 'fort', seed: 37 },
  { title: 'CCNA', sub: 'CISCO CERTIFIED NETWORK ASSOCIATE  ·  2021', art: 'kiln', seed: 41 },
  { title: 'Terminal', sub: 'SSH SESSION  ·  ENCRYPTED, AND CAPTURED', art: 'nmap', seed: 71 },
  { title: 'Packet Inspector', sub: 'CAREER.PCAPNG  ·  FILTER IT LIKE WIRESHARK', art: 'frames', seed: 83 },
];
const MONO = 'ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace';
function paintPlaque(def, k, portrait) {
  const c = document.createElement('canvas'); c.width = PW * k; c.height = PH * k;
  const g = c.getContext('2d');
  let seed = def.seed * 7919 + 13;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const INK = '#f00', GOLD = '#0f0';
  g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'lighter';
  g.scale(k, k);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = INK; g.fillStyle = INK;
  // the printed border
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  g.lineWidth = 0.8; rr(13, 13, PW - 26, PH - 26, 15); g.stroke();
  g.lineWidth = 0.28; rr(16.5, 16.5, PW - 33, PH - 33, 12); g.stroke();
  // the name, the big thing on the card
  g.textBaseline = 'alphabetic';
  g.font = '340 78px "Fraunces Mast"';
  try { g.letterSpacing = '-1.6px'; } catch (e) { /* older browsers just set it tighter */ }
  const fitSize = Math.min(78, 78 * (PW - 76) / g.measureText(def.title).width);
  g.font = '340 ' + fitSize.toFixed(1) + 'px "Fraunces Mast"';
  g.fillText(def.title, 34, 100);
  try { g.letterSpacing = '0.9px'; } catch (e) { /* as above */ }
  g.font = '600 9.4px "Instrument Sans"';
  g.fillText(def.sub, 37, 122);
  try { g.letterSpacing = '0px'; } catch (e) { /* as above */ }
  // the engraving
  const A = { x: 196, y: 138, w: 318, h: 196 };
  g.lineWidth = 0.42;
  if (def.art === 'topology') {
    // a hierarchical network, in the manner of an engraved plan: core, distribution, access
    const tier = [[2, A.y + 18], [4, A.y + 86], [10, A.y + 160]];
    const pos = tier.map(([n, y]) => Array.from({ length: n }, (_, i) => [A.x + (i + 0.5) / n * A.w, y]));
    for (let t = 0; t < 2; t++) pos[t].forEach((a, i) => pos[t + 1].forEach((b, j) => {
      const near = Math.abs((i + 0.5) / pos[t].length - (j + 0.5) / pos[t + 1].length);
      if (near < (t === 0 ? 0.62 : 0.3)) { g.beginPath(); g.moveTo(a[0], a[1]); g.bezierCurveTo(a[0], a[1] + 30, b[0], b[1] - 30, b[0], b[1]); g.stroke(); }
    }));
    pos[0].forEach((a) => { g.beginPath(); g.arc(a[0], a[1], 10, 0, 6.2832); g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fill(); g.restore(); g.lineWidth = 0.9; g.stroke(); g.lineWidth = 0.42; g.beginPath(); g.moveTo(a[0] - 6, a[1]); g.lineTo(a[0] + 6, a[1]); g.moveTo(a[0], a[1] - 6); g.lineTo(a[0], a[1] + 6); g.stroke(); });
    pos[1].forEach((a) => { g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(a[0] - 16, a[1] - 7, 32, 14); g.restore(); g.lineWidth = 0.8; g.strokeRect(a[0] - 16, a[1] - 7, 32, 14); g.lineWidth = 0.42; for (let x = -12; x <= 12; x += 4.8) { g.beginPath(); g.rect(a[0] + x - 1.3, a[1] - 2, 2.6, 4); g.stroke(); } });
    pos[2].forEach((a) => { g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(a[0] - 8, a[1] - 5, 16, 10); g.restore(); g.lineWidth = 0.6; g.strokeRect(a[0] - 8, a[1] - 5, 16, 10); g.lineWidth = 0.42; g.beginPath(); g.moveTo(a[0], a[1] + 5); g.lineTo(a[0], a[1] + 14); g.moveTo(a[0] - 4, a[1] + 14); g.lineTo(a[0] + 4, a[1] + 14); g.stroke(); });
  } else if (def.art === 'portrait') {
    // the portrait, cut as a line engraving, in the same ink as everything else
    const P = 226, px = PW - 20 - P, py = PH - 16 - P;
    if (portrait) {
      const tc = document.createElement('canvas'); tc.width = tc.height = Math.round(P * k);
      const tg = tc.getContext('2d');
      tg.drawImage(portrait, 0, 0, tc.width, tc.height);
      tg.globalCompositeOperation = 'multiply'; tg.fillStyle = '#f00'; tg.fillRect(0, 0, tc.width, tc.height);
      g.drawImage(tc, px, py, P, P);
    }
    g.font = '600 8.6px "Instrument Sans"';
    [['EDUCATION', 'B.Sc. Computer Eng.'], ['UNIVERSITY', "Qatar University '24"], ['LOCATION', 'Doha, Qatar']].forEach(([a, b], i) => {
      const y = 186 + i * 46;
      g.font = '600 8.2px "Instrument Sans"'; g.fillText(a, 37, y);
      g.font = '340 19px "Fraunces Mast"'; g.fillText(b, 36, y + 21);
    });
  } else if (def.art === 'index') {
    // the catalogue of builds, with its dotted leaders
    const list = typeof Inspector !== 'undefined' ? Inspector.CAREER.filter((q) => q.type === 'project' && !q.hidden) : [];
    list.forEach((q, i) => {
      const y = 145 + i * 15.3, name = q.title.replace(' (this portfolio)', '');
      g.font = '340 12.6px "Fraunces Mast"'; g.fillText(name, A.x, y);
      const w = g.measureText(name).width;
      g.font = '600 7px ' + MONO; g.textAlign = 'right'; g.fillText(q.proto, A.x + A.w, y); g.textAlign = 'left';
      g.lineWidth = 0.34; g.setLineDash([0.7, 2.4]); g.beginPath(); g.moveTo(A.x + w + 5, y - 1); g.lineTo(A.x + A.w - 20, y - 1); g.stroke(); g.setLineDash([]);
    });
  } else if (def.art === 'signal') {
    // the skills as a spectrum, with The Signal, the M-shaped waveform, running above
    const data = typeof SKILLS !== 'undefined' ? SKILLS : [];
    const top = 140, sh = 46;
    g.lineWidth = 0.26;
    for (let x = 0; x <= 12; x++) { g.beginPath(); g.moveTo(A.x + x / 12 * A.w, top); g.lineTo(A.x + x / 12 * A.w, top + sh); g.stroke(); }
    for (let y = 0; y <= 4; y++) { g.beginPath(); g.moveTo(A.x, top + y / 4 * sh); g.lineTo(A.x + A.w, top + y / 4 * sh); g.stroke(); }
    const M2 = (u) => (Math.abs(u) > 1.2 ? 0 : Math.exp(-((u + 0.42) ** 2) * 26) + Math.exp(-((u - 0.42) ** 2) * 26) - 0.75 * Math.exp(-(u ** 2) * 34));
    g.lineWidth = 1.1; g.beginPath();
    for (let x = 0; x <= A.w; x += 1.5) { const y = top + sh / 2 - sh * 0.34 * (0.14 * Math.sin(x * 0.09) + 1.1 * M2((x - A.w * 0.5) / 44)); if (x) g.lineTo(A.x + x, y); else g.moveTo(A.x + x, y); }
    g.stroke();
    g.font = '600 6.4px ' + MONO; g.fillText('CH1  THE SIGNAL', A.x + 3, top + sh - 3);
    const base = 318, area = 104, gap = 7, bw = (A.w - gap * (data.length - 1)) / (data.length || 1), SEG = 16;
    data.forEach((d, i) => {
      const x = A.x + i * (bw + gap), lit = Math.round(d.p / 100 * SEG);
      for (let q = 0; q < SEG; q++) {
        const y = base - (q + 1) * area / SEG;
        if (q < lit) g.fillRect(x, y, bw, area / SEG - 1.5);
        else { g.lineWidth = 0.22; g.strokeRect(x, y, bw, area / SEG - 1.5); }
      }
      g.font = '600 7px ' + MONO; g.textAlign = 'center';
      g.fillText(d.k, x + bw / 2, base + 10);
      g.textAlign = 'left';
    });
  } else if (def.art === 'nmap') {
    // what the terminal answers
    const ports = typeof NMAP_PORTS !== 'undefined' ? NMAP_PORTS : [];
    const x = 190, lh = 14.8;
    let y = 150;
    const line = (t, w) => { g.font = (w || '400') + ' 8px ' + MONO; g.fillText(t, x, y); y += lh; };
    line('manaf@os:~$ nmap manaf', '700');
    line('Starting Nmap 7.95 · scanning manaf (10.24.0.1)');
    line('Host is up (0.0004s latency).');
    line('PORT      STATE    SERVICE     VERSION', '700');
    ports.forEach(([a, b, c0, d]) => line(a.padEnd(10) + b.padEnd(9) + c0.padEnd(12) + d));
    line('manaf@os:~$ _', '700');
  } else if (def.art === 'frames') {
    // career.pcapng, as printed
    const list = typeof Inspector !== 'undefined' ? Inspector.CAREER.filter((q) => !q.hidden).slice(0, 13) : [];
    const x0 = 176, W2 = 338, top = 136, rh = 11.8, cols = [0, 20, 52, 122];
    g.font = '700 6.8px ' + MONO;
    ['No.', 'Proto', 'Destination', 'Info'].forEach((h, i) => g.fillText(h, x0 + cols[i] + 2, top));
    g.lineWidth = 0.5; g.beginPath(); g.moveTo(x0, top + 3.4); g.lineTo(x0 + W2, top + 3.4); g.stroke();
    list.forEach((q, i) => {
      const y = top + 13 + i * rh, sel = q.id === 'kraftxlab';
      if (sel) { g.fillStyle = INK; g.fillRect(x0, y - 8.6, W2, rh); g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; }
      g.font = '400 6.6px ' + MONO;
      const info = q.title + ' · ' + q.org;
      [String(i + 1), q.proto, q.host, info.length > 44 ? info.slice(0, 43) + '…' : info].forEach((t, c0) => g.fillText(t, x0 + cols[c0] + 2, y));
      if (sel) g.restore();
    });
    g.fillStyle = INK;
    g.font = '400 6px ' + MONO;
    ['0000  02 6b 72 61 66 74 2a 02  4d 41 4e 41 46 08 00 45   .kraft*.MANAF..E', '0010  00 d4 1c 7a 40 00 40 06  00 00 0a 18 00 01 0a 22   ...z@.@........"', '0020  3f 91 c4 11 01 bb 2d 0e  91 a7 00 00 00 01 50 18   ?.....-.......P.'].forEach((t, i) => g.fillText(t, x0 + 2, 310 + i * 9.5));
  } else if (def.art === 'ticks') {
    // exactly 5,000 marks, one for each ticket
    const cols = 100, rows = 50, W = 318, cw = W / cols, ch = 190 / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = A.x + (i + 0.5) * cw + (rnd() - 0.5) * 0.5, y = A.y + (j + 0.5) * ch, a = (rnd() - 0.5) * 0.5, h = ch * (0.32 + rnd() * 0.12);
      g.lineWidth = 0.34 + rnd() * 0.3;
      g.beginPath(); g.moveTo(x - Math.sin(a) * h, y - Math.cos(a) * h); g.lineTo(x + Math.sin(a) * h, y + Math.cos(a) * h); g.stroke();
    }
  } else if (def.art === 'fort') {
    // a redoubt, as the old fortification plans drew them
    const cx = A.x + A.w * 0.54, cy = A.y + A.h * 0.5;
    const star = (R, r, n, rot) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * 6.2832, q = i % 2 ? r : R; const px = cx + Math.cos(a) * q, py = cy + Math.sin(a) * q; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); };
    for (let q = 0; q < 34; q++) { const a = q / 34 * 6.2832; g.lineWidth = 0.3; g.beginPath(); g.moveTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80); g.lineTo(cx + Math.cos(a) * 98, cy + Math.sin(a) * 98); g.stroke(); }
    g.lineWidth = 1.0; star(84, 58, 5, -1.5708); g.stroke();
    g.lineWidth = 0.42; star(76, 52, 5, -1.5708); g.stroke(); star(68, 46, 5, -1.5708); g.stroke();
    g.lineWidth = 0.7; star(34, 22, 5, -1.5708 + 0.628); g.stroke();
    g.lineWidth = 0.42; g.beginPath(); g.arc(cx, cy, 11, 0, 6.2832); g.stroke();
    for (let i = 0; i < 5; i++) { const a = -1.5708 + i / 5 * 6.2832; g.setLineDash([2.2, 2.4]); g.beginPath(); g.moveTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12); g.lineTo(cx + Math.cos(a) * 130, cy + Math.sin(a) * 130); g.stroke(); g.setLineDash([]); }
    g.font = 'italic 400 9px Fraunces'; g.textAlign = 'center';
    [['monitor', -1.5708], ['alert', -0.31], ['correlate', 0.94], ['enforce', 2.2], ['detect', 3.46]].forEach(([t, a]) => g.fillText(t, cx + Math.cos(a) * 112, cy + Math.sin(a) * 112 + 3));
    g.font = 'italic 400 13px Fraunces'; g.textAlign = 'left'; g.fillText('Redoubt', A.x - 2, A.y + A.h - 2);
    g.textAlign = 'left';
  } else if (def.art === 'kiln') {
    // fired, and still in the kiln
    const x = A.x + 68, top = A.y + 22;
    g.font = 'italic 400 15px Fraunces'; g.fillText('In the kiln', x, top);
    g.lineWidth = 0.42; g.beginPath(); g.moveTo(x, top + 7); g.lineTo(x + 232, top + 7); g.stroke();
    g.font = '340 25px Fraunces';
    [['ISC2 SSCP', 'Systems Security Certified Practitioner'], ['CCNP SCOR', '350-701, Security Core'], ['HTB CDSA', 'Certified Defensive Security Analyst']].forEach(([a, b], i) => {
      const y = top + 34 + i * 49;
      g.font = '340 25px Fraunces'; g.fillText(a, x, y);
      g.font = '500 8.6px "Instrument Sans"'; g.fillText(b, x, y + 13.5);
      g.lineWidth = 0.3; g.beginPath(); g.moveTo(x, y + 21); g.lineTo(x + 232, y + 21); g.stroke();
    });
  } else {
    // circuit traces, routed the way a board is, with the parts from the bench along them
    const labels = ['ESP32-C6', 'MPU6050', 'MAX30102', 'L298N', 'Raspberry Pi', 'TF Lite', 'TDS, pH', 'GSR'];
    const row = (i) => A.y + 8 + i * 15;
    for (let i = 0; i < 13; i++) {
      let x = A.x + 4, y = row(i);
      g.lineWidth = 0.42 + (i % 4 === 0 ? 0.4 : 0);
      g.beginPath(); g.moveTo(x, y);
      for (let t = 0; t < 7; t++) {
        const run = 16 + rnd() * 40, d = (rnd() - 0.5) > 0 ? 1 : -1, j = 6 + rnd() * 10;
        x += run; if (x > A.x + A.w - 16) break; g.lineTo(x, y);
        if (rnd() > 0.45 && y + d * j > A.y && y + d * j < A.y + A.h - 6) { x += j; y += d * j; g.lineTo(x, y); }
      }
      g.stroke();
      g.beginPath(); g.arc(x, y, 1.9, 0, 6.2832); g.stroke();
    }
    g.font = '600 7.4px "Instrument Sans"';
    labels.forEach((t, i) => { const x = A.x + 12 + (i % 4) * 78, y = A.y + 34 + Math.floor(i / 4) * 92; const w = g.measureText(t).width + 8; g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(x - 4, y - 8.5, w, 12); g.restore(); g.lineWidth = 0.5; g.strokeRect(x - 4, y - 8.5, w, 12); g.fillText(t, x, y); });
  }
  // the mend: a crack that has been rejoined with gold, drawn by hand
  g.strokeStyle = GOLD;
  const crack = (x, y, ang, n, w) => {
    let px = x, py = y;
    for (let i = 0; i < n; i++) {
      ang += (rnd() - 0.5) * 0.9;
      const st = 5 + rnd() * 13, qx = px + Math.cos(ang) * st, qy = py + Math.sin(ang) * st;
      g.lineWidth = w * (0.7 + rnd() * 0.75);
      g.beginPath(); g.moveTo(px, py); g.lineTo(qx, qy); g.stroke();
      px = qx; py = qy;
      if (px < -4 || py < -4 || px > PW + 4 || py > PH + 4) break;
      if (rnd() < 0.09 && n > 8) crack(px, py, ang + (rnd() > 0.5 ? 1 : -1) * (0.7 + rnd() * 0.6), Math.floor(n * 0.35), w * 0.7);
    }
  };
  if (def.crack) crack(PW * def.crack[0], PH * def.crack[1], def.crack[2], 30, 1.5);
  else crack(PW * (0.84 + rnd() * 0.1), -2, 1.65 + rnd() * 0.3, 44, 1.5);
  return c;
}

/* ---------- page furniture ---------- */
const THEME_KEY = 'manaf-mended-room';
const lightsBtn = $('#lights');
function paintTheme() {
  const night = root.dataset.theme === 'night';
  lightsBtn.textContent = night ? 'Lights on' : 'Lights off';
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = night ? '#0D0C0B' : '#D3CCBE';
}
paintTheme();

const canvas = $('#scene');
const chapters = $$('.chapter');
const panels = chapters.map((c) => c.querySelector('.panel'));

let vw = document.documentElement.clientWidth, vh = innerHeight, dpr = 1, wide = true;
let ys = [], lastY = 0;

/* ---------- renderer ---------- */
const NEAR = 40, FAR = 9000;
class Scene {
  constructor(data) {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) throw new Error('no float render targets');
    gl.getExtension('OES_texture_float_linear');
    this.gl = gl;
    this.d = data;
    this.N = data.shards.length;
    this.obj = program(gl, COMMON_VS, OBJ_FS);
    this.depth = program(gl, COMMON_VS, `#version 300 es
      precision highp float; in vec3 vWorld; out vec4 o; void main(){ o = vec4(1.0); }`);
    this.fsObj = program(gl, COMMON_VS, FS_OBJ_FS);
    this.bg = program(gl, QUAD_VS, BG_FS);
    this.blur = program(gl, QUAD_VS, BLUR_FS);
    this.dof = program(gl, QUAD_VS, DOF_FS);
    this.fill = program(gl, QUAD_VS, FILL_FS);
    this.final = program(gl, QUAD_VS, FINAL_FS);
    this.bright = program(gl, QUAD_VS, BRIGHT_FS);
    this.bblur = program(gl, QUAD_VS, BBLUR_FS);
    this.key = program(gl, QUAD_VS, KEY_FS);
    this.fleck = program(gl, FLECK_VS, FLECK_FS);
    this.plaque = program(gl, PLAQUE_VS, PLAQUE_FS);
    this.plaqueDepth = program(gl, PLAQUE_VS, `#version 300 es
      precision highp float; in vec3 vWorld; out vec4 o; void main(){ o = vec4(1.0); }`);
    this.cells = program(gl, CELL_VS, CELL_FS);
    this.cdust = program(gl, CDUST_VS, FLECK_FS);
    this.dust = program(gl, DUST_VS, FLECK_FS);
    this.quadVao = gl.createVertexArray();

    // mesh
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data.vb, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.UNSIGNED_SHORT, true, 16, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribIPointer(1, 1, gl.UNSIGNED_SHORT, 16, 6);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.BYTE, true, 16, 8);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 3, gl.UNSIGNED_BYTE, true, 16, 10);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.ib, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    this.ni = data.ni;

    // shard transforms
    this.xfData = new Float32Array(this.N * 3 * 4);
    this.xf = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.xf);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 3, this.N, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this.noise = makeNoise(gl);
    this.front = this.front2 = null;

    // shadow map
    this.SM = innerWidth < 900 ? 1024 : 2048;
    this.smTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.smTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, this.SM, this.SM);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.smFb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.smTex, 0);
    gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);

    // floor shadow
    this.FS = 512; this.extent = 1500;
    this.fs = [this.colorTarget(this.FS, this.FS, gl.RGBA8, true), this.colorTarget(this.FS, this.FS, gl.RGBA8, true), this.colorTarget(this.FS, this.FS, gl.RGBA8, true)];
    this.fsDepth = gl.createRenderbuffer();
    this.KS = innerWidth < 900 ? 512 : 1024;
    this.fk = [this.colorTarget(this.KS, this.KS, gl.RGBA8, true), this.colorTarget(this.KS, this.KS, gl.RGBA8, true)];

    // flecks of gold: exactly 5,000, one for each ticket. A good part of them rise up the column.
    const F = new Float32Array(5000 * 7);
    let seed = 90210; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 5000; i++) {
      const a = rnd() * 6.2832, r = rnd() < 0.42 ? 18 + rnd() * rnd() * 170 : 190 + Math.pow(rnd(), 0.7) * 820, y = rnd() * 1200;
      F.set([Math.cos(a) * r, y, Math.sin(a) * r, 1.3 + rnd() * rnd() * 3.0, rnd(), rnd(), rnd()], i * 7);
    }
    this.fleckVao = gl.createVertexArray();
    gl.bindVertexArray(this.fleckVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, F, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 16);
    this.faceBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.faceBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(5000 * 3), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 12, 0);
    gl.bindVertexArray(null);

    // the plaque: a rounded slab with a soft edge, gilded around its rim
    const mesh = (() => {
      const hw = PW / 2, hh = PH / 2, ht = PT / 2, rc = 22, seg = 10, ring = [];
      for (let q = 0; q < 4; q++) for (let i = 0; i <= seg; i++) {
        const a = (q + i / seg) * Math.PI / 2, cx = (q === 0 || q === 3 ? 1 : -1) * (hw - rc), cy = (q < 2 ? 1 : -1) * (hh - rc);
        ring.push([cx, cy, Math.cos(a), Math.sin(a)]);
      }
      const v = [], ix = [], add = (x, y, z, nx, ny, nz, rim) => { v.push(x, y, z, nx, ny, nz, x / PW + 0.5, 0.5 - y / PH, rim); return v.length / 9 - 1; };
      // the profile from the middle of the front face, round the edge, to the back: radius offset, z, normal mix, rim
      const b = 3.2, prof = [[-b, ht, 0, 0], [-b * 0.62, ht - 0.12, 0.33, 1], [-b * 0.25, ht - 0.8, 0.66, 1], [0, ht - b, 1, 1], [0, -ht + b, 1, 1], [-b * 0.25, -ht + 0.8, 1.34, 1], [-b, -ht, 2, 0]];
      const start = v.length / 9, M2 = ring.length;
      prof.forEach(([o, z, m, rim]) => ring.forEach(([cx, cy, ca, sa]) => {
        const r = rc + o, ang = m * Math.PI / 2, nr = Math.sin(ang), nz = Math.cos(ang);
        add(cx + ca * r, cy + sa * r, z, ca * nr, sa * nr, nz, rim);
      }));
      for (let p = 0; p < prof.length - 1; p++) for (let i = 0; i < M2; i++) {
        const a = start + p * M2 + i, c = start + p * M2 + (i + 1) % M2, d = start + (p + 1) * M2 + i, e = start + (p + 1) * M2 + (i + 1) % M2;
        ix.push(a, d, c, c, d, e);
      }
      const front = add(0, 0, ht, 0, 0, 1, 0), back = add(0, 0, -ht, 0, 0, -1, 0);
      for (let i = 0; i < M2; i++) {
        ix.push(front, start + i, start + (i + 1) % M2);
        ix.push(back, start + (prof.length - 1) * M2 + (i + 1) % M2, start + (prof.length - 1) * M2 + i);
      }
      return { v: new Float32Array(v), ix: new Uint16Array(ix) };
    })();
    this.pVao = gl.createVertexArray();
    gl.bindVertexArray(this.pVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, mesh.v, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 36, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 36, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 36, 24);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.ix, gl.STATIC_DRAW);
    this.pCount = mesh.ix.length;

    // the grains a plaque turns into
    const small = innerWidth < 900;
    this.nGrain = small ? 5000 : 14000;
    const G = new Float32Array(this.nGrain * 3);
    for (let i = 0; i < this.nGrain; i++) G.set([rnd(), rnd(), rnd()], i * 3);
    this.gVao = gl.createVertexArray();
    gl.bindVertexArray(this.gVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, G, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);

    // porcelain dust and specks of ink, hanging around the column
    this.nDust = small ? 9000 : 24000;
    const D = new Float32Array(this.nDust * 7);
    for (let i = 0; i < this.nDust; i++) {
      const r = 40 + Math.pow(rnd(), 1.5) * 1250;
      D.set([rnd() * 6.2832, r, rnd() * 1300, 0.7 + rnd() * rnd() * 2.0, rnd(), rnd(), rnd()], i * 7);
    }
    this.dVao = gl.createVertexArray();
    gl.bindVertexArray(this.dVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, D, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 16);
    gl.bindVertexArray(null);

    this.cards = [];
    this.titleTex = null;
    this.W = 0; this.H = 0;
    this.dirty = true;
  }

  setCards(list) {
    const gl = this.gl;
    this.cards = list.map((c) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const ext = gl.getExtension('EXT_texture_filter_anisotropic');
      if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
      return t;
    });
    this.dirty = true;
  }

  // where each of the 5,000 flecks goes to make the portrait, in the card's own coordinates
  setFace(img) {
    const gl = this.gl, S = 165, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, S, S);
    const px = g.getImageData(0, 0, S, S).data, cand = [], wts = [];
    let total = 0;
    for (let i = 0; i < S * S; i++) { const v = px[i * 4]; if (v > 60) { cand.push(i); total += v; wts.push(total); } }
    if (cand.length < 50) return;
    let seed = 1234; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const T = new Float32Array(5000 * 3), P = 226, px0 = PW - 20 - P, py0 = PH - 16 - P;
    for (let k = 0; k < 5000; k++) {
      const r = rnd() * total; let lo = 0, hi = wts.length - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (wts[m] < r) lo = m + 1; else hi = m; }
      const i = cand[lo], u = ((i % S) + rnd()) / S, v = (Math.floor(i / S) + rnd()) / S;
      T[k * 3] = px0 + u * P - PW / 2; T[k * 3 + 1] = PH / 2 - (py0 + v * P); T[k * 3 + 2] = PT / 2 + 1.5 + rnd() * 2.5;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.faceBuf);
    gl.bufferData(gl.ARRAY_BUFFER, T, gl.STATIC_DRAW);
    this.hasFace = true;
  }

  setTitle(c) {
    const gl = this.gl;
    if (!this.titleTex) this.titleTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.titleTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.dirty = true;
  }

  colorTarget(w, h, internal, linear) {
    const gl = this.gl, tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, internal, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fb, w, h };
  }

  setMarkings(front, top) {
    const gl = this.gl;
    const up = (c) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const ext = gl.getExtension('EXT_texture_filter_anisotropic');
      if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
      return t;
    };
    // the canvases are drawn with +y (and +z) running down the image, matching how the shader looks them up
    this.frontTex = up(front); this.sealTex = up(top);
    this.dirty = true;
  }

  resize(w, h, ratio) {
    const gl = this.gl, W = Math.max(2, Math.round(w * ratio)), H = Math.max(2, Math.round(h * ratio));
    if (W === this.W && H === this.H) return;
    this.W = W; this.H = H;
    canvas.width = W; canvas.height = H;
    const del = (t) => { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); } };
    del(this.hdr); del(this.half); del(this.half2);
    if (this.depthTex) { gl.deleteTexture(this.depthTex); gl.deleteFramebuffer(this.depthFb); }
    if (this.msFb) { gl.deleteFramebuffer(this.msFb); gl.deleteRenderbuffer(this.msColor); gl.deleteRenderbuffer(this.msDepth); }
    // not every GPU can multisample a float target; the list says what this one offers
    let samples = 0;
    const offered = gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA16F, gl.SAMPLES);
    if (offered) for (const v of offered) if (v <= 4 && v > samples) samples = v;
    this.msColor = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.msColor);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA16F, W, H);
    this.msDepth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.msDepth);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, W, H);
    this.msFb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.msFb);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.msColor);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.msDepth);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('render target incomplete');
    this.hdr = this.colorTarget(W, H, gl.RGBA16F, true);
    this.half = this.colorTarget(Math.ceil(W / 2), Math.ceil(H / 2), gl.RGBA16F, true);
    this.half2 = this.colorTarget(Math.ceil(W / 2), Math.ceil(H / 2), gl.RGBA16F, true);
    if (this.bloomA) { del(this.bloomA); del(this.bloomB); }
    this.bloomA = this.colorTarget(Math.ceil(W / 4), Math.ceil(H / 4), gl.RGBA16F, true);
    this.bloomB = this.colorTarget(Math.ceil(W / 4), Math.ceil(H / 4), gl.RGBA16F, true);
    this.depthTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.depthTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, W, H);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.depthFb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTex, 0);
    this.dirty = true;
  }

  bindXf(prog) {
    const gl = this.gl, d = this.d;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.xf);
    gl.uniform1i(prog.u.uXf, 0);
    gl.uniform3fv(prog.u.uLo, d.lo);
    gl.uniform3fv(prog.u.uHi, d.hi);
  }

  draw(s) {
    const gl = this.gl, W = this.W, H = this.H;
    gl.bindTexture(gl.TEXTURE_2D, this.xf);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 3, this.N, gl.RGBA, gl.FLOAT, this.xfData);

    // 1. shadow map, from the key light
    const L = s.env.BC[0];
    const lightDir = [L[0], L[1], L[2]];
    const lc = [0, 120, 0];
    const lEye = V.add(lc, V.mul(lightDir, 1500));
    const lView = M.look(lEye, lc, Math.abs(lightDir[1]) > 0.95 ? [0, 0, 1] : [0, 1, 0]);
    const lProj = M.ortho(-900, 900, -900, 900, 300, 2800);
    const lightVP = M.mul(lProj, lView);
    const fs = this.fs;
    const still = s.still && this.shadowsDone;
    this.shadowsDone = !!s.still;
    if (!still) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFb);
    gl.viewport(0, 0, this.SM, this.SM);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.6, 3.0);
    gl.useProgram(this.depth.p);
    this.bindXf(this.depth);
    gl.uniformMatrix4fv(this.depth.u.uVP, false, lightVP);
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.ni, gl.UNSIGNED_INT, 0);
    if (s.plaques.length) {
      gl.disable(gl.CULL_FACE);
      gl.useProgram(this.plaqueDepth.p);
      gl.uniformMatrix4fv(this.plaqueDepth.u.uVP, false, lightVP);
      gl.bindVertexArray(this.pVao);
      for (const q of s.plaques) if (q.d < 0.5) { gl.uniformMatrix4fv(this.plaqueDepth.u.uModel, false, q.model); gl.drawElements(gl.TRIANGLES, this.pCount, gl.UNSIGNED_SHORT, 0); }
      gl.enable(gl.CULL_FACE);
      gl.bindVertexArray(this.vao);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);

    // 2. floor shadow: seen from straight above, kept soft
    gl.bindFramebuffer(gl.FRAMEBUFFER, fs[0].fb);
    gl.viewport(0, 0, this.FS, this.FS);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND); gl.blendEquation(gl.MAX); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.fsObj.p);
    this.bindXf(this.fsObj);
    const E = this.extent;
    const top = M.mul(M.ortho(-E, E, -E, E, 0, 4000), M.look([0, 2000, 0], [0, 0, 0], [0, 0, -1]));
    gl.uniformMatrix4fv(this.fsObj.u.uVP, false, top);
    gl.uniform1f(this.fsObj.u.uFloor, this.d.floor);
    gl.drawElements(gl.TRIANGLES, this.ni, gl.UNSIGNED_INT, 0);
    gl.disable(gl.BLEND); gl.blendEquation(gl.FUNC_ADD);
    gl.bindVertexArray(this.quadVao);
    gl.useProgram(this.blur.p);
    gl.uniform1i(this.blur.u.uT, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fs[0].tex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fs[1].fb);
    gl.uniform2f(this.blur.u.uDir, 2.4 / this.FS, 0);
    gl.uniform1f(this.blur.u.uWideK, 11.0 * 2.4 / 2.2);
    // r spreads by uDir*2.2, g by uDir*uWideK
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindTexture(gl.TEXTURE_2D, fs[1].tex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fs[2].fb);
    gl.uniform2f(this.blur.u.uDir, 0, 2.4 / this.FS);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // the sun's shadow on the floor: worked out once over the whole floor, then blurred, so it stays smooth
    const fk = this.fk;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fk[0].fb);
    gl.viewport(0, 0, this.KS, this.KS);
    gl.useProgram(this.key.p);
    gl.uniformMatrix4fv(this.key.u.uLightVP, false, lightVP);
    gl.uniform1f(this.key.u.uFloor, this.d.floor);
    gl.uniform1f(this.key.u.uExtent, this.extent);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.smTex); gl.uniform1i(this.key.u.uShadow, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.useProgram(this.blur.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(this.blur.u.uWideK, 1.0);
    gl.bindTexture(gl.TEXTURE_2D, fk[0].tex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fk[1].fb);
    gl.uniform2f(this.blur.u.uDir, 1.3 / this.KS, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindTexture(gl.TEXTURE_2D, fk[1].tex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fk[0].fb);
    gl.uniform2f(this.blur.u.uDir, 0, 1.3 / this.KS);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // 3. the scene, into a multisampled linear target; alpha carries view depth for the lens
    const view = M.look(s.eye, s.tgt, s.up || [0, 1, 0]);
    const aspect = W / H;
    const proj = M.persp(s.fov, aspect, NEAR, FAR, s.shift[0], s.shift[1]);
    const vp = M.mul(proj, view);
    const fwd = V.norm(V.sub(s.tgt, s.eye));
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.msFb);
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
    gl.enable(gl.CULL_FACE);

    const O = this.obj;
    gl.useProgram(O.p);
    this.bindXf(O);
    gl.uniformMatrix4fv(O.u.uVP, false, vp);
    gl.uniform3fv(O.u.uEye, s.eye);
    gl.uniform3fv(O.u.uImpact, this.d.impact);
    gl.uniformMatrix4fv(O.u.uLightVP, false, lightVP);
    gl.uniform1f(O.u.uGold, s.gold);
    gl.uniform1f(O.u.uHeat, s.heat);
    gl.uniform1f(O.u.uPulse, s.pulse || 0);
    gl.uniform1f(O.u.uTime, s.time);
    gl.uniform1f(O.u.uShadowR, 3.8 / 1800);
    gl.uniform1f(O.u.uGoldGain, s.env.goldGain);
    gl.uniform1f(O.u.uGlow, s.env.glow);
    for (const k of ['glaze', 'glazeDeep', 'face', 'matte', 'mark', 'hair', 'goldBase']) gl.uniform3fv(O.u['u' + k[0].toUpperCase() + k.slice(1)], s.env[k]);
    gl.uniform1f(O.u.uSoft, s.env.soft);
    gl.uniform4fv(O.u.uWin, s.win);
    this.bindEnv(O, s.env);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.smTex); gl.uniform1i(O.u.uShadow, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.noise); gl.uniform1i(O.u.uNoise, 2);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.frontTex); gl.uniform1i(O.u.uFront, 3);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, this.sealTex); gl.uniform1i(O.u.uSeal, 4);
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.ni, gl.UNSIGNED_INT, 0);
    gl.disable(gl.CULL_FACE);

    const px = H / (2 * Math.tan(s.fov / 2));
    // the plaques
    if (s.plaques.length) {
      const setup = (Pq) => {
        gl.useProgram(Pq.p);
        gl.uniformMatrix4fv(Pq.u.uVP, false, vp);
        gl.uniform3fv(Pq.u.uEye, s.eye);
        gl.uniformMatrix4fv(Pq.u.uLightVP, false, lightVP);
        gl.uniform1f(Pq.u.uShadowR, 3.8 / 1800);
        gl.uniform1f(Pq.u.uGoldGain, s.env.goldGain);
        gl.uniform1f(Pq.u.uGlow, s.env.glow);
        gl.uniform1f(Pq.u.uFill, s.env.plaqueFill);
        gl.uniform1f(Pq.u.uInkOn, 1);
        gl.uniform3fv(Pq.u.uGlaze, s.env.glaze);
        gl.uniform3fv(Pq.u.uMark, s.env.mark);
        gl.uniform3fv(Pq.u.uGoldBase, s.env.goldBase);
        gl.uniform1f(Pq.u.uSoft, s.env.soft);
        gl.uniform4fv(Pq.u.uWin, s.win);
        this.bindEnv(Pq, s.env);
        gl.uniform1i(Pq.u.uShadow, 1);
        gl.uniform1i(Pq.u.uNoise, 2);
        gl.uniform1i(Pq.u.uCard, 5);
      };
      // whole
      if (s.plaques.some((q) => q.d <= 0.001)) {
        setup(this.plaque);
        gl.bindVertexArray(this.pVao);
        for (const q of s.plaques) {
          if (q.d > 0.001) continue;
          gl.uniformMatrix4fv(this.plaque.u.uModel, false, q.model);
          gl.uniform1f(this.plaque.u.uInkOn, q.ink === undefined ? 1 : q.ink);
          gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, this.cards[q.i]);
          gl.drawElements(gl.TRIANGLES, this.pCount, gl.UNSIGNED_SHORT, 0);
        }
      }
      // in pieces
      if (s.plaques.some((q) => q.d > 0.001 && q.d < 0.999)) {
        const Ce = this.cells;
        setup(Ce);
        gl.uniform1f(Ce.u.uTime, s.time);
        gl.bindVertexArray(this.quadVao);
        for (const q of s.plaques) {
          if (q.d <= 0.001 || q.d >= 0.999) continue;
          gl.uniformMatrix4fv(Ce.u.uModel, false, q.model);
          gl.uniform1f(Ce.u.uDis, q.d);
          gl.uniform1f(Ce.u.uCrack, clamp(q.d / 0.16) * 1.15);
          gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, this.cards[q.i]);
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 88);
        }
      }
      // ...and what they turn into
      const Gr = this.cdust;
      gl.useProgram(Gr.p);
      gl.uniformMatrix4fv(Gr.u.uVP, false, vp);
      gl.uniform1f(Gr.u.uPx, px);
      gl.uniform1f(Gr.u.uTime, s.time);
      gl.uniform3fv(Gr.u.uGlaze, s.env.glaze);
      gl.uniform3fv(Gr.u.uMark, s.env.mark);
      gl.uniform1i(Gr.u.uCard, 5);
      gl.bindVertexArray(this.gVao);
      for (const q of s.plaques) {
        if (q.d <= 0.001 || q.d >= 0.999) continue;
        gl.uniformMatrix4fv(Gr.u.uModel, false, q.model);
        gl.uniform1f(Gr.u.uDis, q.d);
        gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, this.cards[q.i]);
        gl.drawArrays(gl.POINTS, 0, this.nGrain);
      }
    }

    // dust
    if (s.dust > 0.002) {
      const Du = this.dust;
      gl.useProgram(Du.p);
      gl.uniformMatrix4fv(Du.u.uVP, false, vp);
      gl.uniform1f(Du.u.uTime, s.time);
      gl.uniform1f(Du.u.uSwirl, s.swirl);
      gl.uniform1f(Du.u.uPx, px);
      gl.uniform1f(Du.u.uAmt, s.dust);
      gl.uniform3fv(Du.u.uDustA, s.env.dustA);
      gl.uniform3fv(Du.u.uDustB, s.env.dustB);
      gl.bindVertexArray(this.dVao);
      gl.drawArrays(gl.POINTS, 0, this.nDust);
    }

    // flecks
    if (s.flecks > 0.002) {
      gl.useProgram(this.fleck.p);
      gl.uniformMatrix4fv(this.fleck.u.uVP, false, vp);
      gl.uniform1f(this.fleck.u.uTime, s.time);
      gl.uniform1f(this.fleck.u.uSwirl, s.swirl);
      gl.uniform1f(this.fleck.u.uAmt, s.flecks);
      gl.uniform1f(this.fleck.u.uPx, H / (2 * Math.tan(s.fov / 2)));
      gl.uniform3fv(this.fleck.u.uEye, s.eye);
      gl.uniform3fv(this.fleck.u.uFwd, fwd);
      const fc = s.face || { form: 0, sink: 0 };
      gl.uniform1f(this.fleck.u.uForm, this.hasFace ? fc.form : 0);
      gl.uniform1f(this.fleck.u.uSink, fc.sink);
      if (fc.model) gl.uniformMatrix4fv(this.fleck.u.uCard, false, fc.model);
      gl.bindVertexArray(this.fleckVao);
      gl.drawArrays(gl.POINTS, 0, 5000);
    }

    // background last, behind everything
    gl.useProgram(this.bg.p);
    gl.depthMask(false);
    gl.bindVertexArray(this.quadVao);
    gl.uniform3fv(this.bg.u.uEye, s.eye);
    gl.uniformMatrix4fv(this.bg.u.uInvVP, false, M.invert(vp));
    gl.uniform1f(this.bg.u.uFloor, this.d.floor);
    gl.uniform1f(this.bg.u.uExtent, this.extent);
    gl.uniform3fv(this.bg.u.uRoom, s.env.room);
    gl.uniform3fv(this.bg.u.uShTint, s.env.shTint);
    gl.uniform1f(this.bg.u.uLime, s.env.lime);
    gl.uniform3fv(this.bg.u.uSheen, s.env.sheen);
    gl.uniform3fv(this.bg.u.uFloorBeam, s.env.floorBeam);
    gl.uniform3fv(this.bg.u.uFringe, s.env.fringe);
    gl.uniform1f(this.bg.u.uBarLine, s.env.barLine);
    gl.uniform1f(this.bg.u.uBeamGlow, s.env.beamGlow);
    gl.uniform1f(this.bg.u.uSoft, s.env.soft);
    gl.uniform3fv(this.bg.u.uBounce, s.env.bounce);
    gl.uniform2f(this.bg.u.uRes, W, H);
    gl.uniform1f(this.bg.u.uTitleA, this.titleTex ? s.titleA : 0);
    gl.uniform1f(this.bg.u.uTitleWipe, s.titleWipe === undefined ? 2 : s.titleWipe);
    gl.uniform4fv(this.bg.u.uTitleRect, s.titleRect);
    gl.uniform3fv(this.bg.u.uTitleInk, s.env.titleInk);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.titleTex); gl.uniform1i(this.bg.u.uTitle, 3);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.noise); gl.uniform1i(this.bg.u.uNoise, 2);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fs[2].tex); gl.uniform1i(this.bg.u.uFS, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.fk[0].tex); gl.uniform1i(this.bg.u.uKey, 1);
    gl.uniformMatrix4fv(this.bg.u.uLightVP, false, lightVP);
    gl.uniform4fv(this.bg.u.uWin, s.win);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);
    gl.disable(gl.DEPTH_TEST);

    // 4. resolve
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.msFb);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.hdr.fb);
    gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);

    // 5. lens
    const dofOn = s.ap > 0.001 && this.useDof !== false;
    if (dofOn) {
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.depthFb);
      gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.DEPTH_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.half.fb);
      gl.viewport(0, 0, this.half.w, this.half.h);
      gl.useProgram(this.dof.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.hdr.tex); gl.uniform1i(this.dof.u.uHdr, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.depthTex); gl.uniform1i(this.dof.u.uDepth, 1);
      gl.uniform2f(this.dof.u.uClip, NEAR, FAR);
      gl.uniform2f(this.dof.u.uTexel, 1 / this.half.w, 1 / this.half.h);
      gl.uniform1f(this.dof.u.uFocus, s.focus);
      // aperture is given as a fraction of image height, so it looks the same at any resolution
      gl.uniform1f(this.dof.u.uAp, s.ap * this.half.h);
      const maxR = Math.min(this.half.h * 0.028, 26);
      gl.uniform1f(this.dof.u.uMaxR, maxR);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.half2.fb);
      const L2 = this.fill;
      gl.useProgram(L2.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.half.tex); gl.uniform1i(L2.u.uT, 0);
      gl.uniform1i(L2.u.uDepth, 1);
      gl.uniform2f(L2.u.uClip, NEAR, FAR);
      gl.uniform2f(L2.u.uTexel, 1 / this.half.w, 1 / this.half.h);
      gl.uniform1f(L2.u.uFocus, s.focus);
      gl.uniform1f(L2.u.uAp, s.ap * this.half.h);
      gl.uniform1f(L2.u.uMaxR, maxR);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // 5b. bloom: what shines, spread softly
    {
      const A = this.bloomA, Bq = this.bloomB;
      gl.bindVertexArray(this.quadVao);
      gl.bindFramebuffer(gl.FRAMEBUFFER, A.fb); gl.viewport(0, 0, A.w, A.h);
      gl.useProgram(this.bright.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.hdr.tex); gl.uniform1i(this.bright.u.uT, 0);
      gl.uniform1f(this.bright.u.uThresh, 1.15);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.useProgram(this.bblur.p); gl.uniform1i(this.bblur.u.uT, 0);
      for (const step of [1, 2.2]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, Bq.fb); gl.bindTexture(gl.TEXTURE_2D, A.tex); gl.uniform2f(this.bblur.u.uDir, step / A.w, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, A.fb); gl.bindTexture(gl.TEXTURE_2D, Bq.tex); gl.uniform2f(this.bblur.u.uDir, 0, step / A.h); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }

    // 6. to the screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    const F = this.final;
    gl.useProgram(F.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.hdr.tex); gl.uniform1i(F.u.uHdr, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.half2.tex); gl.uniform1i(F.u.uDof, 1);
    gl.uniform1f(F.u.uDofOn, dofOn ? 1 : 0);
    gl.uniform2f(F.u.uHalfTexel, 1 / this.half.w, 1 / this.half.h);
    gl.uniform1f(F.u.uGrain, s.env.grain);
    gl.uniform1f(F.u.uTime, s.time);
    gl.uniform1f(F.u.uVig, s.env.vig);
    gl.uniform1f(F.u.uExposure, s.env.exposure);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.bloomA.tex); gl.uniform1i(F.u.uBloom, 2);
    gl.uniform1f(F.u.uBloomAmt, s.env.bloom);
    gl.uniform1f(F.u.uCA, s.env.ca);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.activeTexture(gl.TEXTURE0);
    this.lastVP = vp;
    this.lightVP = lightVP;
    this.dirty = false;
  }

  bindEnv(O, e) {
    const gl = this.gl;
    gl.uniform4fv(O.u.uBC, e.BCflat);
    gl.uniform4fv(O.u.uBU, e.BUflat);
    gl.uniform4fv(O.u.uBV, e.BVflat);
    gl.uniform3fv(O.u.uBL, e.BLflat);
    gl.uniform3fv(O.u.uSky, e.sky);
    gl.uniform3fv(O.u.uWall, e.wall);
    gl.uniform3fv(O.u.uGround, e.ground);
  }
}

/* ---------- colour and light: one table for each room ---------- */
function softbox(dir, uHalf, vHalf, color, omega, roll = 0) {
  const c = V.norm(dir);
  let u = V.norm(V.cross(Math.abs(c[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0], c));
  let v = V.cross(c, u);
  if (roll) { const cs = Math.cos(roll), sn = Math.sin(roll); const nu = V.add(V.mul(u, cs), V.mul(v, sn)); v = V.add(V.mul(u, -sn), V.mul(v, cs)); u = nu; }
  return { C: [c[0], c[1], c[2], omega], U: [u[0], u[1], u[2], uHalf], V: [v[0], v[1], v[2], vHalf], L: color };
}
// What the renderer must hold for the screen to show exactly this colour: the tone curve and sRGB, run backwards.
function neutralJS(c) {
  const x = Math.min(c[0], c[1], c[2]), off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  let o = c.map((v) => v - off);
  const peak = Math.max(o[0], o[1], o[2]);
  if (peak < 0.76) return o;
  const d = 0.24, np = 1 - d * d / (peak + d - 0.76), g = 1 - 1 / (0.15 * (peak - np) + 1);
  o = o.map((v) => v * np / peak);
  return o.map((v) => v + (np - v) * g);
}
function hold(hex) {
  const t = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  let c = t.slice();
  for (let i = 0; i < 90; i++) { const o = neutralJS(c); c = c.map((v, j) => Math.max(0, v + (t[j] - o[j]) * 0.9)); }
  return c;
}
const DAY = {
  boxes: [
    softbox([-0.62, 0.72, 0.42], 0.20, 0.26, [6.4, 5.95, 5.15], 0.135),    // low sun, through the window
    softbox([-1.0, 0.34, 0.32], 0.11, 1.05, [7.5, 7.4, 7.2], 0.02),
    softbox([1.0, 0.42, 0.12], 0.26, 0.95, [2.8, 2.75, 2.7], 0.05),
    softbox([0.24, 0.34, 1.0], 1.0, 0.30, [1.6, 1.56, 1.48], 0.07),
    softbox([0.309, 0.22, -0.951], 0.085, 0.42, [3.8, 3.75, 3.65], 0.012),
    softbox([0.43, 0.2, -0.90], 0.022, 0.42, [3.2, 3.15, 3.05], 0.004),
  ],
  sky: [0.38, 0.365, 0.34], wall: [0.42, 0.40, 0.365], ground: [0.60, 0.565, 0.51],
  soft: 22, barLine: 1, beamGlow: 0,
  room: [0.585, 0.545, 0.485], shTint: [0.34, 0.31, 0.27],
  floorBeam: [0.80, 0.70, 0.55], lime: 0.03, sheen: [0, 0, 0], fringe: [0, 0, 0], bounce: [0, 0, 0],
  exposure: 1, grain: 0.012, vig: 0.16, goldGain: 1, glow: 0, bloom: 0.5, ca: 0.0028, goldBase: [0.10, 0.075, 0.04],
  glaze: [0.925, 0.905, 0.862], glazeDeep: [0.70, 0.745, 0.79],
  face: [0.835, 0.795, 0.725], matte: [0.86, 0.835, 0.785], mark: [0.0176, 0.0027, 0.0844], hair: [0.20, 0.17, 0.15],   // mark: Royal Indigo, #240952
  plaqueFill: 0, titleInk: hold('#240952'), dustA: [0.80, 0.77, 0.70], dustB: [0.84, 0.80, 0.70],
};
const NIGHT = {
  ...DAY,
  boxes: [
    softbox([-0.62, 0.72, 0.42], 0.20, 0.26, [3.5, 3.75, 4.3], 0.17),    // the same window, by moonlight
    softbox([-1.0, 0.25, 0.22], 0.07, 0.95, [1.6, 1.6, 1.7], 0.012),
    softbox([1.0, 0.36, 0.05], 0.12, 0.8, [1.1, 1.05, 1.0], 0.014),
    softbox([0.24, 0.34, 1.0], 1.0, 0.20, [0.13, 0.12, 0.11], 0.05),
    softbox([0.309, 0.22, -0.951], 0.06, 0.42, [2.0, 1.9, 1.8], 0.004),
    softbox([0.43, 0.2, -0.90], 0.018, 0.42, [1.8, 1.7, 1.6], 0.002),
  ],
  sky: [0.030, 0.031, 0.036], wall: [0.024, 0.024, 0.026], ground: [0.018, 0.017, 0.016],
  room: [0.0135, 0.0128, 0.0122], shTint: [0.22, 0.21, 0.20], floorBeam: [0.085, 0.083, 0.09], lime: 0.05,
  vig: 0.5, goldGain: 2.7, glow: 1, bloom: 0.9, ca: 0.004,
  plaqueFill: 0.5, titleInk: hold('#EFECE5'), dustA: [0.42, 0.42, 0.44], dustB: [0.30, 0.28, 0.40],
};
function buildEnv(k) {
  // k: 0 the room by day, 1 by night
  const boxes = DAY.boxes.map((b, i) => softboxMix(b, NIGHT.boxes[i], k));
  const e = {
    BC: boxes.map((b) => b.C), BCflat: new Float32Array(boxes.flatMap((b) => b.C)),
    BUflat: new Float32Array(boxes.flatMap((b) => b.U)), BVflat: new Float32Array(boxes.flatMap((b) => b.V)),
    BLflat: new Float32Array(boxes.flatMap((b) => b.L)),
  };
  for (const key of Object.keys(DAY)) {
    if (key === 'boxes') continue;
    const a = DAY[key], b = NIGHT[key];
    e[key] = Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k);
  }
  return e;
}
function softboxMix(a, b, k) {
  const mixN = (p, q) => { const v = V.norm(V.mix(p, q, k)); return [v[0], v[1], v[2], lerp(p[3], q[3], k)]; };
  return { C: mixN(a.C, b.C), U: mixN(a.U, b.U), V: mixN(a.V, b.V), L: V.mix(a.L, b.L, k) };
}

/* ---------- the break: where every piece goes ---------- */
function plan(data) {
  const N = data.shards.length;
  let seed = 4242;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const I = data.impact;
  const out = [];
  for (let i = 0; i < N; i++) {
    const s = data.shards[i], c = s.c, ext = s.ext;
    const size = Math.hypot(ext[0], ext[1], ext[2]);
    const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), r5 = rnd();
    const d = V.sub(c, I), dist = V.len(d);
    const axis = V.norm([r2 - 0.5, r3 - 0.5, r4 - 0.5]);
    let T, delay = clamp(dist / 520) * 0.40 + r1 * 0.05, spin;
    if (s.kind === 'm') {
      // the M comes out whole, and hangs in the middle of it all
      T = [16, 330, 150]; delay = 0.26; spin = 0.38;
    } else {
      const away = V.norm([d[0] + (r2 - 0.5) * 80, d[1] + (r3 - 0.5) * 80, 0.001]);
      const push = s.kind === 'trace' ? 120 + 120 * r3 : (140 + 200 * Math.pow(1 - clamp(dist / 440), 1.3)) * (0.72 + 0.56 * r2);
      T = [c[0] * 1.3 + away[0] * push, 205 + (c[1] - 190) * 1.2 + away[1] * push * 0.75, (r4 - 0.45) * (s.kind === 'trace' ? 380 : 560)];
      T[1] = clamp(T[1], 48, 480);
      spin = lerp(0.42, 2.1, clamp(1 - size / 150)) * (r5 > 0.5 ? 1 : -1) * (0.7 + 0.6 * r2);
    }
    const C0 = [0, 186, 0], o0 = V.norm(V.add(V.sub(c, C0), [(r3 - 0.5) * 120, (r4 - 0.5) * 120, 90 + r5 * 140]));
    const io = V.mul(o0, s.kind === 'm' ? 520 : s.kind === 'trace' ? 260 + 200 * r2 : 240 + 320 * r1);
    const tl = s.kind === 'm' ? 2.15 : s.kind === 'trace' ? 2.35 + 0.35 * r3 : 0.3 + 1.55 * clamp(dist / 480) + 0.12 * r5;
    out.push({ io, tl, dur: s.kind === 'm' ? 0.9 : 1.05, ia: V.norm([r5 - 0.5, r1 - 0.5, r2 - 0.5]), iang: (1.6 + 2.4 * r4) * (r3 > 0.5 ? 1 : -1), c, size, T, delay, axis, spin, kind: s.kind, wob: [r1 * 6.28, r2 * 6.28, r3 * 6.28], wf: 0.12 + r4 * 0.16, amp: lerp(9, 3, clamp(size / 200)),
      push: [0, 0, 0], vel: [0, 0, 0], p: 0, out: s.kind === 'shard' ? Q.axis(V.norm([r3 - 0.5, r4 - 0.5, r1 - 0.5]), 0.0026 + r5 * 0.0056) : [0, 0, 0, 1] });
  }
  // the one piece with the name: the piece of the back that carries the mark
  let seal = null, best = 1e9;
  out.forEach((s, i) => {
    const d = data.shards[i];
    if (d.kind !== 'shard' || Math.abs(d.c[0] - SEAL[0]) > d.ext[0] / 2 || Math.abs(d.c[1] - SEAL[1]) > d.ext[1] / 2) return;
    const dd = Math.hypot(d.c[0] - SEAL[0], d.c[1] - SEAL[1]);
    if (dd < best) { best = dd; seal = s; }
  });
  if (seal) {
    seal.hero = 'seal'; seal.spin = 0; seal.amp = 2.5; seal.T = [40, 360, -60];
    seal.anchor = { c: 2, off: [-214, -70, 100], scale: 1.15, q: Q.mul(Q.axis([1, 0, 0], 0.18), Q.axis([0, 1, 0], Math.PI - 0.3)), pivot: V.sub(SEAL, seal.c) };
  }
  // the column: everything stacked in a slow spiral around the middle of the room
  out.forEach((s, k) => {
    const r1 = rnd(), r2 = rnd();
    s.spA = k * 2.39996;
    s.spY = 40 + 1160 * ((k * 0.61803 + r1 * 0.04) % 1);
    s.spR = 22 + 62 * Math.sqrt(r2) + Math.min(s.size * 0.12, 36);
  });
  return out;
}

// where a plaque is, for a given place along the walk
function plaqueFrame(c, sc) {
  const rest = wide ? REST : 0, R = wide ? 560 : 400;
  const phi = rest + (c - sc) * STEP;
  const yaw = phi * 0.55 + state.smx * 0.05;
  const pitch = -0.13 + state.smy * 0.03;
  const roll = [0.018, -0.014, 0.012, -0.016, 0.014, -0.012, 0.016, -0.014, 0.012][c - FIRST];
  const bob = reduced ? 0 : Math.sin(state.time * 0.3 + c) * 4;
  return M.trs([R * Math.sin(phi), 420 + bob, R * Math.cos(phi)], yaw, pitch, roll);
}
// 0 whole, 1 gone. It assembles as it swings into view, and comes apart crossing the column.
function plaqueGone(c, sc) {
  const start = Math.max(c - 1.55, 1.22);
  const inn = 1 - smooth((sc - start) / 0.5);
  const out = smooth((sc - (c + 0.12)) / 0.44);
  return Math.max(inn, out);
}

/* ---------- camera shots, one for each stop along the page ---------- */
function shots(P) {
  // on a phone the object centres itself in whatever room the words leave on each chapter
  const room = (i) => {
    if (wide) return null;
    const p = panels[i];
    if (i === 0) { const h = $('#h1'), n = $('.intro'); return [0, 1 - (h.offsetTop + h.offsetHeight + n.offsetTop) / vh]; }
    const c = p.querySelector('.col') || p.querySelector('h2');
    if (p.classList.contains('top')) return [0, -(c.offsetTop + c.offsetHeight) / vh];
    return [0, 1 - c.offsetTop / vh];
  };
  const sh = (i, x, y = 0) => room(i) || [x, y];
  // the ring of plaques: the camera mostly holds still, and the ring turns
  // (the amount of dust is the same on every stop, so it never pops)
  const ring = (i, dx, dy, flecks, dust) => (wide
    ? { eye: [dx, 500 + dy, 2100], tgt: [dx * 0.25, 420, 0], fov: 24, shift: [-0.04, 0], ap: 0.010, focus: 1625, e: 1, flecks, dust, win: [500, 150, 596, 842] }
    : { eye: [dx * 0.4, 520 + dy * 0.5, 1560], tgt: [0, 420, 0], fov: 24, shift: sh(i, 0, 0), ap: 0.008, focus: 1160, e: 1, flecks, dust, win: [80, 240, 596, 842] });
  return [
    // whole, mended
    { eye: wide ? [-648, 639, 2292] : [-376, 486, 1330], tgt: wide ? [0, 351, 0] : [0, 300, 0], fov: 21, shift: sh(0, 0, -0.07), ap: 0, focus: wide ? 2400 : 1400, e: 0, flecks: 0.05, dust: 0.1 },
    // it comes apart
    { eye: [-520, 600, 1860], tgt: [0, 205, 0], fov: 25, shift: sh(1, 0, 0.10), ap: 0.014, focus: 1880, e: 1, flecks: 0.3, dust: 0.4 },
    ring(2, -36, 10, 0.5, 0.5),
    ring(3, -40, 0, 0.5, 0.5),
    ring(4, 30, 26, 1, 0.5),
    ring(5, -24, -14, 0.5, 0.5),
    ring(6, 20, 14, 0.5, 0.5),
    ring(7, -24, -18, 0.5, 0.5),
    ring(8, 36, 16, 0.5, 0.5),
    ring(9, -30, -10, 0.5, 0.5),
    ring(10, 24, 12, 0.5, 0.5),
    // mended again, from low and close
    { eye: [520, 360, 1700], tgt: [0, 196, 0], fov: 21, shift: sh(11, 0, -0.40), ap: 0.006, focus: 1800, e: 0, flecks: 0, dust: 0.1 },
  ];
}

/* ---------- start ---------- */
const state = { y: scrollY, build: reduced ? 99 : -0.7, gold: reduced ? 2 : -0.2, intro: !reduced, mx: 0, my: 0, smx: 0, smy: 0, time: 0, room: root.dataset.theme === 'night' ? 1 : 0 };
let scene = null, P = null, SHOTS = null, envCache = null, envK = -1;
let fps = { acc: 0, n: 0, tier: 0 };

function metrics() {
  vw = document.documentElement.clientWidth; vh = innerHeight;
  wide = vw >= 900;
  const pixels = vw * vh;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (!wide) dpr = Math.min(dpr, 1.6);
  const cap = fps.tier === 0 ? 4.6e6 : fps.tier === 1 ? 3.0e6 : 1.8e6;
  if (pixels * dpr * dpr > cap) dpr = Math.sqrt(cap / pixels);
  canvas.style.width = vw + 'px'; canvas.style.height = vh + 'px';
  if (scene) scene.resize(vw, vh, dpr);
  ys = chapters.map((c) => c.offsetTop + Math.max(0, c.offsetHeight - vh) / 2);
  ys[0] = 0;
  lastY = ys[ys.length - 1];
  if (scene && P) { SHOTS = shots(P); paintTitle(); }
}

const WIN0 = [0, 0, 596, 842];
// the name is drawn in the room, behind the object, so the switch and its pieces pass in front of it
const title = { on: false, rect: [0, 0, 1, 1] };
function paintTitle() {
  const h = $('#h1');
  title.on = false;
  root.classList.toggle('masthead', !!(scene && wide));
  root.style.removeProperty('--h1');
  if (!scene || !wide) return;
  const G = parseFloat(getComputedStyle(root).getPropertyValue('--gutter')) || 0;
  const pad = Math.max(20, Math.min(0.036 * vw, 64));
  const m = document.createElement('canvas').getContext('2d');
  m.font = '360 100px "Fraunces Mast"';
  try { m.letterSpacing = '-2.8px'; } catch (e) { /* older browsers just set it a little wider */ }
  const per = m.measureText(h.textContent).width / 100;
  const size = Math.min((vw - pad * 2) / per, vh * 0.31);
  root.style.setProperty('--h1', size.toFixed(1) + 'px');
  const base = vh * 0.388;
  const up = size * 0.95, down = size * 0.32, ratio = scene.W / vw;
  const c = document.createElement('canvas');
  c.width = Math.ceil(vw * ratio); c.height = Math.ceil((up + down) * ratio);
  const g = c.getContext('2d');
  g.scale(ratio, ratio);
  g.font = '360 ' + size + 'px "Fraunces Mast"';
  try { g.letterSpacing = (-0.028 * size).toFixed(2) + 'px'; } catch (e) { /* as above */ }
  g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
  g.fillText(h.textContent, pad, up);
  scene.setTitle(c);
  title.rect = [0, 1 - (base + down) / vh, 1, (up + down) / vh];
  title.on = true;
  root.style.setProperty('--h1-top', (base - up).toFixed(1) + 'px');
}
function solveWalk(y) {
  let i = 0;
  while (i < ys.length - 1 && y >= ys[i + 1]) i++;
  if (i >= ys.length - 1) return { i: ys.length - 1, j: ys.length - 1, e: 0 };
  const s = (y - ys[i]) / Math.max(1, ys[i + 1] - ys[i]);
  const hold = 0.16;
  return { i, j: i + 1, e: smoother((s - hold) / (1 - 2 * hold)), s };
}

// Catmull-Rom through the shots, so the camera never turns a corner
const crom = (a, b, c, d, t) => {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
};
const crom3 = (a, b, c, d, t) => [crom(a[0], b[0], c[0], d[0], t), crom(a[1], b[1], c[1], d[1], t), crom(a[2], b[2], c[2], d[2], t)];

function frame(now) {
  if (!scene) return;
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - (frame.t || now)) / 1000); frame.t = now;
  if (!state.frozen) state.time += dt;
  const k = reduced ? 1 : 1 - Math.exp(-dt * 6.5);
  state.y += (scrollY - state.y) * k;
  if (Math.abs(scrollY - state.y) < 0.2) state.y = scrollY;
  state.smx += (state.mx - state.smx) * (1 - Math.exp(-dt * 3.2));
  state.smy += (state.my - state.smy) * (1 - Math.exp(-dt * 3.2));
  const wantRoom = root.dataset.theme === 'night' ? 1 : 0;
  state.room += (wantRoom - state.room) * (1 - Math.exp(-dt * 4.5));
  if (Math.abs(wantRoom - state.room) < 0.002) state.room = wantRoom;
  if (state.intro) { state.gold += dt / 2.9; if (state.gold > 1.4) { state.gold = 1.4; state.intro = false; } }
  if (!state.frozen && state.build < 99) state.build += dt;

  const w = solveWalk(state.y);
  const S = SHOTS, a = S[Math.max(0, w.i - 1)], b = S[w.i], c = S[w.j], d = S[Math.min(S.length - 1, w.j + 1)];
  const t = reduced ? (w.e < 0.5 ? 0 : 1) : w.e;
  if (reduced) canvas.style.opacity = (1 - Math.sin(w.e * Math.PI)).toFixed(3);
  let eye = crom3(a.eye, b.eye, c.eye, d.eye, t);
  let tgt = crom3(a.tgt, b.tgt, c.tgt, d.tgt, t);
  const fit = Math.max(1, 1.5 / (vw / vh));              // a narrow window sees the same width, with more above and below
  const fov = 2 * Math.atan(Math.tan(lerp(b.fov, c.fov, t) * Math.PI / 360) * fit);
  const shift = [lerp(b.shift[0], c.shift[0], smooth(t)), lerp(b.shift[1], c.shift[1], smooth(t))];
  const E = lerp(b.e, c.e, t);
  const ap = lerp(b.ap, c.ap, smooth(t));
  const flecks = lerp(b.flecks, c.flecks, smooth(t));
  const dust = lerp(b.dust, c.dust, smooth(t));
  const sc = w.i + t;                                // where we are along the walk, in chapters
  const swirl = sc * STEP * 0.5;
  const toColumn = smooth(sc - 1);                   // the cloud gathers into the column
  const turn = -sc * STEP * 0.42 + (reduced ? 0 : state.time * 0.035);
  const plaques = [];
  const frames = {};
  for (let i = 0; i < PLAQUES.length; i++) {
    const ch = i + FIRST, gone = plaqueGone(ch, sc);
    const model = plaqueFrame(ch, sc);
    frames[ch] = model;
    if (gone < 0.999) plaques.push({ i, model, d: gone });
  }
  const wa = b.win || WIN0, wb = c.win || WIN0, win = wa.map((v, i) => lerp(v, wb[i], smooth(t)));
  // the seams glow only in the last moment before the pieces meet, and then cool
  let heat = (w.i !== w.j && c === S[S.length - 1] && !reduced) ? smooth((0.34 - E) / 0.2) * (1 - smooth((t - 0.8) / 0.2)) * 0.34 : 0;

  if (w.i === 0 && w.j === 1 && !reduced) heat = Math.max(heat, Math.sin(Math.PI * clamp(E / 0.16)) * 0.42);

  // the portrait: the flecks gather into the face as the first card arrives, then sink into its glaze
  const face = reduced || !scene.hasFace ? { form: 0, sink: 1 } : { form: smooth((sc - 1.0) / 0.55) * (1 - smooth((sc - 2.1) / 0.3)), sink: smooth((sc - 1.62) / 0.18) * (1 - smooth((sc - 2.1) / 0.25)) };
  face.model = plaqueFrame(2, sc);
  for (const q of plaques) if (q.i === 0) q.ink = face.sink;

  // a small sway of the camera with the hand
  if (!reduced) {
    const fwd0 = V.norm(V.sub(tgt, eye)), right = V.norm(V.cross(fwd0, [0, 1, 0])), up0 = V.cross(right, fwd0);
    const dist = V.len(V.sub(tgt, eye));
    eye = V.add(eye, V.add(V.mul(right, state.smx * dist * 0.022), V.mul(up0, -state.smy * dist * 0.014)));
    const dr = lerp(0.006, 0.012, E) * dist;
    eye = V.add(eye, V.mul(right, Math.sin(state.time * 0.13) * dr * E));
  }

  // pieces
  const xf = scene.xfData;
  const building = state.build < 3.6 && !reduced;
  const idle = reduced ? 0 : (1 - smooth(E / 0.12)) * smooth((state.build - 2.6) / 1.4);
  const fy = Math.sin(state.time * 0.55) * 5 * idle, fq = Q.axis([0, 1, 0], (Math.sin(state.time * 0.33) * 0.07 + Math.sin(state.time * 0.17 + 1.3) * 0.03) * idle);
  let maxP = 0;
  const hover = state.hoverRay;
  for (let i = 0; i < P.length; i++) {
    const s = P[i];
    const pr = clamp((E - s.delay * 0.62) / (1 - 0.62 * 0.45));
    const p = 1 - Math.pow(1 - pr, 2.6);              // away fast, then drifting
    const ps = pr * pr * (3 - 2 * pr);
    s.p = p;
    if (p > maxP) maxP = p;
    let tx = s.T[0], ty = s.T[1], tz = s.T[2], scale = 1, heroOn = 0;
    if (toColumn > 0) {
      const a = s.spA + turn;
      tx = lerp(tx, Math.cos(a) * s.spR, toColumn); ty = lerp(ty, s.spY, toColumn); tz = lerp(tz, Math.sin(a) * s.spR, toColumn);
    }
    if (s.anchor) {
      const ac = s.anchor.c;
      heroOn = smooth((sc - (ac - 0.82)) / 0.6) * (1 - smooth((sc - (ac + 0.2)) / 0.5));
      if (heroOn > 0) {
        const wp = M.apply(frames[ac], s.anchor.off);
        tx = lerp(tx, wp[0], heroOn); ty = lerp(ty, wp[1], heroOn); tz = lerp(tz, wp[2], heroOn);
        scale = lerp(1, s.anchor.scale, heroOn);
      }
    }
    let x = lerp(s.c[0], tx, p), y = lerp(s.c[1], ty, p), z = lerp(s.c[2], tz, p);
    if (p > 0.001 && !reduced) {
      const f = s.wf * state.time, am = s.amp * p;
      x += Math.sin(f + s.wob[0]) * am; y += Math.sin(f * 0.83 + s.wob[1]) * am; z += Math.cos(f * 0.71 + s.wob[2]) * am;
      // the hand moves through them, and they drift out of its way
      if (hover && dt > 0) {
        const r = V.sub([x, y, z], hover.o), along = V.dot(r, hover.d);
        const perp = V.sub(r, V.mul(hover.d, along)), dp = V.len(perp) || 1;
        const reach = 150 + s.size * 0.5;
        if (dp < reach) {
          const force = (1 - dp / reach) * (1 - dp / reach) * 900 * Math.min(1, hover.speed * 0.012 + 0.06);
          s.vel[0] += perp[0] / dp * force * dt; s.vel[1] += perp[1] / dp * force * dt; s.vel[2] += perp[2] / dp * force * dt;
        }
      }
      for (let q = 0; q < 3; q++) {
        s.vel[q] += -s.push[q] * 2.2 * dt;
        s.vel[q] *= Math.exp(-dt * 1.5);
        s.push[q] += s.vel[q] * dt;
      }
      x += s.push[0] * p; y += s.push[1] * p; z += s.push[2] * p;
    }
    const ang = s.spin * ps + (reduced ? 0 : Math.sin(s.wf * 0.8 * state.time + s.wob[1]) * 0.05 * p);
    let q = Q.mul(Q.axis(s.axis, ang), s.out);
    if (heroOn > 0) {
      const ac = s.anchor.c;
      const sway = reduced ? 0 : Math.sin(state.time * 0.25 + ac) * 0.05;
      const hq = Q.mul(Q.axis([0, 1, 0], (REST + (ac - sc) * STEP) * (wide ? 0.4 : 0.2) + sway + state.smx * 0.1), s.anchor.q);
      q = Q.nlerp(q, hq, heroOn);
      if (s.anchor.pivot) {
        const pv = Q.rot(q, V.mul(s.anchor.pivot, scale * heroOn));
        x -= pv[0]; y -= pv[1]; z -= pv[2];
      }
    }
    if (building && s.tl !== undefined) {
      // each piece flies home, slowing as it lands
      const a = Math.pow(1 - clamp((state.build - (s.tl - s.dur)) / s.dur), 3);
      if (a > 0.0001) {
        x += s.io[0] * a + Math.sin(state.time * 0.7 + s.wob[0]) * 6 * a; y += s.io[1] * a; z += s.io[2] * a;
        q = Q.mul(Q.axis(s.ia, s.iang * a), q);
      }
    }
    if (idle > 0.0001) {
      const r = Q.rot(fq, [x, y - 186, z]);
      x = r[0]; y = 186 + r[1] + fy; z = r[2];
      q = Q.mul(fq, q);
    }
    xf[i * 12 + 0] = x; xf[i * 12 + 1] = y; xf[i * 12 + 2] = z; xf[i * 12 + 3] = heroOn;
    xf[i * 12 + 4] = q[0]; xf[i * 12 + 5] = q[1]; xf[i * 12 + 6] = q[2]; xf[i * 12 + 7] = q[3];
    xf[i * 12 + 8] = s.c[0]; xf[i * 12 + 9] = s.c[1]; xf[i * 12 + 10] = s.c[2]; xf[i * 12 + 11] = scale;
  }
  if (state.hoverRay) state.hoverRay.speed *= Math.exp(-dt * 5);

  // focus: follow the subject, or a given distance
  const focus = (() => {
    const fa = b.focus, fb = c.focus;
    const dist = V.len(V.sub(tgt, eye));
    return lerp(fa === null ? dist : fa, fb === null ? dist : fb, smooth(t));
  })();

  const past = Math.max(0, state.y - lastY - vh * 0.42);
  if (envK !== state.room) { envCache = buildEnv(state.room); envK = state.room; scene.dirty = true; }

  const moving = maxP > 0.001 || state.intro || building || idle > 0.0001 || heat > 0.001 || flecks > 0.002 || dust > 0.002;
  // the name fades and lifts away with its chapter
  const heroO = w.i === 0 ? 1 - clamp(w.e / 0.18) : 0;
  const titleA = title.on ? heroO * (reduced ? 1 : smooth((state.build - 1.3) / 0.3)) : 0;
  const titleWipe = reduced ? 2 : clamp((state.build - 1.3) / 1.7) * 1.15;
  const titleRect = title.on ? [title.rect[0], title.rect[1] + (1 - heroO) * 0.03, title.rect[2], title.rect[3]] : title.rect;
  const sig = [eye, tgt, fov, shift, E, state.gold, heat, ap, focus, flecks, dust, sc, titleA, state.room, win, moving && !reduced ? state.time : 0].join();
  const offscreen = state.y > lastY + vh * 1.05;
  const t0 = performance.now();
  state.tick = (state.tick || 0) + 1;
  const covered = sheetEl && sheetEl.open && innerWidth < 900;
  const breathing = maxP <= 0.001 && !state.intro && eye.join() === state.lastEyeS;
  state.lastEyeS = eye.join();
  if ((sig !== state.lastSig || scene.dirty) && !offscreen && (!covered || scene.dirty) && (!breathing || scene.dirty || state.tick % 2 === 0)) {
    scene.draw({ eye, tgt, fov, shift, ap, focus, gold: state.gold, heat, flecks, dust, swirl, plaques, titleA, titleWipe, titleRect, face, time: state.time, env: envCache, win, still: maxP <= 0.001 && !building && idle <= 0.0001 && !plaques.length, pulse: idle });
    state.lastSig = sig;
    pace(dt);
  }
  canvas.style.visibility = offscreen ? 'hidden' : 'visible';
  paintPanels(w, past);
  document.body.classList.toggle('left-room', past > 0);
  paintSeek(sc, past);
  state.lastEye = eye; state.lastFov = fov;
  state.renderMs = performance.now() - t0;
}

// if the machine can't hold the frame rate: fewer pixels first, then no lens
function pace(dt) {
  fps.acc += dt; fps.n++;
  if (fps.n >= 40) {
    const avg = fps.acc / fps.n;
    fps.acc = 0; fps.n = 0;
    if (avg > 0.036 && fps.tier < 3) {
      fps.tier++;
      if (fps.tier === 3) scene.useDof = false;
      metrics();
    }
  }
}

const seek = $('.seek'), seekLinks = seek ? $$('a[data-ch]', seek) : [];
let seekOn = null, seekAt = -1;
function paintSeek(sc, past) {
  if (!seek) return;
  const on = sc > 1.72 && sc < 10.55 && past <= 0;
  if (on !== seekOn) { seekOn = on; seek.classList.toggle('on', on); }
  const at = Math.round(sc);
  if (at !== seekAt) { seekAt = at; seekLinks.forEach((a) => { if (a.dataset.ch.split(' ').includes(String(at))) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
}

const lastO = [];
function paintPanels(w, past) {
  panels.forEach((p, i) => {
    let o = 0;
    if (i === w.i) o = 1 - clamp(w.e / 0.18);
    if (i === w.j && w.j !== w.i) o = Math.max(o, clamp((w.e - 0.82) / 0.18));
    const lift = i === panels.length - 1 ? past : 0;
    const key = o.toFixed(3) + '|' + lift.toFixed(1);
    if (key === lastO[i]) return;
    lastO[i] = key;
    p.style.opacity = o.toFixed(3);
    const drift = (1 - o) * (i === w.j && w.j !== w.i ? 28 : -28);
    p.style.transform = `translateY(${(drift - lift).toFixed(1)}px)`;
    p.classList.toggle('off', o < 0.02);
    p.classList.toggle('on', o > 0.5);
  });
  const bar = $('#seam');
  if (bar) {
    const maxY = Math.max(1, document.documentElement.scrollHeight - vh);
    const v = (scrollY / maxY).toFixed(4);
    if (v !== frame.bar) { frame.bar = v; bar.style.transform = `scaleY(${v})`; }
  }
}

/* ---------- a ping moves through the room ---------- */
const sheetEl = document.getElementById('sheet');
window.NetScene = {
  get ready() { return !!scene; },
  ping(x, y) {
    if (!scene || !scene.lastVP || !state.lastEye || reduced) return;
    const inv = M.invert(scene.lastVP), nx = x / vw * 2 - 1, ny = 1 - y / vh * 2;
    const w = inv[3] * nx + inv[7] * ny + inv[11] + inv[15];
    const far = [(inv[0] * nx + inv[4] * ny + inv[8] + inv[12]) / w, (inv[1] * nx + inv[5] * ny + inv[9] + inv[13]) / w, (inv[2] * nx + inv[6] * ny + inv[10] + inv[14]) / w];
    state.hoverRay = { o: state.lastEye, d: V.norm(V.sub(far, state.lastEye)), speed: 90 };
  },
  flash() {},
};

/* ---------- hand ---------- */
window.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  state.mx = (e.clientX / vw - 0.5) * 2;
  state.my = (e.clientY / vh - 0.5) * 2;
  if (scene && scene.lastVP && state.lastEye && !reduced) {
    const inv = M.invert(scene.lastVP);
    const nx = state.mx, ny = -state.my;
    const w = inv[3] * nx + inv[7] * ny + inv[11] + inv[15];
    const far = [(inv[0] * nx + inv[4] * ny + inv[8] + inv[12]) / w, (inv[1] * nx + inv[5] * ny + inv[9] + inv[13]) / w, (inv[2] * nx + inv[6] * ny + inv[10] + inv[14]) / w];
    const d = V.norm(V.sub(far, state.lastEye));
    const speed = Math.hypot(e.movementX || 0, e.movementY || 0);
    state.hoverRay = { o: state.lastEye, d, speed: Math.max(speed, state.hoverRay ? state.hoverRay.speed : 0) };
  }
}, { passive: true });

document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a || !scene) return;
  const i = chapters.findIndex((c) => '#' + c.id === a.getAttribute('href'));
  if (i < 0) return;
  e.preventDefault();
  scrollTo({ top: ys[i], behavior: reduced ? 'auto' : 'smooth' });
});
panels.forEach((p, i) => p.addEventListener('focusin', () => {
  if (scene) scrollTo({ top: ys[i], behavior: reduced ? 'auto' : 'smooth' });
}));
let seenW = innerWidth, seenH = innerHeight;
window.addEventListener('resize', () => {
  if (!wide && innerWidth === seenW && Math.abs(innerHeight - seenH) < 140) return;
  seenW = innerWidth; seenH = innerHeight;
  metrics();
});
lightsBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'night' ? 'day' : 'night';
  store.set(THEME_KEY, root.dataset.theme);
  paintTheme();
});
const reveal = new IntersectionObserver((list) => {
  list.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); } });
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
$$('.reveal').forEach((el) => reveal.observe(el));

function printed() {
  if (window.__loaderDone) window.__loaderDone();
  scene = null;
  root.classList.remove('live');
  root.classList.add('no-gl');
  metrics();
}

async function start() {
  const raw = window.__MENDED;
  delete window.__MENDED;
  try {
    await MeshoptDecoder.ready;
    const vb = new Uint8Array(raw.nv * 16), ib = new Uint8Array(raw.ni * 4);
    MeshoptDecoder.decodeVertexBuffer(vb, raw.nv, 16, b64(raw.v));
    MeshoptDecoder.decodeIndexBuffer(ib, raw.ni, 4, b64(raw.i));
    raw.vb = vb; raw.ib = new Uint32Array(ib.buffer);
    delete raw.v; delete raw.i;
    scene = new Scene(raw);
    metrics();
    await Promise.all([
      document.fonts.load('500 italic 40px Fraunces'),
      document.fonts.load('600 20px "Instrument Sans"'),
      document.fonts.load('700 40px "Aref Ruqaa"', 'مناف'),
    ]).catch(() => {});
    const PORT_X = []; { let x = -131; for (let g = 0; g < 2; g++) { for (let c = 0; c < 6; c++) { PORT_X.push(x); x += 14.6; } x += 7; } }
    const [fc, tc] = paintMarkings(PORT_X);
    scene.setMarkings(fc, tc);
    const k = innerWidth < 900 ? 2 : 3;
    await Promise.all([document.fonts.load('italic 400 20px Fraunces'), document.fonts.load('360 40px "Fraunces Mast"')]).catch(() => {});
    const portrait = await new Promise((res) => { if (!window.__PORTRAIT) { res(null); return; } const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = window.__PORTRAIT; });
    delete window.__PORTRAIT;
    scene.setCards(PLAQUES.map((d) => paintPlaque(d, k, portrait)));
    if (portrait) scene.setFace(portrait);
    P = plan(raw);
    SHOTS = shots(P);
  } catch (err) {
    console.warn('Showing the printed views instead:', err.message);
    printed();
    return;
  }
  canvas.addEventListener('webglcontextlost', printed);
  root.classList.add('live');
  if (window.__loaderDone) window.__loaderDone();
  // the views are drawn on a canvas, so their descriptions reach screen readers another way
  $$('.still').forEach((img) => { const p = document.createElement('p'); p.className = 'sr'; p.textContent = img.alt; img.after(p); });
  const tris = $('[data-tris]'), pieces = $('[data-pieces]');
  if (tris) tris.textContent = (Math.round(raw.ni / 3 / 10000) * 10000).toLocaleString('en-US');
  if (pieces) pieces.textContent = raw.shards.length;
  metrics();
  state.y = scrollY;
  if (scrollY > 40) { state.build = 99; state.gold = 2; state.intro = false; }
  requestAnimationFrame(frame);
}

const hasGL = (() => { try { const c = document.createElement('canvas').getContext('webgl2'); return !!(c && c.getExtension('EXT_color_buffer_float')); } catch (e) { return false; } })();
metrics();
const tell = (p) => { if (window.__loaderProgress) window.__loaderProgress(p); };
function loadObject(name) {
  // read the file in pieces, so the loader can count; from disk the browser refuses, and a script tag does it instead
  const viaScript = () => new Promise((res, rej) => { const s = document.createElement('script'); s.src = name; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  if (!/^https?:/.test(location.protocol)) return viaScript();
  return fetch(name).then(async (r) => {
    if (!r.ok || !r.body) throw new Error('no body');
    const total = +r.headers.get('content-length') || 0, reader = r.body.getReader(), chunks = [];
    let got = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; tell(total ? got / total : Math.min(0.9, got / 2.6e6)); }
    const all = new Uint8Array(got); let o = 0; for (const ch of chunks) { all.set(ch, o); o += ch.length; }
    (0, eval)(new TextDecoder().decode(all));
  }).catch(viaScript);
}
if (hasGL) {
  const small = innerWidth < 900 || (navigator.deviceMemory && navigator.deviceMemory < 4);
  loadObject(small ? 'object-lite.js' : 'object.js').then(start, () => (small ? loadObject('object.js').then(start, printed) : printed()));
} else {
  printed();
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(metrics);

})();
