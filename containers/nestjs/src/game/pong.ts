import { Socket } from 'socket.io'

const WINDOW_WIDTH = 1920
const WINDOW_HEIGHT = 1080

class Pos {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

class Size {
  w: number
  h: number
  constructor(w: number, h: number) {
    this.w = w
    this.h = h
  }
}

class Rect {
  _pos: Pos
  _size: Size
  constructor(w: number, h: number, x: number, y: number) {
    this._pos = new Pos(x, y)
    this._size = new Size(w, h)
  }
  get left() {
    return this._pos.x
  }
  get right() {
    return this._pos.x + this._size.w
  }
  get top() {
    return this._pos.y
  }
  get bottom() {
    return this._pos.y + this._size.h
  }
}

class Velocity {
  _dx: number
  _dy: number
  constructor(dx: number = 0, dy: number = 0) {
    this._dx = dx
    this._dy = dy
  }
  invertdX() {
    this._dx = -this._dx
  }
  invertdY() {
    this._dy = -this._dy
  }
  get dx() {
    return this._dx
  }
  get dy() {
    return this._dy
  }
  set dx(dx) {
    this._dx = dx
  }
  set dy(dy) {
    this._dy = dy
  }
  get len() {
    return Math.sqrt(this._dx * this._dx + this._dy * this._dy)
  }
  set len(value: number) {
    {
      const fact = value / this.len
      this._dx *= fact
      this._dy *= fact
    }
  }
  adjustAngle(multiplier: number) {
    const angleRange = Math.PI / 3
    const adjustedAngle = Math.abs(multiplier) * (angleRange / 2)
    if (multiplier > 1) {
      multiplier = 1
    }
    if (multiplier < -1) {
      multiplier = -1
    }
    if (multiplier < 0 && this._dy < 0) {
      this.invertdY()
    } else if (multiplier > 0 && this._dy > 0) {
      this.invertdY()
    }
    const currentSpeed = this.len
    if (this._dx < 0) {
      this._dx = -currentSpeed * Math.cos(adjustedAngle)
    } else {
      this._dx = currentSpeed * Math.cos(adjustedAngle)
    }
    if (this._dy < 0) {
      this._dy = -currentSpeed * Math.sin(adjustedAngle)
    } else {
      this._dy = currentSpeed * Math.sin(adjustedAngle)
    }
    this.len = currentSpeed
  }
  calculateRandomAngle() {
    const angleRange = Math.PI / 4
    return Math.random() * angleRange
  }
  setRandomVelocity(speed: number) {
    if (speed == 0) {
      this._dx = 0
      this._dy = 0
      return
    }
    const randomDirection = Math.random() < 0.5 ? 1 : -1
    const randomAngle = this.calculateRandomAngle()
    this._dx = randomDirection * Math.cos(randomAngle)
    this._dy = Math.sin(randomAngle)
    this.len = speed
  }
}

class Paddle extends Rect {
  dyNorth: number
  dySouth: number

  constructor(w: number, h: number, x: number, y: number) {
    super(w, h, x, y)
    this.dyNorth = 0
    this.dySouth = 0
  }

  collideWithBorder() {
    if (this.top > WINDOW_HEIGHT) {
      this._pos.y = WINDOW_HEIGHT - this._size.h
    }

    if (this.bottom < 0) {
      this._pos.y = 0
    }
  }

  updatePos(newY: number) {
    if (WINDOW_HEIGHT - newY < this._size.h / 2) {
      this._pos.y = WINDOW_HEIGHT - this._size.h
      return
    }

    if (newY < this._size.h / 2) {
      this._pos.y = 0
      return
    }

    this._pos.y = newY - this._size.h / 2
  }
}

class Player {
  _socket: Socket | null
  _score: number
  paddle: Paddle
  constructor(x: number) {
    this._socket = null
    this._score = 0

    this.paddle = new Paddle(
      WINDOW_WIDTH * 0.02,
      WINDOW_HEIGHT * 0.2,
      x,
      WINDOW_HEIGHT / 2 - WINDOW_HEIGHT * 0.1
    )
  }

  update() {
    this.paddle.updatePos(
      this.paddle._pos.y + this.paddle.dyNorth + this.paddle.dySouth + this.paddle._size.h / 2
    )
  }

