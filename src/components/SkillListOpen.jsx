import React, { useContext } from "react";

import RedStone from "../../game/RedStone";
import CommonUI from "../../game/interface/CommonUI";

import { ModalContext } from "./ModalProvider";

export default function SkillListOpen() {
  const { open, close } = useContext(ModalContext);

  return (
    <button onClick={() => {
      open(<div style={{ height: window.innerHeight * 0.7, overflowY: "scroll" }}>
        {Array(52 / 2).fill(null).map((v, i) => {
          i = i * 2;

          return (
            <div className="flex" key={i} style={{ margin: "10px 0", gap: 10 }}>
              {Array(2).fill(null).map((_v, j) => {
                const skill = RedStone.hero.ability[i + j].getSkill();
                const iconIndex = skill?.iconIndex;
                if (typeof iconIndex !== "number") return null;

                return (
                  <div className="flex" style={{ gap: 10, width: 200 }} key={i + j}>
                    <img width="34" height="34" src={CommonUI.smiIconSkill.getCanvas(iconIndex).toDataURL()} />
                    <div>{skill.name}</div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>);
    }}>open skill</button>
  )
}