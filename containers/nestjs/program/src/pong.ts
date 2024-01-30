const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;

class Velocity {
  _dx: number;
  _dy: number;
  constructor(dx: number = 0, dy: number = 0) {
    this._dx = dx;
    this._dy = dy;
  }
  invertdX() {
    this._dx = -this._dx;
  }
  invertdY() {
    this._dy = -this._dy;
  }
  get dx() {
    return this._dx;
  }
  get dy() {
    return this._dy;
  }
  set dx(dx) {
    this._dx = dx;
  }
  set dy(dy) {
    this._dy = dy;
  }
  get len() {
    return Math.sqrt(this._dx * this._dx + this._dy * this._dy);
  }
  set len(value: number) {
    {
      const fact = value / this.len;
      this._dx *= fact;
      this._dy *= fact;
    }
  }
  adjustAngle(multiplier: number) {
    const angleRange = Math.PI / 3;
    const adjustedAngle = Math.abs(multiplier) * (angleRange / 2);
    if (multiplier > 1) {
      multiplier = 1;
    }
    if (multiplier < -1) {
      multiplier = -1;
    }
    if (multiplier < 0 && this._dy < 0) {
      this.invertdY();
    } else if (multiplier > 0 && this._dy > 0) {
      this.invertdY();
    }
    const currentSpeed = this.len;
    if (this._dx < 0) {
      this._dx = -currentSpeed * Math.cos(adjustedAngle);
    } else {
      this._dx = currentSpeed * Math.cos(adjustedAngle);
    }
    if (this._dy < 0) {
      this._dy = -currentSpeed * Math.sin(adjustedAngle);
    } else {
      this._dy = currentSpeed * Math.sin(adjustedAngle);
    }
    this.len = currentSpeed;
  }
  calculateRandomAngle() {
    const angleRange = Math.PI / 4;
    return Math.random() * angleRange;
  }
  calculateRandomVelocity(speed: number) {
    if (speed == 0) {
      this._dx = 0;
      this._dy = 0;
      return;
    }
    const randomDirection = Math.random() < 0.5 ? 1 : -1;
    const randomAngle = this.calculateRandomAngle();
    this._dx = randomDirection * Math.cos(randomAngle);
    this._dy = Math.sin(randomAngle);
    this.len = speed;
  }
}

class Pos {
  x: number;
  y: number;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Size {
  w: number;
  h: number;
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }
}

class Rect {
  _pos: Pos;
  _size: Size;
  constructor(w, h, x, y) {
    this._pos = new Pos(x, y);
    this._size = new Size(w, h);
  }
  get left() {
    return this._pos.x;
  }
  get right() {
    return this._pos.x + this._size.w;
  }
  get top() {
    return this._pos.y;
  }
  get bottom() {
    return this._pos.y + this._size.h;
  }
}

class Paddle extends Rect {
  _score: number;
  constructor(w, h, x, y) {
    super(w, h, x, y);
    this._score = 0;
  }
  set score(score) {
    this._score = score;
  }
  get score() {
    return this._score;
  }
  collideWithBorder() {
    if (this.top > WINDOW_HEIGHT) {
      this._pos.y = WINDOW_HEIGHT - this._size.h;
    }
    if (this.bottom < 0) {
      this._pos.y = 0;
    }
  }
  addPoint() {
    this._score++;
  }
  updatePos(newY) {
    if (WINDOW_HEIGHT - newY < this._size.h / 2) {
      this._pos.y = WINDOW_HEIGHT - this._size.h;
      return;
    }
    if (newY < this._size.h / 2) {
      this._pos.y = 0;
      return;
    }
    this._pos.y = newY - this._size.h / 2;
  }
}

