
const X_BOUND_OFFSET = 64;
const Y_BOUND_OFFSET = 32;

export default new class Camera {
    viewBoundingRect = {
        top: 0,
        left: 0,
        right: window.innerWidth,
        height: window.innerHeight
    }

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

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setMapSize(width, height) {
        this.mapSize.width = width;
        this.mapSize.height = height;
    }
}