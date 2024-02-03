import React, { useEffect, useState } from "react";
import SkillPanel from "./SkillPanel";
import SystemPanel from "./SystemPanel";
import { BIM_MENU_INVENTORY, BIM_MENU_SKILL, BIM_MENU_SYSTEM } from "../../game/interface/GameBottomInterface";
import { toast } from "sonner";
import InventoryPanel from "./InventoryPanel";

const EzModalBase = (props) => {
  return (
    <div style={{ height: window.innerHeight * 0.7, overflowY: "scroll", position: "fixed", zIndex: 110, right: 0, top: 50, background: "rgba(0, 0, 0, 0.8)", color: "#fff", fontSize: 10, padding: 5, maxWidth: 300 }}>
      <div className="flex" style={{ justifyContent: "flex-end" }}>
        <div style={{ padding: 5, border: "1px #fff solid", width: "fit-content", cursor: "pointer" }} onClick={props.onClose}>Close</div>
      </div>
      {props.children}
    </div>
  )
}

export default function EzInterfaceContainer(props) {
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const onActiveChange = (e) => {
      setActiveModal(prev => {
        if (e.detail && ![BIM_MENU_SKILL, BIM_MENU_SYSTEM, BIM_MENU_INVENTORY].includes(e.detail)) {
          toast.warning("Not yet implemented");
        }
        if (prev === e.detail) return null;
        return e.detail;
      });
    }

    window.addEventListener("activeModalChange", onActiveChange);

    return () => {
      window.removeEventListener("activeModalChange", onActiveChange);
    }
  }, []);

  const onClose = (e) => {
    setActiveModal(null);
  }

  return (
    <>
      {activeModal === BIM_MENU_INVENTORY && (
        <EzModalBase onClose={onClose}>
          <InventoryPanel />
        </EzModalBase>
      )}
      {activeModal === BIM_MENU_SKILL && (
        <EzModalBase onClose={onClose}>
          <SkillPanel />
        </EzModalBase>
      )}
      {activeModal === BIM_MENU_SYSTEM && (
        <EzModalBase onClose={onClose}>
          <SystemPanel />
        </EzModalBase>
      )}
    </>
  )
}