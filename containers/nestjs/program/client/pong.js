const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;

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
      '111101111001111',
    ].map((str) => {
      let canvas = document.createElement('canvas');
      canvas.height = this._char_pixel * 5;
      canvas.width = this._char_pixel * 3;
      let context = canvas.getContext('2d');
      context.fillStyle = 'white';
      str.split('').forEach((fill, i) => {
        if (fill === '1') {
          context.fillRect(
            (i % 3) * this._char_pixel,
            ((i / 3) | 0) * this._char_pixel,
            this._char_pixel,
            this._char_pixel,
          );
        }
      });
      return canvas;
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
    this._context = this._canvas.getContext('2d');
    this._numbers = new Numbers(this._canvas.width / 2, 50);
    this._align = this._canvas.width / 3;
    this._CHAR_W = this._numbers.char_pixel * 4;
  }
  updateScore(leftScore, rightScore) {
    this.drawScore(leftScore, 0);
    this.drawScore(rightScore, 1);
  }
  drawScore(score, i) {
    const chars = score.toString().split('');
    const offset =
      this._align * (i + 1) -
      this._CHAR_W * (chars.length / 2) +
      this._numbers.char_pixel / 2;
    chars.forEach((char, pos) => {
      this._context.drawImage(
        this._numbers._numbers[char | 0],
        offset + pos * this._CHAR_W,
        20,
      );
    });
  }
}

class StartButton {
  constructor() {
    this._button = document.getElementById('start-button');
  }
}

class Pong {
  constructor() {
    this._canvas = document.getElementById('pong');

    this._canvas.width = WINDOW_WIDTH;
    this._canvas.height = WINDOW_HEIGHT;

    // if (window.innerWidth / 16 > window.innerHeight / 9) {
    //   this._canvas.width = (window.innerHeight * 0.8) / 9 * 16;
    //   this._canvas.height = (window.innerHeight * 0.8);
    // } else {
    //   this._canvas.width = (window.innerWidth * 0.8);
    //   this._canvas.height = (window.innerWidth * 0.8)/16 * 9;
    // }

    this._context = this._canvas.getContext('2d');
    // this._startButton = new StartButton();
    this._scoreBoard = new ScoreBoard(this._canvas);
    // this._canvas.addEventListener('mousemove', event => {
    // 	const scale = event.offsetY / event.target.getBoundingClientRect().height;
    // 	pong._paddles[0].updatePos(canvas, canvas.height * scale);
    // });
    // this._startButton._button.addEventListener('click', event => {
    //   this._canvas.addEventListener('mousemove', event => {
    //     const scale = event.offsetY / event.target.getBoundingClientRect().height;
    //     pong._paddles[0].updatePos(canvas, canvas.height * scale);
    //   });
    //   pong.start();
    //   this._startButton._button.hidden = true;
    // });
  }
  drawObject(color, obj) {
    this._context.fillStyle = color;
    this._context.fillRect(obj.pos.x, obj.pos.y, obj.size.w, obj.size.h);
  }
  drawCanvas() {
    this._context.fillStyle = 'black';
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
  }
  render(data) {
    this.drawCanvas();

    this.drawObject('white', data.ball);
    this.drawObject('white', data.leftPlayer.paddle);
    this.drawObject('white', data.rightPlayer.paddle);

    this._scoreBoard.updateScore(
      data.leftPlayer.score,
      data.rightPlayer.score,
    );
  }
  start() {
    this._ball._hidden = false;
    this._ball.resetPos(this._canvas);
  }
}

// class Data {
//   constructor(ball) {
//     this.ballPos = ball._pos;
//     this.ballSize = ball._size;
//   }
// }

const pong = new Pong();

const socket = io('http://localhost:4242');
socket.on('connect', () => {
  console.log('Connected');

  socket.emit('events', { test: 'test' });
  socket.emit('identity', 0, (response) => {
    console.log('Identity:', response);
  });
});
socket.on('events', (data) => {
  console.log('event', data);
});
socket.on('exception', (data) => {
  console.log('event', data);
});
socket.on('disconnect', () => {
  console.log('Disconnected');
});
socket.on('pong', (data) => {
  // pong._ball._pos = data.ball.pos;
//   console.log(data);
  pong.render(data);
});

document.addEventListener(
	"keydown",
	(event) => {
		const keyName = event.key;
		console.log(keyName);
		socket.emit('pressed', keyName);
	}
)

document.addEventListener(
	"keyup",
	(event) => {
		const keyName = event.key;
		console.log(keyName);
		socket.emit('released', keyName);
	}
)
