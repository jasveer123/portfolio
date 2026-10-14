import * as THREE from "three";
import { BAKE, RECT_BOUNDS } from "@/lib/scene-config";

/**
 * Unlit material that shows the Cycles bake:
 *   colour = room · roomGain + lamp · level
 * The wall also receives the projected light inside the projection rectangle —
 * soft edges, vignette and plaster grain — which the HTML slide then modulates.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uRoom;
  uniform sampler2D uLamp;
  uniform float uScale;
  uniform float uLevel;
  uniform float uRoomGain;
  uniform float uLampGain;
  uniform vec3 uHighlight;
  uniform float uRect;          // 1 on the wall
  uniform vec4 uBounds;         // x0, y0, x1, y1 of the projection
  uniform float uRectGain;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorld;

  vec3 dec(vec3 c) { return pow(c, vec3(${BAKE.gamma.toFixed(2)})) * uScale; }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec3 room = dec(texture2D(uRoom, vUv).rgb);
    vec3 lamp = dec(texture2D(uLamp, vUv).rgb);
    vec3 col = room * uRoomGain + lamp * uLevel * uLampGain;

    if (uRect > 0.5) {
      vec2 size = uBounds.zw - uBounds.xy;
      vec2 p = (vWorld.xy - uBounds.xy) / size;
      // a real lens never draws a hard box: soft shoulders, brighter centre
      float sx = 0.035, sy = 0.055;
      float mask = smoothstep(-sx * 0.35, sx, p.x) * smoothstep(1.0 + sx * 0.35, 1.0 - sx, p.x)
                 * smoothstep(-sy * 0.35, sy, p.y) * smoothstep(1.0 + sy * 0.35, 1.0 - sy, p.y);
      vec2 c = p - 0.5;
      float vignette = 1.0 - 0.75 * dot(c * vec2(1.05, 1.25), c * vec2(1.05, 1.25));
      vignette *= 0.92 + 0.08 * smoothstep(0.7, 0.0, length(c * vec2(1.0, 1.4)));
      float grain = 0.965 + 0.07 * hash(floor(vWorld.xy * 900.0));
      vec3 plaster = vec3(0.62, 0.55, 0.45);
      vec3 light = vec3(1.0, 0.86, 0.66);
      // stray light around the frame (lens flare / imperfect gate), metres from the edge
      vec2 q = abs(vWorld.xy - (uBounds.xy + uBounds.zw) * 0.5) - size * 0.5;
      float d = length(max(q, 0.0));
      float halo = exp(-d * d / 0.02) * 0.12 + exp(-d * d / 0.25) * 0.02;
      col += plaster * light * uRectGain * uLevel * (mask * vignette * grain + (1.0 - mask) * halo);
    }

    col += uHighlight;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export type BakedUniforms = {
  uRoom: { value: THREE.Texture };
  uLamp: { value: THREE.Texture };
  uScale: { value: number };
  uLevel: { value: number };
  uRoomGain: { value: number };
  uLampGain: { value: number };
  uHighlight: { value: THREE.Color };
  uRect: { value: number };
  uBounds: { value: THREE.Vector4 };
  uRectGain: { value: number };
  uTime: { value: number };
};

/** Uniforms shared by every baked material so one update drives the whole room. */
export const sharedUniforms = {
  uLevel: { value: 0 },
  uRoomGain: { value: 1 },
  /** projector bounce baked into the room — kept low so the slide stays the focus */
  uLampGain: { value: 0.45 },
  uRectGain: { value: 2.2 },
  uTime: { value: 0 },
};

export function bakedMaterial(room: THREE.Texture, lamp: THREE.Texture, isWall: boolean) {
  const uniforms: BakedUniforms = {
    uRoom: { value: room },
    uLamp: { value: lamp },
    uScale: { value: BAKE.scale },
    uLevel: sharedUniforms.uLevel,
    uRoomGain: sharedUniforms.uRoomGain,
    uLampGain: sharedUniforms.uLampGain,
    uHighlight: { value: new THREE.Color(0, 0, 0) },
    uRect: { value: isWall ? 1 : 0 },
    uBounds: { value: new THREE.Vector4(RECT_BOUNDS.x0, RECT_BOUNDS.y0, RECT_BOUNDS.x1, RECT_BOUNDS.y1) },
    uRectGain: sharedUniforms.uRectGain,
    uTime: sharedUniforms.uTime,
  };
  return new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, toneMapped: true });
}

export function loadBakeTexture(loader: THREE.TextureLoader, url: string) {
  const t = loader.load(url);
  t.flipY = false; // glTF UV convention
  t.colorSpace = THREE.NoColorSpace; // custom encoding, decoded in the shader
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}
