uniform vec2 iResolution;
uniform float iTime;

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / iResolution;

    vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), uv.x);
    gl_FragColor = vec4(color, 1.0);
}