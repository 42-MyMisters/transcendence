import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { UserAtom } from "../atom/UserAtom";

import { useState } from "react";

import { PressKey } from "../../event/pressKey";
import "../../styles/ProfileModal.css";

export default function ChangeNameModal() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [newName, setNewName] = useState("");

  PressKey(["Escape"], () => {
    setchangeNameModal(false);
  });

  const handleChangeName = () => {
    if (newName.length < 2 || newName.trim().length < 2) {
      setNewName("");
      return;
    }
    const format = JSON.stringify({ nickname: newName });
    console.log(format);
    fetch("http://localhost:4000/user/nickname", {
      credentials: "include",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: format,
    })
      .then((response) => {
        let tmp = userInfo;
        tmp.nickname = newName;
        setUserInfo(tmp);
        console.log(response);
        setchangeNameModal(false);
      })
      .catch((error) => {
        console.log(`error: ${error}`);
      });
  };

  return (
    <>
      <div className="ChangeNameModalBG"></div>
      <div className="ChangeNameModal">
        <div className="SaveNameForm">
          <label htmlFor="SaveName">New Nickname</label>
          <input
            id="SaveName"
            type="text"
            // pattern=".{1, 8}"
            // required
            // title="1 to 8 characters"
            maxLength={8}
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
            }}
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
