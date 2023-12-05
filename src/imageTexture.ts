import { initWebGL } from './util'

const vsSource = `
attribute vec2 a_position;
uniform vec2 u_resolution;

attribute vec2 a_texCoord;
varying vec2 v_texCoord;
 
void main() {
  vec2 zeroToOne = a_position / u_resolution;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  
  v_texCoord = a_texCoord;
}
`
const fsSource = `
precision mediump float;
 
// 纹理
uniform sampler2D u_image;
 
// 从顶点着色器传入的纹理坐标
varying vec2 v_texCoord;
 
void main() {
   // 在纹理上寻找对应颜色值
   gl_FragColor = texture2D(u_image, v_texCoord);
}
`
const { gl, shaderProgram } = initWebGL(vsSource, fsSource)

function setRectangle(gl, x, y, width, height) {
  var x1 = x
  var x2 = x + width
  var y1 = y
  var y2 = y + height
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), gl.STATIC_DRAW)
}
// 设置视口为画布大小

// 设置纹理
async function main(src) {
  var image = new Image()
  image.src = src // 必须在同一域名下
  return new Promise((resolve, reject) => {
    image.onload = function () {
      render(image)
      resolve(undefined)
    }
  })
}

function render(image) {
  var texCoordLocation = gl.getAttribLocation(shaderProgram, 'a_texCoord')

  // 给矩形提供纹理坐标
  var texCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(texCoordLocation)
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

  // 创建纹理
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // 设置参数，让我们可以绘制任何尺寸的图像
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  // 将图像上传到纹理
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  // 创建缓冲区和顶点数据
  // const vertices = new Float32Array([-1, 1, 1, 1, -1, -1, -1, -1, 1, 1, 1, -1])
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  let cw = gl.canvas.width
  let ch = gl.canvas.height
  let iw = image.width
  let ih = image.height

  let x, y, w, h
  if (cw / ch < iw / ih) {
    w = cw
    h = (cw / iw) * ih
    x = 0
    y = (ch - h) / 2
  } else {
    h = cw
    w = (ch / ih) * iw
    y = 0
    x = (cw - w) / 2
  }
  setRectangle(gl, x, y, w, h)

  const positionAttrib = gl.getAttribLocation(shaderProgram, 'a_position')
  gl.enableVertexAttribArray(positionAttrib)
  // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
  var size = 2 // 每次迭代运行提取两个单位数据
  var type = gl.FLOAT // 每个单位的数据类型是32位浮点型
  var normalize = false // 不需要归一化数据
  var stride = 0 // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)） 每次迭代运行运动多少内存到下一个数据开始点
  var offset = 0 // 从缓冲起始位置开始读取
  gl.vertexAttribPointer(positionAttrib, size, type, normalize, stride, offset)

  var resolutionLocation = gl.getUniformLocation(shaderProgram, 'u_resolution')
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

  // 清空画布
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Draw the rectangle.
  var primitiveType = gl.TRIANGLES
  var offset = 0
  var count = 6
  gl.drawArrays(primitiveType, offset, count)
}

// .then(() => {
let imageUrl = ['2.png', '1.png', '3.jpg']
let index = 0
// setInterval(() => {
index++
if (index > 2) index = 0
console.log('--------', index)
main(imageUrl[index])
// }, 1000)

// })
