/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
// Image Contour GLSL

import React, { useRef, useEffect } from 'react';
import { Image, View } from 'react-native';
import GLView from 'react-native-gl';
import contourExtractionShaderSource from './contour_extraction.glsl';
// import vertShader from './shaders/vertex.glsl'; // Add path to your vertex shader
// import fragShader from './shaders/contour_extraction.glsl'; // Add path to your contour extraction shader

      const vertShader = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;

      void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_position * 0.5 + 0.5;
      }
    `;

      // const contourExtractionShaderSource
      const fragShader = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform sampler2D u_texture;

      void main() {
      vec3 color = texture2D(u_texture, v_texCoord).rgb;

      // Convert color to grayscale for contour extraction
      float grayscale = dot(color.rgb, vec3(0.299, 0.587, 0.114));

      // Apply contour extraction logic
      float threshold = 0.5; // Adjust threshold as needed
      vec3 contourColor = step(grayscale, threshold) * vec3(1.0); // White
      gl_FragColor = vec4(contourColor, 1.0);
      }
    `;

const ImageContourGLSL = () => {
  const glRef = useRef(null);

  useEffect(() => {
    if (glRef.current) {
      const gl = glRef.current.getContext('webgl');

      // Compile and link shaders
      const vertShaderCompiled = compileShader(gl, gl.VERTEX_SHADER, vertShader);
      const fragShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, fragShader);
      const program = createProgram(gl, vertShaderCompiled, fragShaderCompiled);
      gl.useProgram(program);

      // Create buffers, bind attributes, etc.
      const positionBuffer = gl.createBuffer();
      const aPosition = gl.getAttribLocation(program, 'a_position');
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      // Load image texture, bind it, and set uniforms
      const imageTexture = loadTexture(gl, './original.jpg');
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      const uTexture = gl.getUniformLocation(program, 'u_texture');
      gl.uniform1i(uTexture, 0);

      // Render using shaders
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Implement contour extraction logic
      const contourExtraction = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, contourExtraction);

// Attach a texture to the framebuffer for rendering
      const contourTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, contourTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, contourTexture, 0);

      // Set the viewport to match the texture size
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

      // Compile the contour extraction fragment shader
      const contourExtractionShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, contourExtractionShaderSource);

      const contourExtractionProgram = createProgram(gl, vertShaderCompiled, contourExtractionShaderCompiled);
      gl.useProgram(contourExtractionProgram);



      // Bind the position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      const aTexture = gl.getUniformLocation(contourExtractionProgram, 'a_texture');
      gl.uniform1i(aTexture, 0);

      // Bind the position buffer and set attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      // Render a full-screen quad to perform contour extraction
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Unbind framebuffer and cleanup
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteTexture(contourTexture);
      gl.deleteProgram(contourExtractionProgram);
    }
  }, []);

  return (
    <View>
      <GLView
        ref={glRef}
        style={{ width: 300, height: 300 }}
        pixelRatio={1}
        onContextCreate={gl => {

          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

          // vertex and fragment shaders
          const vertShaderCompiled = compileShader(gl, gl.VERTEX_SHADER, vertShader);
          const fragShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, fragShader);
          const program = createProgram(gl, vertShaderCompiled, fragShaderCompiled);
          gl.useProgram(program);

          // svertices and attributes
          const vertices = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0,  1.0,
            1.0,  1.0,
          ]);

          const aPosition = gl.getAttribLocation(program, 'a_position');
          const positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
          gl.enableVertexAttribArray(aPosition);
          gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

          // Rendering logic using gl.drawArrays
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

          // Cleanup resources (delete buffers, program, etc.)
          gl.deleteBuffer(positionBuffer);
          gl.deleteProgram(program);
        }}
      />
    </View>
  );
};

// Helper functions for shader compilation and program creation
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function loadTexture(gl, imagePath) {
  // Create a new texture object
  const texture = gl.createTexture();

  // Bind the texture
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Load the image
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };
  image.src = imagePath; // Path to the image (e.g., 'original.jpeg')

  return texture;
}


export default ImageContourGLSL;

