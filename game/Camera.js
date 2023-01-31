import { X_BOUND_OFFSET, Y_BOUND_OFFSET } from "./Config";

export default new class Camera {

    mapSize = {
        width: 0,
        height: 0,
    }

    _x = window.innerWidth / 2 + X_BOUND_OFFSET;
    _y = window.innerHeight / 2 + Y_BOUND_OFFSET;

    set x(X) {
        if (X < window.innerWidth / 2 + X_BOUND_OFFSET) {
            X = window.innerWidth / 2 + X_BOUND_OFFSET;
        }
        else if (this.mapSize.width && X > this.mapSize.width - window.innerWidth / 2 - X_BOUND_OFFSET) {
            X = this.mapSize.width - window.innerWidth / 2 - X_BOUND_OFFSET;
        }
        this._x = X;
    }

    get x() {
        return this._x;
    }

    set y(Y) {
        if (Y < window.innerHeight / 2 + Y_BOUND_OFFSET) {
            Y = window.innerHeight / 2 + Y_BOUND_OFFSET;
        }
        else if (this.mapSize.height && Y > this.mapSize.height - window.innerHeight / 2 - Y_BOUND_OFFSET) {
            Y = this.mapSize.height - window.innerHeight / 2 - Y_BOUND_OFFSET;
        }
        this._y = Y;
    }

    get y() {
        return this._y;
    }

    /**
     * @readonly
     */
    get viewBoundingRect() {
        return {
            top: this.y - window.innerHeight / 2,
            left: this.x - window.innerWidth / 2,
            right: this.x + window.innerWidth / 2,
            bottom: this.y + window.innerHeight / 2
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setMapSize(width, height) {
        this.mapSize.width = width;
        this.mapSize.height = height;
    }
}