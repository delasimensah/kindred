import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import { useDerivedValue } from "react-native-reanimated";

interface TrackVisualizerProps {
  height: number;
}

/**
 * Gold waves over the page color. Drawn with a Skia shader so it stays on the
 * GPU. Mount this only while the visualizer is on.
 * https://shopify.github.io/react-native-skia/docs/shaders/overview/
 */
const EFFECT = Skia.RuntimeEffect.Make(`
uniform float time;
uniform vec2 resolution;

half4 main(vec2 pos) {
  vec2 uv = pos / resolution;
  float drift = sin(uv.x * 8.0 + time * 1.3);
  float band = 0.55 + drift * 0.16;
  float line = smoothstep(0.045, 0.0, abs(uv.y - band));
  float wash = 0.15 + 0.2 * sin(uv.y * 5.0 + time);
  vec3 gold = vec3(1.0, 0.827, 0.412);
  vec3 ink = vec3(0.133, 0.157, 0.192);
  vec3 color = mix(ink, gold, clamp(line + wash * (0.5 + 0.5 * drift), 0.0, 1.0));
  return half4(color, 1.0);
}
`);

const TrackVisualizer: React.FC<TrackVisualizerProps> = ({ height }) => {
  const { width } = useWindowDimensions();
  const clock = useClock();
  const uniforms = useDerivedValue(() => ({
    time: clock.value / 1000,
    resolution: [width, height],
  }));
  const ready = EFFECT !== null && width > 0 && height > 0;

  if (!ready || EFFECT === null) {
    return null;
  }

  return (
    <Canvas style={{ width, height }}>
      <Fill>
        <Shader source={EFFECT} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

export default TrackVisualizer;
