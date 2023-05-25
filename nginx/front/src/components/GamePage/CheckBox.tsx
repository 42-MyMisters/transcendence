import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from "react";
import "../../styles/GameInfo.css";
import { gameModeAtom, gameSocketAtom } from '../atom/GameAtom';

const enum GameMode {
  DEFAULT = 0,
  SPEED = 1,
}

function Checkbox1() {
  const [isChecked, setIsChecked] = useState(false);
  const [gameMode, setGameMode] = useAtom(gameModeAtom);
  const gameSocket = useAtomValue(gameSocketAtom);

  function handleCheckboxChange() {
    if (isChecked) {
      setGameMode('item');
    } else {
      setGameMode('normal');
    }
    setIsChecked((prev) => !prev);
  }

  useEffect(() => {
    if (gameMode === 'normal') {
      gameSocket.emit('modeSelect', GameMode.DEFAULT);
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

  const gameSocket = useAtomValue(gameSocketAtom);

  function handleCheckboxChange() {
    if (isChecked) {
      setGameMode('normal');
    } else {
      setGameMode('item');
    }
    setIsChecked((prev) => !prev);
  }

  useEffect(() => {
    if (gameMode === 'item') {
      gameSocket.emit('modeSelect', GameMode.SPEED);
      // console.log("game mode: speed");
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
      Speed Mode
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
