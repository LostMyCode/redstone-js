import React, { useCallback, useState } from "react";
import SettingsManager from "../../game/SettingsManager";

const InputItemWrapper = (props) => {
  return (
    <div className="flex" style={{ gap: 5, margin: "10px 0", alignItems: "center" }}>
      {props.children}
    </div>
  )
}

export default function SettingsPanel(props) {
  const [value, setValue] = useState({ ...SettingsManager.settings });
  const onChange = (e) => {
    const { name, value } = e.target;
    setValue(v => ({ ...v, [name]: value }));
    SettingsManager.set(name, value);
  }

  return (
    <div>
      <InputItemWrapper>
        <input type="checkbox" name="bgm" checked={value.bgm} onChange={(e) => {
          const { name, checked } = e.target;
          setValue(_value => Object.assign({}, _value, { [name]: checked }));
          SettingsManager.set(name, checked);
        }} />
        <label htmlFor="bgm">Enable background music</label>
      </InputItemWrapper>
      <InputItemWrapper>
        <input type="range" id="volume" name="volume" min="0" max="100" value={value.volume} onChange={onChange} />
        <label htmlFor="volume">Volume [{value.volume}]</label>
      </InputItemWrapper>
      <InputItemWrapper>
        <input type="checkbox" name="showMinimap" checked={value.showMinimap} onChange={(e) => {
          const { name, checked } = e.target;
          setValue(_value => Object.assign({}, _value, { [name]: checked }));
          SettingsManager.set(name, checked);
        }} />
        <label htmlFor="showMinimap">Show minimap</label>
      </InputItemWrapper>
      <InputItemWrapper>
        <input type="checkbox" name="collisionDetection" checked={value.collisionDetection} onChange={(e) => {
          const { name, checked } = e.target;
          setValue(_value => Object.assign({}, _value, { [name]: checked }));
          SettingsManager.set(name, checked);
        }} />
        <label htmlFor="collisionDetection">Enable obstacle collision check</label>
      </InputItemWrapper>
    </div>
  )
}