const utils = {
  norm (value, min, max) {
    return (value - min) / (max - min)
  },

  lerp (norm, min, max) {
    return (max - min) * norm + min
  },

  randomInt (min, max) {
    return min + Math.random() * (max - min + 1)
  },

  degreesToRads(degrees) {
    return degrees / 180 * Math.PI
  }
}

let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let w = canvas.width = window.innerWidth
let h = canvas.height = window.innerHeight

let gridX = 5
let gridY = 5

const COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
'#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
'#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
'#FF5722']

let fieldvalue = 'yccc'
let gravity = 0
let duration = 0.4
let speed = 0.1
let radius = 2
let resolution = 5
let FPS = 100


/**
 * 文字图像类
 */
class Shape {
  constructor(x, y, texte) {
    this.x = x
    this.y = y
    this.size = 120

    this.text = texte
    this.placement = []
    this.vectors = []

  }

  getValue() {
    ctx.textAlign = 'center'
    ctx.font = `bold ${this.size}px arial`
    ctx.fillText(this.text, this.x, this.y)

    // 获取画布像素数据
    let idata = ctx.getImageData(0, 0, w, h)

    // rgba颜色顺序的数据的一维数组
    let buffer32 = new Uint32Array(idata.data.buffer)
    
    // 找到文字的位置便于用粒子填充
    for (let y = 0; y < h; y += gridY) {
      for (let x = 0; x < w; x += gridX) {
        if (buffer32[y * w + x]) {
          console.log(x,y)
          this.placement.push(new Particle(x, y))
        }
      }
    }
    ctx.clearRect(0, 0, w, h)
  }
}

/**
 * 例子类
 */
class Particle {
  constarctor(x, y, type) {
    this.radius = 1.1 // 圆半径
    this.futurRadius = utils.randomInt(this.radius, this.radius + 3)

    this.rebond = utils.randomInt(1, 5)
    this.x = x
    this.y = y
    
    this.dying = false

    this.base = [x, y]

    this.vx = 0
    this.vy = 0
    this.type = type
    this.friction = 0.99
    this.gravity = gravity // 重力
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)]

   
  }

  init() {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false)
    ctx.fill()
    ctx.closePath()

    if (this.y < 0 || this.radius < 1) {
      this.x = this.base[0]
      this.dying = false
      this.y = this.base[1]
      this.radius = 1.1
      this.setSpeed(speed)
      this.futurRadius = utils.randomInt(this.radius, this.radius + 3)
      this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)))
    }
  }

  getSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy)
  }

  setSpeed(speed) {
    let heading = this.getHeading()
    this.vx = Math.cos(heading) * speed
    this.vy = Math.sin(heading) * speed
  }

  setHeading(heading) {
    let speed = this.getSpeed()
    this.vx = Math.cos(heading) * speed
    this.vy = Math.sin(heading) * speed
  }

  getHeading() {
    // Math.atan2 是正x轴和点（x，y）与原点连线之间，逆时针的角度所对应的弧度
    return Math.atan2(this.vy, this.vx)
  }

  angleTo(p2) {
    return Math.atan2(p2.y - this.y, p2.x - this.x)
  }

  update(heading) {
    this.x += this.vx
    this.y += this.vy
    this.vy += gravity

    this.vx *= this.fariction
    this.vy *= this.fariction

    if(this.radius < this.futurRadius && this.dying === false){
      this.radius += duration
    } else {
      this.dying = true
    }

    if(this.dying === true){
      this.radius -= duration
    }
    this.init()
  }
}

let message = new Shape(w/2, h/2 + 50, fieldvalue)
message.getValue()

function update() {
  setTimeout(() => {
    ctx.clearRect(0, 0, w, h)

    message.placement.forEach((item) => {
      item.update()
    })

    window.requestAnimationFrame(update)
  }, 1000 / FPS)
}
update()