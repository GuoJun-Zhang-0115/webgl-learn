export function initWebGL(vsSource: string, fsSource: string) {
  const canvas = document.getElementById('webglCanvas')! as HTMLCanvasElement
  const gl = canvas.getContext('webgl')!

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource)!
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)!

  const shaderProgram = linkProgram(gl, vertexShader, fragmentShader)!
  gl.useProgram(shaderProgram)
  return {gl, shaderProgram}
}
function compileShader(gl: WebGLRenderingContext, type: number, resource: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, resource)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function linkProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()!
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}
