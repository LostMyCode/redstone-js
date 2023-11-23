import React, { useCallback, useState } from "react";
import SettingsManager from "../../game/SettingsManager";

export default function SettingsPanel(props) {
    const [value, setValue] = useState({ ...SettingsManager.settings });
    const onChange = (e) => {
        const { name, value } = e.target;
        setValue(v => ({ ...v, [name]: value }));
        SettingsManager.set(name, value);
    }

    return (
        <div>
            <h2>Settings</h2>
            <div className="flex" style={{ gap: 5, margin: "10px 0" }}>
                <input type="checkbox" name="bgm" checked={value.bgm} onChange={(e) => {
                    const { name, checked } = e.target;
                    setValue(_value => Object.assign({}, _value, { [name]: checked }));
                    SettingsManager.set(name, checked);
                }} />
                <label htmlFor="bgm">Enable background music</label>
            </div>
            <div className="flex" style={{ gap: 5, margin: "10px 0" }}>
                <input type="range" id="volume" name="volume" min="0" max="100" value={value.volume} onChange={onChange} />
                <label htmlFor="volume">Volume [{value.volume}]</label>
            </div>
        </div>
    )
}