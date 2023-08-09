
precision highp float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;

void main() {
  vec4 color = texture2D(u_texture, v_texCoord);
  
  // Convert the color to grayscale
  float grayscale = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  
  // Apply a threshold to create binary values
  float threshold = 0.5;
  float contourValue = step(threshold, grayscale);
  
  // Output the contour value as a grayscale color
  gl_FragColor = vec4(vec3(contourValue), 1.0);
}
