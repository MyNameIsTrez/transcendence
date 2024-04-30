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

  getData() {
    return {
      rects: [
        {
          color: 'white',
          pos: this._leftPlayer.paddle._pos,
          size: this._leftPlayer.paddle._size,
        },
        {
          color: 'white',
          pos: this._rightPlayer.paddle._pos,
          size: this._rightPlayer.paddle._size,
        },
        {
          color: 'yellow',
          pos: this._ball._pos,
          size: this._ball._size,
        },
      ],
      score: {
        leftPlayer: this._leftPlayer._score,
        rightPlayer: this._rightPlayer._score,
      },
    };
  }
}
