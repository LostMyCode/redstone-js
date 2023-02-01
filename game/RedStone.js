import MainCanvas from "./MainCanvas";
import GameMap from "./GameMap";
import LoadingScreen from "./interface/LoadingScreen";
import Listener from "./Listener";
import Player from "./Player";

class RedStone {

    /**
     * @type {MainCanvas}
     */
    static mainCanvas;
    /**
     * @type {GameMap}
     */
    static gameMap;
    /**
     * @type {Player}
     */
    static player;

    static async init() {
        RedStone.mainCanvas = new MainCanvas();
        RedStone.gameMap = new GameMap();
        RedStone.player = new Player();

        // display loading screen
        await LoadingScreen.init();
        LoadingScreen.render();

        // load common resources

        // check save data

        // load common resources
        await RedStone.gameMap.loadCommon();

        // load player

        // init map
        await RedStone.gameMap.init();

        LoadingScreen.destroy();
    }
}

export default RedStone;