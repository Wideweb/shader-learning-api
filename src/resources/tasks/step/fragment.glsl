uniform vec2 iResolution;
uniform float iTime;

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / iResolution;

    vec3 color = vec3(1.0, 0.0, 0.0) * step(0.5, uv.x);
    gl_FragColor = vec4(color, 1.0);
}