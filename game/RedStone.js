import MainCanvas from "./MainCanvas";
import GameMap from "./GameMap";
import LoadingScreen from "./interface/LoadingScreen";
import Listener from "./Listener";
import Player from "./Player";
import CommonUI from "./interface/CommonUI";
import { fetchBinaryFile } from "../utils";
import { DATA_DIR } from "./Config";
import BufferReader from "../utils/BufferReader";
import MonsterSource from "./models/MonsterSource";

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
    /**
     * @type {{[index: Number]: {size: [Number, Number], type: Number, name: String, fileName: String}}}
     */
    static mapList = {};

    static async init() {
        RedStone.mainCanvas = new MainCanvas();
        RedStone.gameMap = new GameMap();
        RedStone.player = new Player();

        // display loading screen
        await LoadingScreen.init();
        LoadingScreen.render();

        // load common resources
        await CommonUI.init();

        // load map list
        await this.loadMapList();

        // load monsters
        await MonsterSource.loadAllMonsters();

        // check save data

        // load common resources
        await RedStone.gameMap.loadCommon();

        // load player

        // init map
        await RedStone.gameMap.init();

        // water mark click event
        document.querySelector(".water-mark").addEventListener("click", () => {
            location.href = "https://github.com/LostMyCode/redstone-js";
        });

        LoadingScreen.destroy();

        this.initialized = true;
    }

    static async loadMapList() {
        const mapListData = await fetchBinaryFile(`${DATA_DIR}/mapList.dat`);
        const br = new BufferReader(mapListData);

        while (true) {
            const index = br.readUInt16LE();
            if (index === 0xFFFF) break;
            this.mapList[index] = {
                size: br.readStructUInt16LE(2),
                type: br.readUInt16LE(),
                name: br.readString(0x40, "sjis"),
                fileName: br.readString(0x40, "sjis")
            }
        }

        const event = new CustomEvent("mapListLoaded", { detail: this.mapList });
        window.dispatchEvent(event);
        window.mapList = this.mapList;
    }

    static loadMap(rmdFileName) {
        if (!this.initialized) return;
        this.gameMap.moveTo(rmdFileName);
    }
}

window.RedStone = RedStone;

export default RedStone;