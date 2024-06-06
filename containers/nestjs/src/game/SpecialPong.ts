import {
  APong,
  Ball,
  Pos,
  Rect,
  Sides,
  Size,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from './APong';
import { Gamemode } from '../user/match.entity';

abstract class Item extends Rect {
  constructor(x: number, y: number, c: string) {
    super(Item.standardSize.w, Item.standardSize.h, x, y, c);
  }

  collidesWithBall(ball: Ball): boolean {
    return (
      this.left <= ball.right &&
      this.right >= ball.left &&
      this.bottom >= ball.top &&
      this.top <= ball.bottom
    );
  }

  static standardSize: Size = { w: 35, h: 35 };

  static generateRandomPos(): Pos {
    const xMinCeiled = Math.ceil(WINDOW_WIDTH / 3);
    const xMaxFloored = Math.floor(
      (WINDOW_WIDTH / 3) * 2 - Item.standardSize.w,
    );
    const x = Math.random() * (xMaxFloored - xMinCeiled) + xMinCeiled;
    const y = Math.random() * (WINDOW_HEIGHT - Item.standardSize.h);
    return { x, y };
  }

  abstract onPickup(itemOwnerId: number): void;
  abstract activeLoopHook(game: APong): boolean;
  abstract onPaddleHit(game: APong): boolean;
  abstract onDestroy(game: APong): void;
}

class ReverseControlItem extends Item {
  constructor(x: number, y: number) {
    super(x, y, 'purple');
  }

  private _affectedPlayerId: number;
  private _remainingTurns = 3;

  onPickup(itemOwnerId: number) {
    // Set affectedPlayerId to opponent id
    this._affectedPlayerId = 1 - itemOwnerId;
  }

  activeLoopHook(game: APong) {
    if (game._leftPlayer.id === this._affectedPlayerId) {
      game._leftPlayer.paddle._color = 'purple';
      game._leftPlayer.paddle.dyNorth = Math.max(
        game._leftPlayer.paddle.dyNorth * -1,
        game._leftPlayer.paddle.dyNorth,
      );
      game._leftPlayer.paddle.dySouth = Math.min(
        game._leftPlayer.paddle.dySouth * -1,
        game._leftPlayer.paddle.dySouth,
      );
    } else {
      game._rightPlayer.paddle._color = 'purple';
      game._rightPlayer.paddle.dyNorth = Math.max(
        game._rightPlayer.paddle.dyNorth * -1,
        game._rightPlayer.paddle.dyNorth,
      );
      game._rightPlayer.paddle.dySouth = Math.min(
        game._rightPlayer.paddle.dySouth * -1,
        game._rightPlayer.paddle.dySouth,
      );
    }
    return true;
  }

  onPaddleHit(game: APong) {
    if (game._leftPlayer.id === this._affectedPlayerId) {
      if (game.collidedWithBorder === Sides.LeftPaddle) {
        this._remainingTurns--;
      }
    } else {
      if (game.collidedWithBorder === Sides.RightPaddle) {
        this._remainingTurns--;
      }
    }
    return this._remainingTurns > 0;
  }

  onDestroy(game: APong) {
    if (game._leftPlayer.id === this._affectedPlayerId) {
      game._leftPlayer.paddle._color = 'white';
    } else {
      game._rightPlayer.paddle._color = 'white';
    }
  }
}

class InvisibleBallItem extends Item {
  constructor(x: number, y: number) {
    super(x, y, 'silver');
  }

  private static readonly _originalBallColor = 'white';

  onPickup() {}

  activeLoopHook(game: APong) {
    game._ball._color = 'transparent';
    return true;
  }

  onPaddleHit() {
    return false;
  }

  onDestroy(game: APong) {
    game._ball._color = InvisibleBallItem._originalBallColor;
  }
}

class SmallerPaddleItem extends Item {
  constructor(x: number, y: number) {
    super(x, y, 'pink');
  }

  private _affectedPlayerId: number;
  private _remainingTurns: number = 3;

  onPickup(itemOwnerId: number) {
    this._affectedPlayerId = 1 - itemOwnerId;
  }

  activeLoopHook(game: APong) {
    const player =
      game._leftPlayer.id === this._affectedPlayerId
        ? game._leftPlayer
        : game._rightPlayer;
    const paddleCenter = player.paddle._pos.y + player.paddle._size.h / 2;

    player.paddle._size.h = WINDOW_HEIGHT * 0.15;
    player.paddle._pos.y = paddleCenter - player.paddle._size.h / 2;

    return true;
  }

  onPaddleHit(game: APong) {
    if (game._leftPlayer.id === this._affectedPlayerId) {
      if (game.collidedWithBorder === Sides.LeftPaddle) {
        this._remainingTurns--;
      }
    } else {
      if (game.collidedWithBorder === Sides.RightPaddle) {
        this._remainingTurns--;
      }
    }
    return this._remainingTurns > 0;
  }

  onDestroy(game: APong) {
    const player =
      game._leftPlayer.id === this._affectedPlayerId
        ? game._leftPlayer
        : game._rightPlayer;
    const paddleCenter = player.paddle._pos.y + player.paddle._size.h / 2;

    player.paddle._size.h = WINDOW_HEIGHT * 0.2;
    const targetPos = paddleCenter - player.paddle._size.h / 2;
    player.paddle._pos.y = Math.max(
      Math.min(targetPos, WINDOW_HEIGHT - player.paddle._size.h),
      0,
    );
  }
}

export default class SpecialPong extends APong {
  constructor(winScore: number) {
    super(winScore);
    this.gamemode = Gamemode.SPECIAL;
  }

  private readonly _availableItems: Array<(x: number, y: number) => Item> = [
    (x: number, y: number) => new ReverseControlItem(x, y),
    (x: number, y: number) => new InvisibleBallItem(x, y),
    (x: number, y: number) => new SmallerPaddleItem(x, y),
  ];
  private _itemsOnMap: Array<Item> = [];
  private _itemsPickedUp: Array<Item> = [];

  update() {
    // Update the ball position
    this._ball.updatePos();

    // Check if any items were picked up
    for (let i: number = 0; i < this._itemsOnMap.length; i++) {
      const item: Item = this._itemsOnMap[i];
      if (item.collidesWithBall(this._ball)) {
        // Decides who should be the item owner
        const id = this._ball._vel.dx > 0 ? 0 : 1;
        item.onPickup(id);
        this._itemsPickedUp.push(item);
        this._itemsOnMap.splice(i, 1);
        // To accommodate for the i++ that happens in the for loop while all the items get pushed to the left, due to the splice()
        i--;
      }
    }

    // Do item effects of picked up items
    for (let i: number = 0; i < this._itemsPickedUp.length; i++) {
      const item: Item = this._itemsPickedUp[i];
      const doesItemContinue: boolean = item.activeLoopHook(this);
      if (!doesItemContinue) {
        item.onDestroy(this);
        this._itemsPickedUp.splice(i, 1);
        // To accommodate for the i++ that happens in the for loop while all the items gets pushed to the left because of the splice()
        i--;
      }
    }

    // Update player paddles positions
    this._leftPlayer.update();
    this._rightPlayer.update();

    // Check if the ball colided with a player
    this.collidedWithBorder = this._ball.collide(
      this._leftPlayer,
      this._rightPlayer,
    );
    if (this.collidedWithBorder === Sides.Left) {
      this._rightPlayer.addPoint();
      this.reset();
      return;
    } else if (this.collidedWithBorder === Sides.Right) {
      this._leftPlayer.addPoint();
      this.reset();
      return;
    }

    // If ball hits paddle
    if (
      this.collidedWithBorder === Sides.LeftPaddle ||
      this.collidedWithBorder === Sides.RightPaddle
    ) {
      // Apply item onPaddleHit function
      for (let i = 0; i < this._itemsPickedUp.length; i++) {
        const item = this._itemsPickedUp[i];
        const doesItemContinue = item.onPaddleHit(this);
        if (!doesItemContinue) {
          item.onDestroy(this);
          this._itemsPickedUp.splice(i, 1);
          // To accommodate for the i++ that happens in the for loop while all the items gets pushed to the left because of the splice()
          i--;
        }
      }
      // 1/4 chance to spawn an item
      if (Math.random() <= 0.33) {
        const pos = Item.generateRandomPos();
        this._itemsOnMap.push(
          this._availableItems[
            Math.floor(Math.random() * this._availableItems.length)
          ](pos.x, pos.y),
        );
      }
    }
  }

  getData() {
    const rects: Array<any> = [];
    rects.push({
      color: this._leftPlayer.paddle._color,
      pos: this._leftPlayer.paddle._pos,
      size: this._leftPlayer.paddle._size,
    });
    rects.push({
      color: this._rightPlayer.paddle._color,
      pos: this._rightPlayer.paddle._pos,
      size: this._rightPlayer.paddle._size,
    });
    rects.push({
      color: this._ball._color,
      pos: this._ball._pos,
      size: this._ball._size,
    });
    for (const item of this._itemsOnMap) {
      rects.push({
        color: item._color,
        pos: item._pos,
        size: item._size,
      });
    }
    return {
      rects,
      score: {
        leftPlayer: this._leftPlayer._score,
        rightPlayer: this._rightPlayer._score,
      },
    };
  }

  reset(): void {
    for (const item of this._itemsPickedUp) {
      item.onDestroy(this);
    }
    this._itemsPickedUp = [];
    this._itemsOnMap = [];
    this._ball.reset();
    this.collidedWithBorder = Sides.None;
  }
}
