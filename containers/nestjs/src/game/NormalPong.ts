import { APong } from './APong';

export default class NormalPong extends APong {
  constructor(winScore: number) {
    super(winScore);
    this.type = 'normal';
  }

  update() {
    this._leftPlayer.update();
    this._rightPlayer.update();

    this._ball.updatePos();
    this._ball.collide(this._leftPlayer, this._rightPlayer);
  }

  // TODO: Use?
  // resetGame() {
  //   this._ball._hidden = false;
  //   this._ball.reset();
  //   this._leftPlayer._score = 0;
  //   this._rightPlayer._score = 0;
  // }

  getData() {
    return {
      ball: {
        pos: this._ball._pos,
        size: this._ball._size,
      },
      leftPlayer: {
        score: this._leftPlayer._score,
        paddle: {
          pos: this._leftPlayer.paddle._pos,
          size: this._leftPlayer.paddle._size,
        },
      },
      rightPlayer: {
        score: this._rightPlayer._score,
        paddle: {
          pos: this._rightPlayer.paddle._pos,
          size: this._rightPlayer.paddle._size,
        },
      },
    };
  }
}
