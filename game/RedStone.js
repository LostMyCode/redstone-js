import MainCanvas from "./MainCanvas";
import GameMap from "./GameMap";
import LoadingScreen from "./interface/LoadingScreen";
import Listener from "./Listener";

class RedStone {
    constructor() {
        this.mainCanvas = new MainCanvas(this);
        this.gameMap = new GameMap(this.mainCanvas);
    }

    async init() {

        // display loading screen
        await LoadingScreen.init(this.mainCanvas);
        LoadingScreen.render();

        // load common resources

        // check save data

        // load common resources
        await this.gameMap.loadCommon();

        // load map
        await this.gameMap.loadMap();

        // draw map
        this.gameMap.render();

        // render game
        // this.mainCanvas.render();

        LoadingScreen.destroy();
    }
}

export default RedStone;