import { useAtom } from "jotai";
import { UserAtom } from "../atom/UserAtom";
import { useRef, useState } from "react";
import { changeImageModalAtom } from "../../components/atom/ModalAtom";
import { PressKey, AdminLogPrinter } from "../../event/event.util";
import * as chatAtom from "../../components/atom/ChatAtom";

import "../../styles/ChangeImageModal.css";

export default function ChangeImageModal() {
  const [changeImageModal, setchangeImageModal] = useAtom(changeImageModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [newImage, setnewImage] = useState("");
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const profileRef = useRef<HTMLInputElement>(null);

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

  const setNewImage = async () => {
    const formData = new FormData();
    formData.append("profileImage", profileRef.current?.files?.[0]!);
    AdminLogPrinter(adminConsole, profileRef.current?.files?.[0]!.name);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/profile-img-change`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        let tmp = userInfo;
        tmp.profileUrl = newImage;
        setUserInfo(tmp);
        AdminLogPrinter(adminConsole, response);
        setchangeImageModal(false);
      } else {
        alert("파일 업로드에 실패했습니다.");
      }
    } catch (error) {
      alert(error);
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
        <button type="submit" className="ChangeImage" onClick={setNewImage}>
          Save
        </button>
        <button className="ChangeImageCancel" onClick={() => setchangeImageModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
