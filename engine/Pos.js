export default class Pos {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    move(x, y) {
        this.x += x;
        this.y += y;
    }

    /**
     * @param {Pos} pos 
     */
    match(pos) {
        return this.x === pos.x && this.y === pos.y;
    }
}