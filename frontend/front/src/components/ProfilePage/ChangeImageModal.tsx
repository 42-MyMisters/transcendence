import { useAtom } from "jotai";
import { UserAtom } from "../atom/UserAtom";
import { useRef, useState } from "react";
import { changeImageModalAtom } from "../../components/atom/ModalAtom";
import { PressKey, AdminLogPrinter } from "../../event/event.util";
import { keyboardKey } from '@testing-library/user-event';
import * as chatAtom from "../../components/atom/ChatAtom";
import * as api from '../../event/api.request';
import { useNavigate } from 'react-router-dom';
import { refreshTokenAtom } from "../../components/atom/LoginAtom";

import "../../styles/ChangeImageModal.css";

export default function ChangeImageModal() {
  const [changeImageModal, setchangeImageModal] = useAtom(changeImageModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [newImage, setnewImage] = useState("");
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const [, setRefreshToken] = useAtom(refreshTokenAtom);
  const profileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  PressKey(["Escape"], () => {
    setchangeImageModal(false);
  });

  const handleChangeImage = () => {
    if (profileRef.current?.files?.[0]) {
      const newImg = URL.createObjectURL(profileRef.current?.files[0]);
      setnewImage(newImg);
      AdminLogPrinter(adminConsole, `new Image: ${newImg}`);
    }
  };

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

  const changeNewImageHandler = async () => {
    if (newImage === "") {
      alert("이미지를 선택해주세요.");
      return;
    }
    const formData = new FormData();
    formData.append("profileImage", profileRef.current?.files?.[0]!);
    AdminLogPrinter(adminConsole, profileRef.current?.files?.[0]!.name);

    const changeNickNameRes = await api.changeProfileImage(adminConsole, formData, getMyinfoHandler);
    if (changeNickNameRes === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const changeNickNameRes = await api.changeProfileImage(adminConsole, formData, getMyinfoHandler);
        if (changeNickNameRes === 401) {
          logOutHandler();
        } else {
          setchangeImageModal(false);
          setnewImage("");
        }
      }
    } else {
      setchangeImageModal(false);
      setnewImage("");
    }
  };

  return (
    <>
      <div className="ChangeImageModalBG"></div>
      <div className="ChangeImageModal">
        <form className="ChangeImageForm">
          <label htmlFor="newImage">New Image</label>
          <input
            id="newImage"
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple={false}
            onChange={handleChangeImage}
            ref={profileRef}
          ></input>
        </form>
        <button type="submit" className="ChangeImage" onClick={changeNewImageHandler}  >
          Change
        </button>
        <button className="ChangeImageCancel" onClick={() => setchangeImageModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
