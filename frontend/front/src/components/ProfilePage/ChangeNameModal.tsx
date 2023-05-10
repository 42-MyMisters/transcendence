import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { UserAtom } from "../atom/UserAtom";

import { useState } from "react";

import { PressKey, AdminLogPrinter } from "../../event/event.util";
import * as chatAtom from "../../components/atom/ChatAtom";
import { keyboardKey } from '@testing-library/user-event';
import "../../styles/ProfileModal.css";

import { useAutoFocus } from '../../event/event.util';

export default function ChangeNameModal() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [newName, setNewName] = useState("");
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);

  const nameInputRef = useAutoFocus();

  PressKey(["Escape"], () => {
    setchangeNameModal(false);
  });


  const handleChangeName = () => {
    if (newName.length < 2 || newName.trim().length < 2) {
      alert("변경할 닉네임은 2글자 이상, 12글자 이하여야 합니다.")
      setNewName("");
      return;
    }
    const format = JSON.stringify({ nickname: newName });
    AdminLogPrinter(adminConsole, format);
    fetch(`${process.env.REACT_APP_API_URL}/user/nickname`, {
      credentials: "include",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: format,
    })
      .then((response) => {
        let tmp = userInfo;
        tmp.nickname = newName;
        setUserInfo(tmp);
        AdminLogPrinter(adminConsole, response);
        setchangeNameModal(false);
      })
      .catch((error) => {
        AdminLogPrinter(adminConsole, `error: ${error}`);
      });
  };

  const handleEnterEvent = (e: keyboardKey) => {
    if (e.key === 'Enter') {
      handleChangeName();
    }
  }

  return (
    <>
      <div className="ChangeNameModalBG"></div>
      <div className="ChangeNameModal">
        <div className="SaveNameForm">
          <label htmlFor="SaveName">New Nickname</label>
          <input
            id="SaveName"
            type="text"
            ref={nameInputRef}
            // pattern=".{1, 8}"
            // required
            // title="1 to 8 characters"
            maxLength={12}
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
            }}
            onKeyPress={(e) => { handleEnterEvent(e) }}
          />
        </div>
        <button type="submit" className="SaveName" onClick={() => handleChangeName()}>
          Save
        </button>
        <button className="SaveNameCancel" onClick={() => setchangeNameModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
