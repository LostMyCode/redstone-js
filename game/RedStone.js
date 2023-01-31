import MainCanvas from "./MainCanvas";
import GameMap from "./GameMap";
import LoadingScreen from "./interface/LoadingScreen";
import Listener from "./Listener";
import Player from "./Player";

class RedStone {

    static mainCanvas = new MainCanvas();
    static gameMap = new GameMap();
    static player = new Player();

    static async init() {

        // display loading screen
        await LoadingScreen.init();
        LoadingScreen.render();

        // load common resources

        // check save data

        // load common resources
        await RedStone.gameMap.loadCommon();

        // load player

        // load map
        await RedStone.gameMap.loadMap();

        // draw map
        RedStone.gameMap.render();

        LoadingScreen.destroy();
    }
}

export default RedStone;