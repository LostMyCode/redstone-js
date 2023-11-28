const DEFAULT_SETTINGS = {
    bgm: false,
    volume: 30,
    showMinimap: true,
    collisionDetection: true,
}

const LS_SETTINGS_KEY = "rsjs_settings";

export default new class SettingsManager {
    constructor() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
        this.saveTimeout = null;
        this.init();
    }

    init() {
        let settings;
        try {
            settings = localStorage.getItem(LS_SETTINGS_KEY);
            settings = JSON.parse(settings);
        } catch (e) {};
        if (typeof settings === "object") {
            this.settings = settings;
        }
    }

    set(key, value) {
        this.settings[key] = value;
        clearInterval(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(this.settings));
        }, 500);
        window.dispatchEvent(new CustomEvent("settingsChange", { detail: { key, value } }));
    }

    get(key) {
        return this.settings[key];
    }
}