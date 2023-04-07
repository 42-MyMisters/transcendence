import React, { useState } from "react";
import "../../styles/GameInfo.css";

function Checkbox1() {
  const [isChecked, setIsChecked] = useState(false);

  function handleCheckboxChange() {
    setIsChecked(!isChecked);
  }

  return (
    <label className="GameMode1">
      <input
        className="CheckBox1"
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      GameMode1
    </label>
  );
}

function Checkbox2() {
  const [isChecked, setIsChecked] = useState(false);

  function handleCheckboxChange() {
    setIsChecked(!isChecked);
  }

  return (
    <label className="GameMode2">
      <input
        className="CheckBox2"
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      GameMode2
    </label>
  );
}

export default function CheckBox() {
  return (
    <div className="CheckBoxWrap">
      {Checkbox1()}
      {Checkbox2()}
    </div>
  );
}
