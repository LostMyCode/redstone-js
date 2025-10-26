import React from "react";
import { JOB_MAGIC_ARCHER, JOB_ROGUE, JOB_WIZARD } from "../../game/job/JobDefineH";
import RedStone from "../../game/RedStone";
import SettingsPanel from "./SettingsPanel";

export default function SystemPanel(props) {
  const onJobChange = (e) => {
    console.log(e.target.value);
    window.dispatchEvent(new CustomEvent("jobChange", { detail: parseInt(e.target.value) }));
  }

  return (
    <div style={{ margin: "0 10px" }}>
      <h2>Change job</h2>
      <select defaultValue={RedStone.player.actor.job} onChange={onJobChange}>
        <option value={JOB_ROGUE}>Thief ( シーフ )</option>
        <option value={JOB_MAGIC_ARCHER}>Archer ( アーチャー )</option>
        <option value={JOB_WIZARD}>Wizard ( ウィザード )</option>
      </select>

      <hr />

      <h2>Settings</h2>
      <SettingsPanel />
    </div>
  );
}