class Ball extends Rect {
  _vel: Velocity;
  _hidden: boolean;
  _speed: number;
  constructor(size, x, y) {
    super(size, size, x - size / 2, y - size / 2);
    this._vel = new Velocity();
    this._hidden = true;
    this._speed = 10;
  }
  updatePos(paddles) {
    this._pos.x += this._vel.dx;
    this._pos.y += this._vel.dy;

    for (let i = 0; i < paddles.length; i++) {
      this.collideWithPaddle(paddles[i]);
    }
    this.collideWithBorder(paddles);
  }
  collideWithBorder(paddles) {
    if (this.top <= 0 || this.bottom >= WINDOW_HEIGHT) {
      this._pos.y = this.top < 0 ? 0 : WINDOW_HEIGHT - this._size.h;
      this._vel.invertdY();
    }
    if (this.left <= 0 || this.right >= WINDOW_WIDTH) {
      if (this.top <= 0) {
        paddles[0].addPoint();
      } else {
        paddles[1].addPoint();
      }
      this._vel.invertdY();
      this.resetPos();
    }
  }
  collideWithPaddle(paddle) {
    const SPEED_MULTIPLIER = 1.05;
    if (
      this.left <= paddle.right &&
      this.right >= paddle.left &&
      this.bottom >= paddle.top &&
      this.top <= paddle.bottom
    ) {
      // TODO: wtf??
      if (this.left <= paddle.left || this.left <= paddle.right) {
        this._pos.x =
          this.left <= paddle.left ? paddle.left - this._size.w : paddle.right;
        const paddleCenter = paddle.top + paddle._size.h / 2;
        const ballCenter = this.top + this._size.h / 2;
        const distance = paddleCenter - ballCenter;
        const distanceMultiplier = distance / (paddle._size.h / 2);

        if (!(this.bottom <= paddle.top) && !(this.top >= paddle.bottom)) {
          this._vel.adjustAngle(distanceMultiplier);
        }

        this._vel.invertdX();
      }

      this._vel.len *= SPEED_MULTIPLIER;
    }
  }

  resetPos() {
    this._pos.x = WINDOW_WIDTH / 2;
    this._pos.y = WINDOW_HEIGHT / 2;
    // TODO: Move this to a different spot
    this._vel.calculateRandomVelocity(this._speed);
  }

  // get ballCenter() {
  //   return new Pos(
  //     this._pos.x + this._size.w / 2,
  //     this._pos.y + this._size.h / 2,
  //   );
  // }
}

// TODO: Nest this inside of the Data class
class ObjectData {
  pos: Pos;
  size: Size;

  constructor(pos: Pos, size: Size) {
    this.pos = pos;
    this.size = size;
  }
}

class Data {
  ball: ObjectData;
  leftPaddle: ObjectData;
  rightPaddle: ObjectData;

  constructor(ball: Ball, paddles: Paddle[]) {
    this.ball = new ObjectData(ball._pos, ball._size);
    this.leftPaddle = new ObjectData(paddles[0]._pos, paddles[0]._size);
    this.rightPaddle = new ObjectData(paddles[1]._pos, paddles[1]._size);
  }
}

export class Pong {
  _ball: Ball;
  _paddles: Paddle[];
  _data: Data;

  constructor() {
    const BALL_SIZE = 30;
    const BALL_X = WINDOW_WIDTH / 2;
    const BALL_Y = WINDOW_HEIGHT / 2;

    const PADDLE_WIDTH = WINDOW_WIDTH * 0.02;
    const PADDLE_HEIGHT = WINDOW_HEIGHT * 0.2;

    const PADDLE_LEFT_X = WINDOW_WIDTH * 0.01;
    const PADDLE_RIGHT_X = WINDOW_WIDTH - WINDOW_WIDTH * 0.03;
    const PADDLE_Y = WINDOW_HEIGHT / 2 - WINDOW_HEIGHT * 0.1;
    this._ball = new Ball(BALL_SIZE, BALL_X, BALL_Y);
    this._paddles = [
      new Paddle(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_LEFT_X, PADDLE_Y),
      new Paddle(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_RIGHT_X, PADDLE_Y),
    ];

    this._data = new Data(this._ball, this._paddles);
  }
  update() {
    this._paddles[1].updatePos(this._ball._pos.y); // Follow the ball
    this._ball.updatePos(this._paddles);
  }
  start() {
    this._ball._hidden = false;
    this._ball.resetPos();
  }
}
