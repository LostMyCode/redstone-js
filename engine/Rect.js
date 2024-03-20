export default class Rect {
    constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
        this.set(x1, y1, x2, y2);
    }

    /**
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     */
    set(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    add(x, y) {
        this.x1 += x;
        this.y1 += y;
        this.x2 += x;
        this.y2 += y;
    }

    isIn(x, y) {
        if (x < this.x1) return false;
        if (x > this.x2) return false;
        if (y < this.y1) return false;
        if (y > this.y2) return false;

        return true;
    }

    getLeft = () => Math.min(this.x1, this.x2);
    getRight = () => Math.max(this.x1, this.x2);
    getTop = () => Math.min(this.y1, this.y2);
    getBottom = () => Math.max(this.y1, this.y2);

    getWidth = () => this.getRight() - this.getLeft() + 1;
    getHeight = () => this.getBottom() - this.getTop() + 1;
    getSize = () => this.getWidth() * this.getHeight();
}