  addPoint() {
    this._score++
  }
}

class Ball extends Rect {
  _speed: number
  _vel: Velocity
  _hidden: boolean
  constructor(size = 30, x = WINDOW_WIDTH / 2, y = WINDOW_HEIGHT / 2) {
    super(size, size, x - size / 2, y - size / 2)
    this._speed = 10
    this._vel = new Velocity()
    this._vel.setRandomVelocity(this._speed)
    this._hidden = true
  }
  updatePos() {
    this._pos.x += this._vel.dx
    this._pos.y += this._vel.dy
  }

  // TODO: Maybe don't pass this method the players?
  collide(leftPlayer: Player, rightPlayer: Player) {
    this.collideWithPaddle(leftPlayer.paddle)
    this.collideWithPaddle(rightPlayer.paddle)

    this.collideWithBorder(leftPlayer, rightPlayer)
  }

  collideWithBorder(leftPlayer: Player, rightPlayer: Player) {
    if (this.top <= 0 || this.bottom >= WINDOW_HEIGHT) {
      this._pos.y = this.top < 0 ? 0 : WINDOW_HEIGHT - this._size.h
      this._vel.invertdY()
    }
    if (this.left <= 0 || this.right >= WINDOW_WIDTH) {
      if (this.left <= 0) {
        rightPlayer.addPoint()
      } else {
        leftPlayer.addPoint()
      }
      this._vel.invertdY()
      this.reset()
    }
  }
  collideWithPaddle(paddle: Paddle) {
    const SPEED_MULTIPLIER = 1.05
    if (
      this.left <= paddle.right &&
      this.right >= paddle.left &&
      this.bottom >= paddle.top &&
      this.top <= paddle.bottom
    ) {
      if (this.left <= paddle.left || this.left <= paddle.right) {
        this._pos.x = this.left <= paddle.left ? paddle.left - this._size.w : paddle.right
        const paddleCenter = paddle.top + paddle._size.h / 2
        const ballCenter = this.top + this._size.h / 2
        const distance = paddleCenter - ballCenter
        const distanceMultiplier = distance / (paddle._size.h / 2)

        if (this.bottom > paddle.top && this.top < paddle.bottom) {
          this._vel.adjustAngle(distanceMultiplier)
        }

        this._vel.invertdX()
      }

      this._vel.len *= SPEED_MULTIPLIER
    }
  }

  reset() {
    this._pos.x = WINDOW_WIDTH / 2
    this._pos.y = WINDOW_HEIGHT / 2

    this._vel.setRandomVelocity(this._speed)
  }

  // get ballCenter() {
  //   return new Pos(
  //     this._pos.x + this._size.w / 2,
  //     this._pos.y + this._size.h / 2,
  //   );
  // }
}

export class Pong {
  _ball: Ball
  _leftPlayer: Player
  _rightPlayer: Player

  constructor() {
    const PADDLE_LEFT_X = WINDOW_WIDTH * 0.01
    const PADDLE_RIGHT_X = WINDOW_WIDTH - WINDOW_WIDTH * 0.03

    this._ball = new Ball()

    this._leftPlayer = new Player(PADDLE_LEFT_X)
    this._rightPlayer = new Player(PADDLE_RIGHT_X)
  }

  updateElements() {
    this._leftPlayer.update()
    this._rightPlayer.update()

    this._ball.updatePos()
    this._ball.collide(this._leftPlayer, this._rightPlayer)
  }

  didSomeoneWin(): boolean {
    return this.didLeftWin() || this.didRightWin()
  }

  didLeftWin(): boolean {
    return this._leftPlayer._score >= 1
  }

  didRightWin(): boolean {
    return this._rightPlayer._score >= 1
  }

  resetGame() {
    this._ball._hidden = false
    this._ball.reset()
    this._leftPlayer._score = 0
    this._rightPlayer._score = 0
  }

  getData() {
    return {
      ball: {
        pos: this._ball._pos,
        size: this._ball._size
      },
      leftPlayer: {
        score: this._leftPlayer._score,
        paddle: {
          pos: this._leftPlayer.paddle._pos,
          size: this._leftPlayer.paddle._size
        }
      },
      rightPlayer: {
        score: this._rightPlayer._score,
        paddle: {
          pos: this._rightPlayer.paddle._pos,
          size: this._rightPlayer.paddle._size
        }
      }
    }
  }

  movePaddle(paddle: Paddle, keydown: boolean, north: boolean) {
    if (north) {
      paddle.dyNorth = keydown ? -10 : 0
    } else {
      paddle.dySouth = keydown ? 10 : 0
    }
  }
}
