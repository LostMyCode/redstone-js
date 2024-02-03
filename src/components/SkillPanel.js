import React from "react";
import CommonUI from "../../game/interface/CommonUI";
import RedStone from "../../game/RedStone";
import Pos from "../../engine/Pos";

class SkillPanel extends React.Component {
  constructor(props) {
    super(props);

    this.pos = new Pos();
  }

  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  handleMouseMove = (e) => {
    if (!this.dragSkill) return;

    e.preventDefault();

    this.pos.set(e.pageX, e.pageY);

    this.forceUpdate();
  }

  handleMouseUp = (e) => {
    this.dragSkill = null;

    this.forceUpdate();
  }

  handleClose = (e) => {
    this.props.onClose && this.props.onClose(e);
  }

  _renderDragSkill() {
    const skill = this.dragSkill;
    const iconIndex = skill.iconIndex;

    return (
      <div style={{ position: "fixed", left: this.pos.x - 34 / 2, top: this.pos.y - 34 / 2, zIndex: 111 }}>
        <img width="34" height="34" src={CommonUI.smiIconSkill.getCanvas(iconIndex).toDataURL()} />
      </div>
    )
  }

  render() {
    if (!RedStone.initialized) return null;

    const abilities = RedStone.hero.ability.filter(ab => ab.isEnableJob(RedStone.hero.job));

    return (
      <>
        {abilities.map((v, i) => {
          i = i * 2;

          const body = Array(2).fill(null).map((_v, j) => {
            const skill = abilities[i + j]?.getSkill();
            const iconIndex = skill?.iconIndex;
            if (typeof iconIndex !== "number") return null;

            const isAvailable = [
              152, // double throwing
              54,  // meteor shower
              222, // water fall
            ].includes(skill.serial);

            return (
              <div className="flex skill-modal-item" style={{ gap: 10, width: 200, opacity: isAvailable ? 1 : 0.3 }} key={i + j} onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isAvailable) return;
                this.pos.set(e.pageX, e.pageY);
                this.dragSkill = skill;
                RedStone.dragSkill = i + j;
              }}>
                <img width="34" height="34" src={CommonUI.smiIconSkill.getCanvas(iconIndex).toDataURL()} />
                <div>{skill.name}</div>
              </div>
            )
          }).filter(a => !!a);

          if (body.length === 0) return null;

          return (
            <div className="flex" key={i} style={{ margin: "10px 0", gap: 10 }}>
              {body}
            </div>
          )
        })}
        {this.dragSkill && this._renderDragSkill()}
      </>
    )
  }
}

export default SkillPanel;