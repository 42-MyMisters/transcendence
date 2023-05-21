import React, { useState, useEffect } from "react";
import "../../styles/GameInfo.css";
import { gameModeAtom } from '../atom/GameAtom';
import { useAtom } from 'jotai';

function Checkbox1() {
  const [isChecked, setIsChecked] = useState(false);
  const [gameMode, setGameMode] = useAtom(gameModeAtom);

  function handleCheckboxChange() {
    if (isChecked) {
      setGameMode('item');
    } else {
      console.log('normal - 2');
      setGameMode('normal');
    }
    setIsChecked((prev) => !prev);
  }

  useEffect(() => {
    if (gameMode === 'normal') {
      console.log('normal - 1');
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [gameMode]);


  return (
    <label className="GameMode1">
      <input
        className="CheckBox1"
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      Normal Mode
    </label>
  );
}

function Checkbox2() {
  const [isChecked, setIsChecked] = useState(false);
  const [gameMode, setGameMode] = useAtom(gameModeAtom);

  function handleCheckboxChange() {
    if (isChecked) {
      setGameMode('normal');
    } else {
      setGameMode('item');
      console.log('item - 2');
    }
    setIsChecked((prev) => !prev);
  }

  useEffect(() => {
    if (gameMode === 'item') {
      console.log('item - 1');
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [gameMode]);

  return (
    <label className="GameMode2">
      <input
        className="CheckBox2"
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      Item Mode
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
