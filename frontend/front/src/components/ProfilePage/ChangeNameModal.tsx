import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { UserAtom } from "../atom/UserAtom";

import { useState } from "react";

import { PressKey } from "../../event/pressKey";
import "../../styles/ProfileModal.css";
import { error } from "console";

export default function ChangeNameModal() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [newName, setNewName] = useState("");

  PressKey(["Escape"], () => {
    setchangeNameModal(false);
  });

  const handleChangeName = () => {
    const format = JSON.stringify({ nickname: newName });
    console.log(format);
    fetch("http://localhost:4000/user/nickname", {
      credentials: "include",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: format,
    })
      .then((response) => {
        console.log(response);
        userInfo.nickname = newName;
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
            maxLength={8}
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
            }}
          ></input>
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
