import BarMenu from "../engine/BarMenu";
import GameBottomInterface from "./interface/GameBottomInterface";

class GamePlay {
    static initBottomInterface = () => GameBottomInterface.initBottomInterface();
    static drawBottomInterface = () => GameBottomInterface.drawBottomInterface();
    static bottomMenu = new BarMenu();
}

export default GamePlay;