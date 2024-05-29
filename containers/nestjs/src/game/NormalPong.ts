import { APong, Sides } from './APong';
import { Gamemode } from '../users/match.entity';

export default class NormalPong extends APong {
  constructor(winScore: number) {
    super(winScore);
    this.gamemode = Gamemode.NORMAL;
  }

  update() {
    this._leftPlayer.update();
    this._rightPlayer.update();

    this._ball.updatePos();
    this.collidedWithBorder = this._ball.collide(
      this._leftPlayer,
      this._rightPlayer,
    );
    if (this.collidedWithBorder == Sides.Left) {
      this._rightPlayer.addPoint();
      this.reset();
      return;
    } else if (this.collidedWithBorder == Sides.Right) {
      this._leftPlayer.addPoint();
      this.reset();
      return;
    }
  }

  getData() {
    return {
      rects: [
        {
          color: this._leftPlayer.paddle._color,
          pos: this._leftPlayer.paddle._pos,
          size: this._leftPlayer.paddle._size,
        },
        {
          color: this._rightPlayer.paddle._color,
          pos: this._rightPlayer.paddle._pos,
          size: this._rightPlayer.paddle._size,
        },
        {
          color: this._ball._color,
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
  reset(): void {
    this._ball.reset();
  }
}
