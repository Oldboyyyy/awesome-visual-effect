'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//http://www.zcfy.cc/article/html-css-and-javascript-10-awesome-codepens-to-inspire-you-4101.html?t=new
var utils = {
  norm: function norm(value, min, max) {
    return (value - min) / (max - min);
  },
  lerp: function lerp(norm, min, max) {
    return (max - min) * norm + min;
  },
  randomInt: function randomInt(min, max) {
    return min + Math.random() * (max - min + 1);
  },
  degreesToRads: function degreesToRads(degrees) {
    return degrees / 180 * Math.PI;
  }
};

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var w = canvas.width = window.innerWidth; // 画布宽度
var h = canvas.height = window.innerHeight; // 画布高度

var gridX = 5; // 生粒子的横向间隔
var gridY = 5; // 生成粒子的纵向间隔

// 颜色列表
var COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

var fieldvalue = '狗子'; // 文本
var gravity = -0.3; // 重力系数用于改变粒子的纵坐标位置，让粒子向上或者向下偏移 取值：-1~1
var duration = 0.4; // 用于改变粒子生命周期长度的系数 0.1~0.99
var speed = 0.1; // 横向的一个速度，用于改变粒子的横坐标 0~5
var radius = 2; // 粒子的半径
// let resolution = 5 
var FPS = 100;

/**
 * 文字图像类
 */

var Shape = function () {
  function Shape(x, y, texte) {
    _classCallCheck(this, Shape);

    this.x = x;
    this.y = y;
    this.size = 220;

    this.text = texte;
    this.placement = [];
    this.vectors = [];
  }

  _createClass(Shape, [{
    key: 'getValue',
    value: function getValue() {
      ctx.textAlign = 'center';
      ctx.font = 'bold ' + this.size + 'px arial';
      ctx.fillText(this.text, this.x, this.y);

      // 获取画布像素数据
      var idata = ctx.getImageData(0, 0, w, h);

      // rgba颜色顺序的数据的一维数组
      var buffer32 = new Uint32Array(idata.data.buffer);

      // 找到文字的位置便于用粒子填充
      for (var y = 0; y < h; y += gridY) {
        for (var x = 0; x < w; x += gridX) {
          if (buffer32[y * w + x]) {
            this.placement.push(new Particle(x, y));
          }
        }
      }
      ctx.clearRect(0, 0, w, h);
    }
  }]);

  return Shape;
}();

/**
 * 例子类
 */


var Particle = function () {
  function Particle(x, y, type) {
    _classCallCheck(this, Particle);

    this.radius = 2; // 圆半径
    this.futurRadius = utils.randomInt(radius, radius + 3);

    // this.rebond = utils.randomInt(1, 5)
    this.x = x; // 圆心坐标
    this.y = y;

    this.dying = false;

    this.base = [x, y];

    this.vx = 0; // X轴偏移量
    this.vy = 0; // y轴偏移量
    // this.type = type
    this.friction = 0.99; // 摩擦系数
    this.gravity = gravity; // 重力
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)]; // 随机选一种颜色

    this.setSpeed(utils.randomInt(0.1, 0.5));
    this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)));
  }

  _createClass(Particle, [{
    key: 'getSpeed',
    value: function getSpeed() {
      return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }
  }, {
    key: 'setSpeed',
    value: function setSpeed(speed) {
      var heading = this.getHeading();
      this.vx = Math.cos(heading) * speed;
      this.vy = Math.sin(heading) * speed;
    }
  }, {
    key: 'setHeading',
    value: function setHeading(heading) {
      var speed = this.getSpeed();
      this.vx = Math.cos(heading) * speed;
      this.vy = Math.sin(heading) * speed;
    }
  }, {
    key: 'getHeading',
    value: function getHeading() {
      // Math.atan2 是正x轴和点（x，y）与原点连线之间，逆时针的角度所对应的弧度
      return Math.atan2(this.vy, this.vx);
    }
  }, {
    key: 'angleTo',
    value: function angleTo(p2) {
      return Math.atan2(p2.y - this.y, p2.x - this.x);
    }
  }, {
    key: 'update',
    value: function update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += gravity;

      this.vx *= this.friction;
      this.vy *= this.friction;

      if (this.radius < this.futurRadius && this.dying === false) {
        this.radius += duration;
      } else {
        this.dying = true;
      }

      if (this.dying === true) {
        this.radius -= duration;
      }

      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();

      if (this.y < 0 || this.radius < 1) {
        this.x = this.base[0];
        this.dying = false;
        this.y = this.base[1];
        this.radius = 1.1;
        this.setSpeed(speed);
        this.futurRadius = utils.randomInt(radius, radius + 3);
        this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)));
      }
    }
  }]);

  return Particle;
}();

var message = new Shape(w / 2, h / 2 + 50, fieldvalue);
message.getValue();

function update() {
  setTimeout(function () {
    ctx.clearRect(0, 0, w, h);
    message.placement.forEach(function (item) {
      item.update();
    });

    window.requestAnimationFrame(update);
  }, 1000 / FPS);
}
update();