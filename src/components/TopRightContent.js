import React from "react";

import MapListPanel from "./MapListPanel"
import SkillListOpen from "./SkillListOpen";

export default function TopRightContent() {
  return (
    <div className='fixed-top-right'>
      <div>
        <MapListPanel />
      </div>
      {/* <div>
        <SkillListOpen />
      </div> */}
    </div>
  )
}