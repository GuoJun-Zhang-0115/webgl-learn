import { initWebGL } from './util'


const vsSource = `
attribute vec2 aVertexPosition;
attribute vec4 a_color;
varying vec4 v_color;
void main(void) {
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
  v_color = a_color;
}
`
const fsSource = `
precision mediump float;
varying vec4 v_color;
void main(void) {
  gl_FragColor = v_color;
}
`

const { gl, shaderProgram } = initWebGL(vsSource, fsSource)
// 创建缓冲区和顶点数据
const vertices = new Float32Array([
  -1, 1, 0, 0, 1, 1,

  0, 0, -1, -1, 1, -1,
])
const vertexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

const positionAttrib = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
gl.enableVertexAttribArray(positionAttrib)
// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
var size = 2 // 每次迭代运行提取两个单位数据
var type = gl.FLOAT // 每个单位的数据类型是32位浮点型
var normalize = false // 不需要归一化数据
var stride = 0 // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)） 每次迭代运行运动多少内存到下一个数据开始点
var offset = 0 // 从缓冲起始位置开始读取
gl.vertexAttribPointer(positionAttrib, size, type, normalize, stride, offset)

// 设置绘制三角形颜色
const colorBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1,

    1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1,
  ]),
  gl.STATIC_DRAW
)

const colorAttrib = gl.getAttribLocation(shaderProgram, 'a_color')
gl.enableVertexAttribArray(colorAttrib)
gl.vertexAttribPointer(colorAttrib, 4, type, normalize, stride, offset)

gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
