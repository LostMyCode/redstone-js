import RedStone from "./RedStone";

export default new class SaveData {
    constructor() {
        this.saveData = {};
    }

    save() {
        const data = {};

        data.version = "240131";

        data.job = RedStone.hero.job;

        data.quickSkillsEachJob = RedStone.hero.quickSkillsEachJob;

        localStorage.setItem("rsjs_savedata", JSON.stringify(data));
    }

    load() {
        const saveDataStr = localStorage.getItem("rsjs_savedata");

        if (saveDataStr) {
            this.saveData = JSON.parse(saveDataStr);
        }

        return this.saveData;
    }
}