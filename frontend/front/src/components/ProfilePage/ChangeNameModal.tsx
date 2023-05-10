import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { UserAtom } from "../atom/UserAtom";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';

import { PressKey, AdminLogPrinter } from "../../event/event.util";
import * as chatAtom from "../../components/atom/ChatAtom";
import { keyboardKey } from '@testing-library/user-event';
import "../../styles/ProfileModal.css";

import { useAutoFocus } from '../../event/event.util';
import * as api from '../../event/api.request';
import { refreshTokenAtom } from "../../components/atom/LoginAtom";

export default function ChangeNameModal() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [newName, setNewName] = useState("");
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const [, setRefreshToken] = useAtom(refreshTokenAtom);
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
    if (getMeResponse == 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getMeResponse = await api.GetMyInfo(adminConsole, setUserInfo);
        if (getMeResponse == 401) {
          logOutHandler();
        }
      }
    }
  }

  const handleChangeName = async () => {
    const trimNewName = newName.trim();
    if (trimNewName.length < 2 || trimNewName.length > 13) {
      alert("변경할 닉네임은 2글자 이상, 12글자 이하여야 합니다.")
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
        const getMeResponse = await api.changeNickName(adminConsole, format, getMyinfoHandler);
        if (getMeResponse == 401) {
          logOutHandler();
        } else {
          setchangeNameModal(false);
          setNewName("");
        }
      }
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
            maxLength={12}
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
