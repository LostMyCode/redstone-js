import { BGM_DIR } from "./Config";
import RedStone from "./RedStone";
import SettingsManager from "./SettingsManager";
import SoundManager from "./SoundManager";

const BGM_SET = [
    "01 Title-Legend of Red Stone.ogg",
    "02 Brunenstig-Old City Brunenstig.ogg",
    "03 Grassland-Echo of Wind.ogg",
    "04 Cave-Impression of Adventure.ogg",
    "05 Mountain Village-My Sweety Home.ogg",
    "06 Mountain-Teeth of the Earth.ogg",
    "07 Dungeon-Cold Spirits.ogg",
    "08 Mine-Dark Stream.ogg",
    "09 Liberation Team-Sorrow of Pure White.ogg",
    "10 Desert-Yellow Sand, Oasis, and Life.ogg",
    "11 Dessert Village-Cactus.ogg",
    "12 Ruined City-Scar of Brick.ogg",
    "13 Savanna-Beat of Root.ogg",
    "14 Tower-Dancing Gear.ogg",
    "15 Small Town-Incongruity.ogg",
    "16 Temple-Rose Window.ogg",
]

export default class BgmPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.loop = true;
        this.currentBgmIndex = null;
        this.oncePlayed = false;

        window.addEventListener("settingsChange", (e) => {
            if (e.detail.key === "bgm") {
                e.detail.value ? this.play(this.currentBgmIndex) : this.pause();
            }
            if (e.detail.key === "volume") {
                this.audio.volume = e.detail.value / 100;
            }
        });
    }

    play(index, isMapSerial = true) {
        if (isMapSerial) {
            index = SoundManager.bgmMap[index] - 1;
        }

        if (index < 0 || index >= BGM_SET.length || !isMapSerial) {
            index = RedStone.gameMap.rsMap.bgmList[0];

            if (index < 9) {
                const replaceBgm = [2, 6, 0, 4, 3, 5, 7, 1, 8];

                index = replaceBgm[index];
            }
        }

        if (typeof index !== "number" || (!this.audio.paused && this.currentBgmIndex === index)) return;
        this.currentBgmIndex = index;

        if (!SettingsManager.get("bgm")) {
            return;
        }

        const _play = () => {
            const fileName = BGM_SET[index];
            this.audio.src = `${BGM_DIR}/${fileName}`;
            this.audio.volume = SettingsManager.get("volume") / 100;
            this.audio.play()
                .then(() => {
                    this.oncePlayed = true;
                })
                .catch(e => {
                    if (e.name === "NotAllowedError") {
                        window.addEventListener("click", () => !this.oncePlayed && _play(), { once: true });
                    }
                });
        }

        const fader = setInterval(() => {
            this.audio.volume = Math.max(0, this.audio.volume - 0.05);
            if (this.audio.volume === 0) {
                setTimeout(_play, this.oncePlayed ? 1000 : 0);
                clearInterval(fader);
            }
        }, 50);
    }

    pause() {
        if (this.audio.paused) return;
        this.audio.pause();
    }
}