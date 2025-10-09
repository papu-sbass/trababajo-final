const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    const pNotif = document.getElementById('notif');
    pNotif.textContent = '¡WebGL no está soportado en tu navegador!'

    throw new Error('¡WebGL no soportado!');
}

// Vertex Shader
const vertexGLSL = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;
    varying vec3 v_color;

    void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
        v_color = a_color;
    }
`;

// Fragment Shader
const fragmentGLSL = `
    precision mediump float;
    varying vec3 v_color;

    void main() {
        gl_FragColor = vec4(v_color, 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compilando shader: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexGLSL);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentGLSL);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error enlazando programa: ', gl.getProgramInfoLog(program));
}
gl.useProgram(program);

const vertices = new Float32Array([
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5
]);

const colors = new Float32Array([
    1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
]);

const indices = new Uint16Array([
    0, 1, 2,  0, 2, 3,
    5, 4, 7,  5, 7, 6,
    3, 2, 6,  3, 6, 7,
    4, 5, 1,  4, 1, 0,
    1, 5, 6,  1, 6, 2,
    4, 0, 3,  4, 3, 7
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
const colorLocation = gl.getAttribLocation(program, 'a_color');
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');

const modelViewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, 45 * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -2.0]); // Alejar el cubo

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 0.0);
gl.enable(gl.DEPTH_TEST);

let angle = 0;

function render() {
    angle += 0.01;
    
    const rotationMatrix = mat4.create();
    mat4.rotateY(rotationMatrix, rotationMatrix, angle);
    
    const finalModelViewMatrix = mat4.create();
    mat4.multiply(finalModelViewMatrix, modelViewMatrix, rotationMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(modelViewMatrixLocation, false, finalModelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(render);
}

render();
