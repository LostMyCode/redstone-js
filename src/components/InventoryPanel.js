import React, { useEffect, useState } from "react";
import CommonUI from "../../game/interface/CommonUI";
import Pos from "../../engine/Pos";

const InventoryItems = (props) => {
  const items = [];

  const pos = new Pos;
  const emptySlotImage = CommonUI.interface.getCanvas(46);
  const emptySlotUrl = emptySlotImage.toDataURL();

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      pos.x = 19 + 40 * j;
      pos.y = 214 + 37 * i;

      items.push(
        <div key={i * 7 + j} style={{ position: "absolute", width: 34, height: 34, left: pos.x, top: pos.y, background: `url(${emptySlotUrl})` }}></div>
      )
    }
  }

  return items;
}

const Money = (props) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const upd = setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => {
      clearInterval(upd);
    }
  }, []);

  return (
    <div style={{ position: "absolute", left: 47, top: 193, color: "#ffe169", fontSize: 8 }}>{now} Gold</div>
  )
}

export default function InventoryPanel(props) {
  const bgImage1 = CommonUI.interface.getCanvas(32);
  const bgImage2 = CommonUI.interface.getCanvas(33);
  const bgUrl1 = bgImage1.toDataURL();
  const bgUrl2 = bgImage2.toDataURL();

  return (
    <div style={{ width: 267, height: 482, background: `url(${bgUrl1})`, position: "relative" }}>
      <div style={{ position: "absolute", width: 260, height: 463, left: -CommonUI.interface.shape.body.left[33], top: -CommonUI.interface.shape.body.top[33], background: `url(${bgUrl2})` }}></div>

      <InventoryItems />
      <Money />
    </div>
  )
}