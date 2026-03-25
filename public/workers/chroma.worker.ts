

self.onmessage = async (e: MessageEvent) => {
  const { type, canvas } = e.data as {
    type: string;
    canvas: OffscreenCanvas;
  };
  
  if (type === 'processFrame') {
    const gl = canvas.getContext('webgl2')!;
    
    
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    
    
    const fsSource = `
      precision mediump float;
      
      uniform sampler2D u_texture;
      uniform vec3 u_keyColor;     // Green: [0.18, 0.8, 0.18] HSV normalized
      uniform float u_similarity;  // 0.2
      uniform float u_smoothness;  // 0.05
      
      vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }
      
      float chromaKey(vec3 rgb) {
        vec3 hsv = rgb2hsv(rgb);
        vec3 keyHSV = u_keyColor;
        
        float hDiff = min(abs(hsv.x - keyHSV.x), 1.0 - abs(hsv.x - keyHSV.x));
        float sim = 1.0 - smoothstep(0.0, u_similarity, hDiff);
        float satDiff = abs(hsv.y - keyHSV.y);
        float valDiff = abs(hsv.z - keyHSV.z);
        
        float mask = sim * step(0.15, hsv.y) * step(0.1, hsv.z);
        return 1.0 - smoothstep(0.0, u_smoothness, 1.0 - mask);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / vec2(canvas.width, canvas.height);
        vec4 color = texture2D(u_texture, uv);
        
        // Protect robot cyan/blue (H:150-255°)
        vec3 hsv = rgb2hsv(color.rgb);
        if (hsv.x >= 0.42 && hsv.x <= 0.71) {
          gl_FragColor = color;
          return;
        }
        
        // Protect bright highlights
        if (color.b > 0.7 && color.rgb.r == color.rgb.g) {
          gl_FragColor = color;
          return;
        }
        
        float alpha = chromaKey(color.rgb);
        gl_FragColor = vec4(color.rgb, alpha);
        
        // Spill suppression
        if (alpha > 0.05) {
          float maxRb = max(color.r, color.b);
          color.g = min(color.g, maxRb * 1.04);
          gl_FragColor = vec4(color.rgb, alpha);
        }
      }
    `;
    
    
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    
    const positionLocation = gl.getAttribLocation(program, 'position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      1, -1, 1, 1, -1, 1
    ]), gl.STATIC_DRAW);
    
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    
    const texLocation = gl.getUniformLocation(program, 'u_texture');
    const keyColorLoc = gl.getUniformLocation(program, 'u_keyColor');
    const simLoc = gl.getUniformLocation(program, 'u_similarity');
    const smoothLoc = gl.getUniformLocation(program, 'u_smoothness');
    
    gl.uniform1i(texLocation, 0);
    gl.uniform3f(keyColorLoc, 0.125, 0.55, 0.18); 
    gl.uniform1f(simLoc, 0.18);
    gl.uniform1f(smoothLoc, 0.08);
    
    
    const renderFrame = (videoTexture: WebGLTexture) => {
      gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, videoTexture);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      self.postMessage({ type: 'frameReady', canvas });
    };
    
    self.postMessage({ type: 'workerReady' });
    
    
    self.onmessage = (msg) => {
      if (msg.data.type === 'renderVideo') {
        const videoBitmap = msg.data.bitmap;
        const glTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoBitmap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        renderFrame(glTex);
      }
    };
  }
};

