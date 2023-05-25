import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { UserAtom } from "../atom/UserAtom";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';

import { keyboardKey } from '@testing-library/user-event';
import * as chatAtom from "../../components/atom/ChatAtom";
import { AdminLogPrinter, PressKey } from "../../event/event.util";
import "../../styles/ProfileModal.css";

import { refreshTokenAtom } from "../../components/atom/LoginAtom";
import * as api from '../../event/api.request';
import { useAutoFocus } from '../../event/event.util';

export default function ChangeNameModal() {
  const setchangeNameModal = useSetAtom(changeNameModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [newName, setNewName] = useState("");
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const navigate = useNavigate();

  const nameInputRef = useAutoFocus();

  PressKey(["Escape"], () => {
    setchangeNameModal(false);
  });

  const logOutHandler = () => {
    api.LogOut(adminConsole, setRefreshToken, navigate, "/");
  };

  async function getMyinfoHandler() {
    const getMeResponse = await api.GetMyInfo(adminConsole, setUserInfo);
    if (getMeResponse === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getMeResponse = await api.GetMyInfo(adminConsole, setUserInfo);
        if (getMeResponse === 401) {
          logOutHandler();
        }
      }
    }
  }

  const handleChangeName = async () => {
    const trimNewName = newName.trim();
    if (trimNewName.length < 2 || trimNewName.length > 8) {
      alert("변경할 닉네임은 2글자 이상, 8글자 이하여야 합니다.")
      setNewName("");
      return;
    } else if (trimNewName === userInfo.nickname) {
      alert("현재 닉네임과 동일합니다.")
      setNewName("");
      return;
    } else if (newName.includes("#")) {
      alert("#은 포함될 수 없습니다.");
      setNewName("");
      return;
    }
    const format = JSON.stringify({ nickname: newName });
    AdminLogPrinter(adminConsole, `changeNickName: ${format}`);

    const changeNickNameRes = await api.changeNickName(adminConsole, format, getMyinfoHandler);
    if (changeNickNameRes === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const changeNickNameRes = await api.changeNickName(adminConsole, format, getMyinfoHandler);
        if (changeNickNameRes === 401) {
          logOutHandler();
        } else if (changeNickNameRes === 400) {
          setNewName("");
        } else {
          setchangeNameModal(false);
          setNewName("");
        }
      }
    } else if (changeNickNameRes === 400) {
      setNewName("");
    } else {
      setchangeNameModal(false);
      setNewName("");
    }
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
            maxLength={8}
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
            }}
            onKeyPress={(e) => { handleEnterEvent(e) }}
          />
        </div>
        <button type="submit" className="SaveName" onClick={() => handleChangeName()}>
          Change
        </button>
        <button className="SaveNameCancel" onClick={() => setchangeNameModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
