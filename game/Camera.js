import { X_BOUND_OFFSET, Y_BOUND_OFFSET } from "./Config";
import * as RectUtils from "../utils/RectUtils";

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

    isInView(x, y) {
        const { top, left, right, bottom } = this.viewBoundingRect;
        return x >= left && x <= right && y >= top && y <= bottom;
    }

    /**
     * 
     * @param {{top: Number, left: Number, width: Number, height: Number}} rect 
     * @returns 
     */
    isRectInView(rect) {
        const view = this.viewBoundingRect;
        const right = rect.left + rect.width;
        const bottom = rect.top + rect.height;

        const a = { x1: rect.left, y1: rect.top, x2: right, y2: bottom };
        const b = { x1: view.left, y1: view.top, x2: view.right, y2: view.bottom };

        return (
            RectUtils.contains(a, b) || 
            RectUtils.contains(b, a) ||
            RectUtils.overlaps(a, b)
        );
    }
}