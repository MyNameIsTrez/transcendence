class Point {
	constructor(x = 0, y = 0) {
		this._x = x;
		this._y = y;
	}
	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}
	set x(x) {
		this._x = x;
	}
	set y(y) {
		this._y = y;
	}
}

class Velocity {
	constructor(dx = 0, dy = 0) {
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
	set len(value) {
		{
			const fact = value / this.len;
			this._dx *= fact;
			this._dy *= fact;
		}
	}
	adjustAngle(multiplier) {

		const angleRange = Math.PI / 3;
		const adjustedAngle = (Math.abs(multiplier)) * (angleRange / 2);
		if (multiplier > 1)
			multiplier = 1;
		if (multiplier < -1)
			multiplier = -1;
		if (multiplier < 0 && this._dy < 0) {
			this.invertdY();
		}
		else if (multiplier > 0 && this._dy > 0) {
			this.invertdY();
		}
		const currentSpeed = this.len;
		if (this._dx < 0)
			this._dx = -currentSpeed * Math.cos(adjustedAngle);
		else
			this._dx = currentSpeed * Math.cos(adjustedAngle);
		if (this._dy < 0)
			this._dy = -currentSpeed * Math.sin(adjustedAngle);
		else
			this._dy = currentSpeed * Math.sin(adjustedAngle);
		this.len = currentSpeed;
	}
	calculateRandomAngle() {
		const angleRange = Math.PI / 4;
		return Math.random() * angleRange;
	}
	calculateRandomVelocity(speed) {
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

class Rect {
	constructor(w, h, x, y) {
		this._pos = new Point(x, y);
		this._size = new Point(w, h);
	}
	get left() {
		return this._pos.x;
	}
	get right() {
		return this._pos.x + this._size.x;
	}
	get top() {
		return this._pos.y;
	}
	get bottom() {
		return this._pos.y + this._size.y;
	}
}

class Paddle extends Rect {
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
	draw(context) {
		context.fillStyle = "white";
		context.fillRect(this._pos.x, this._pos.y, this._size.x, this._size.y);
	}
	collideWithCanvas(canvas) {
		if (this.top > canvas.height) {
			this._pos.y = canvas.height - this._size.y;
		}
		if (this.bottom < 0) {
			this._pos.y = 0;
		}
	}
	addPoint() {
		this._score++;
	}
	updatePos(canvas, newY) {

		if (canvas.height - newY < this._size.y / 2) {
			this._pos.y = canvas.height - this._size.y;
			return;
		}
		if (newY < this._size.y / 2) {
			this._pos.y = 0;
			return;
		}
		this._pos.y = newY - this._size.y / 2;

	}

}

class Ball extends Rect {
	constructor(w, h, x, y) {
		super(w, h, x, y);
		this._vel = new Velocity();
	this._hidden = true;
	}
	updatePos(dt, canvas, paddles) {
		this._pos.x += this._vel.dx * dt;
		this._pos.y += this._vel.dy * dt;

		for (let i = 0; i < paddles.length; i++) {
			this.collideWithPaddle(paddles[i]);
		}
		this.collideWithCanvas(canvas, paddles);
	}
	collideWithCanvas(canvas, paddles) {
		if (this.top <= 0 || this.bottom >= canvas.height) {
			this._pos.y = this.top < 0 ? 0 : canvas.height - this._size.y;
			this._vel.invertdY();
		}
		if (this.left <= 0 || this.right >= canvas.width) {
			if (this.top <= 0)
				paddles[0].addPoint();
			else
				paddles[1].addPoint();
			this._vel.invertdY();
			this.resetPos(canvas);
		}
	}
	collideWithPaddle(paddle) {
		const SPEED_MULTIPLIER = 1.05;
		if (this.left <= paddle.right &&
			this.right >= paddle.left &&
			this.bottom >= paddle.top &&
			this.top <= paddle.bottom) {
			if (this.left <= paddle.left || this.left <= paddle.right) {
				this._pos.x = this.left <= paddle.left ? paddle.left - this._size.x : paddle.right;
				const paddleCenter = paddle.top + paddle._size.y / 2;
				const ballCenter = this.top + this._size.y / 2;
				const distance = paddleCenter - ballCenter;
				const distanceMultiplier = distance / (paddle._size.y / 2);
				if (!(this.bottom <= paddle.top) && !(this.top >= paddle.bottom))
					this._vel.adjustAngle(distanceMultiplier);
				this._vel.invertdX();
			}
			this._vel.len *= SPEED_MULTIPLIER;
		}
	}
	draw(context) {
		if (this._hidden == false)
		{
			context.fillStyle = "white";
			context.fillRect(this._pos.x, this._pos.y, this._size.x, this._size.y);
		}
	}
	resetPos(canvas) {
		this._pos.x = canvas.width / 2;
		this._pos.y = canvas.height / 2;
		this._vel.calculateRandomVelocity(canvas.width * 0.5);
	}
	get ballCenter() {
		return new Point(this._pos.x + this._size.x / 2, this._pos.y + this._size.y / 2);
	}
}

class Numbers {
	constructor() {
		this._char_pixel = 10;
		this._numbers = [
			'111101101101111',
			'010010010010010',
			'111001111100111',
			'111001111001111',
			'101101111001001',
			'111100111001111',
			'111100111101111',
			'111001001001001',
			'111101111101111',
			'111101111001111'
		].map(str => {
			let canvas = document.createElement("canvas");
			canvas.height = this._char_pixel * 5;
			canvas.width = this._char_pixel * 3;
			let context = canvas.getContext("2d");
			context.fillStyle = "white";
			str.split("").forEach((fill, i) => {
				if (fill === "1") {
					context.fillRect((i % 3) * this._char_pixel,
						(i / 3 | 0) * this._char_pixel,
						this._char_pixel,
						this._char_pixel);
				}
			});
			return (canvas);
		});
	}
	get char_pixel() {
		return this._char_pixel;
	}
	set char_pixel(value) {
		this._char_pixel = value;
	}
}

class ScoreBoard {
	constructor(canvas) {
		this._canvas = canvas;
		this._context = this._canvas.getContext("2d");
		this._numbers = new Numbers(this._canvas.width / 2, 50);
	}
	updateScore(paddles) {
		const align = this._canvas.width / 3;
		const CHAR_W = this._numbers.char_pixel * 4;
		paddles.forEach((paddle, i) => {
			const chars = paddle.score.toString().split("");
			const offset = align * (i + 1) -
				(CHAR_W * chars.length / 2) +
				this._numbers.char_pixel / 2;
			chars.forEach((char, pos) => {
				this._context.drawImage(this._numbers._numbers[char | 0],
					offset + pos * CHAR_W, 20);
			})
		});
	}
}

class StartButton {
	constructor() {

		this._button = document.getElementById("start-button");
	}
}

class Pong {
	constructor(canvas) {
		this._canvas = canvas;
		if (window.innerWidth / 16 > window.innerHeight / 9) {
			this._canvas.width = (window.innerHeight * 0.8) / 9 * 16;
			this._canvas.height = (window.innerHeight * 0.8);
		}
		else {
			this._canvas.width = (window.innerWidth * 0.8);
			this._canvas.height = (window.innerWidth * 0.8)/16 * 9;
		}

		this._context = this._canvas.getContext("2d");
		this._startButton = new StartButton();
		const BALL_WIDTH = this._canvas.width * 0.03;
		const BALL_HEIGHT = this._canvas.width * 0.03;
		const BALL_X = this._canvas.width / 2;
		const BALL_Y = this._canvas.height / 2;

		const PADDLE_WIDTH = this._canvas.width * 0.02;
		const PADDLE_HEIGHT = this._canvas.height * 0.2;
		const PADDLE_LEFT_X = this._canvas.width * 0.01;
		const PADDLE_RIGHT_X = this._canvas.width - this._canvas.width * 0.03;
		const PADDLE_Y = this._canvas.height / 2 - this._canvas.height * 0.1;
		this._scoreBoard = new ScoreBoard(this._canvas);
		this._ball = new Ball(BALL_WIDTH, BALL_HEIGHT, BALL_X, BALL_Y);
		this._paddles = [
			new Paddle(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_LEFT_X, PADDLE_Y),
			new Paddle(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_RIGHT_X, PADDLE_Y)
		]
		// this._canvas.addEventListener("mousemove", event => {
		// 	const scale = event.offsetY / event.target.getBoundingClientRect().height;
		// 	pong._paddles[0].updatePos(canvas, canvas.height * scale);
		// });
		this._startButton._button.addEventListener('click', event => {
			this._canvas.addEventListener("mousemove", event => {
				const scale = event.offsetY / event.target.getBoundingClientRect().height;
				pong._paddles[0].updatePos(canvas, canvas.height * scale);
			});
			pong.start();
			this._startButton._button.hidden = true;
		});
		let lastTime;
		const callback = (millis) => {
			if (lastTime) {
				this.render((millis - lastTime) / 1000);
			}
			lastTime = millis;
			requestAnimationFrame(callback);
		}
		callback();
	}
	drawCanvas() {
		this._context.fillStyle = "black";
		this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
	}
	render(dt) {
		this._paddles[1].updatePos(this._canvas, this._ball._pos.y);// Follow the ball
		this._ball.updatePos(dt, this._canvas, this._paddles)

		// Draw
		this.drawCanvas();
		this._ball.draw(this._context);
		this._paddles.forEach(paddle => {
			paddle.draw(this._context);
		});
		this._scoreBoard.updateScore(this._paddles);
	console.log(this._ball._vel.len);
	}
	start() {
		this._ball._hidden = false;
		this._ball.resetPos(this._canvas);
	}
}

const canvas = document.getElementById("pong");
const pong = new Pong(canvas);
