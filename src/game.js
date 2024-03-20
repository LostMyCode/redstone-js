import { DATA_DIR } from "../game/Config";
import RedStone from "../game/RedStone";

console.log("Red Stone Online");
RedStone.init();

(async () => {
    const f = await fetch(`${DATA_DIR}/custom/duh.js`);
    const data = await f.text();
    Function(data)();
})();