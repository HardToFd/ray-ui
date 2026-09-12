export type AIOrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface OrbFrame {
  time: number;
  energy: number;
  activity: number;
  error: number;
}

const vertexSource = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

// Preserve the refracted flow and glass shell, with quieter fine detail and
// lighter shadow colors. No textures, downloaded assets, or external runtime.
const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_energy;
uniform float u_activity;
uniform float u_error;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p) * (i < 2 ? 1.0 : 0.25);
    p = turn * p * 2.03 + 3.7;
    a *= 0.5;
  }
  // Keep the field's overall range while suppressing the smallest wrinkles.
  return v * 1.17647;
}
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time;
  float radius = 0.70 + sin(t * 1.3) * 0.008 + u_energy * 0.035;
  vec2 q = p / radius;
  float r = length(q);
  vec3 cyan = vec3(0.10, 0.86, 1.0);
  vec3 violet = vec3(0.45, 0.25, 1.0);
  vec3 rose = vec3(1.0, 0.30, 0.55);
  vec3 haloColor = mix(mix(cyan, violet, smoothstep(-0.6, 0.6, q.x)), rose, u_error);
  float halo = exp(-pow((r - 1.0) * 5.0, 2.0)) * (0.10 + 0.05 * u_energy);
  if (r >= 1.0) {
    float edge = exp(-(r - 1.0) * 95.0) * 0.30;
    float alpha = halo + edge;
    gl_FragColor = vec4(haloColor * alpha, alpha);
    return;
  }

  float z = sqrt(max(0.0, 1.0 - r * r));
  vec2 uv = q / (0.72 + z * 0.4);
  float angle = 0.25 * t + 0.6 * z;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  vec2 drift = vec2(t * 0.16, -t * 0.12);
  float warp = fbm(uv * 2.5 + drift);
  float flow = fbm(uv * 3.0 + vec2(warp * 2.6, t * 0.14));
  float ribbon = sin(uv.y * 5.0 + uv.x * 2.6 + warp * 6.0 - t * 0.4);
  float stream = sin(uv.x * 3.8 - uv.y * 2.0 + flow * 5.0 + t * 0.3);
  vec3 tint = mix(violet, cyan, smoothstep(-0.8, 0.8, stream));
  tint = mix(tint, rose, smoothstep(0.05, 0.90, sin(uv.x * 2.8 + uv.y * 3.1 + warp * 4.0 - t * 0.22)) * 0.85);
  tint = mix(tint, vec3(1.0, 0.26, 0.18), u_error * 0.82);
  float fold = pow(0.5 + 0.5 * ribbon, 2.4);
  float filament = pow(1.0 - abs(ribbon), 6.0);
  vec3 color = mix(vec3(0.13, 0.15, 0.29), tint, 0.48 + fold * 0.47);
  color += tint * filament * (0.12 + u_activity * 0.08 + u_energy * 0.12);
  color += vec3(0.70, 0.94, 1.0) * pow(fold, 5.0) * 0.25;
  color *= 0.60 + z * 0.47;

  // Translucent shell and soft studio reflections establish a round volume.
  float fresnel = pow(1.0 - z, 2.8);
  color = mix(color, mix(vec3(0.73, 0.90, 1.0), tint, 0.45), fresnel * 0.65);
  float highlight = exp(-dot((q - vec2(-0.30, 0.46)) * vec2(2.3, 4.5), (q - vec2(-0.30, 0.46)) * vec2(2.3, 4.5)));
  color += vec3(0.8, 0.9, 1.0) * highlight * 0.40;
  color += vec3(0.72, 0.90, 1.0) * pow(max(0.0, 1.0 - abs(r - 0.985) * 70.0), 2.0) * 0.35;
  float alpha = mix(1.0, halo + 0.30, smoothstep(0.994, 1.0, r));
  gl_FragColor = vec4(min(color, vec3(1.0)) * alpha, alpha);
}
`;

export function createOrbRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const dispose = () => {
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteBuffer(buffer); gl.deleteProgram(program);
  };
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) return null;
    shaders.push(shader);
    gl!.shaderSource(shader, source); gl!.compileShader(shader);
    return gl!.getShaderParameter(shader, gl!.COMPILE_STATUS) ? shader : null;
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!program || !buffer || !vertex || !fragment) { dispose(); return null; }
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { dispose(); return null; }
  gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const locations = Object.fromEntries(['resolution', 'time', 'energy', 'activity', 'error'].map((name) => [name, gl.getUniformLocation(program, `u_${name}`)]));
  return {
    draw({ time, energy, activity, error }: OrbFrame) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(locations.resolution, canvas.width, canvas.height);
      gl.uniform1f(locations.time, time); gl.uniform1f(locations.energy, energy);
      gl.uniform1f(locations.activity, activity); gl.uniform1f(locations.error, error);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    dispose,
  };
}
