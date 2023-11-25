export default new class SettingsManager {
    constructor() {
        this.settings = {
            bgm: false,
            volume: 30,
            showMinimap: true,
            collisionDetection: true,
        }
    }

    init() {

    }

    set(key, value) {
        this.settings[key] = value;
        window.dispatchEvent(new CustomEvent("settingsChange", { detail: { key, value } }));
    }

    get(key) {
        return this.settings[key];
    }
}