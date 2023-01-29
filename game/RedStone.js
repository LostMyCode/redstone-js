import MainCanvas from "./MainCanvas";
import GameMap from "./GameMap";

class RedStone {
    constructor() {
        this.mainCanvas = new MainCanvas();
        this.gameMap = new GameMap(this.mainCanvas);
    }

    async init() {

        // display loading screen

        // load common resources

        // check save data

        // load map
        await this.gameMap.loadMap();

        // draw map
        this.gameMap.render();

        // render game
        this.mainCanvas.render();
    }
}

export default RedStone;