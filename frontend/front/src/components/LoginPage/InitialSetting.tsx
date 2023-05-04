import "../../styles/LoginModals.css";

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InitialSettingModal() {
  const [profileImage, setProfileImage] = useState("/smile.png");
  const profileRef = useRef<HTMLInputElement>(null);

  const saveImageFile = () => {
    if (profileRef.current?.files?.[0]) {
      const newImg = URL.createObjectURL(profileRef.current?.files[0]);
      setProfileImage(newImg);
    }
  };

  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  const setDefaultInfo = async () => {
    const formData = new FormData();
    formData.append("profileImage", profileRef.current?.files?.[0]!);
    console.log(profileRef.current?.files?.[0]!.name);

    try {
      const response = await fetch("http://localhost:4000/user/profile-img-change", {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("hi");
        navigate("/chat");
      } else {
        alert("파일 업로드에 실패했습니다.");
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="LoginModalsBG">
      <div
        className="DefaultProfileImg"
        style={{
          backgroundImage: `url(${profileImage})`,
          backgroundSize: "200px",
          width: "200px",
          height: "200px",
        }}
      />
      <div className="ChangeProfileImageBtn" onClick={() => {}}>
        <label htmlFor="ChangeImage" />
        <input
          id="ChangeImage"
          type="file"
          accept="image/*"
          multiple={false}
          onChange={saveImageFile}
          ref={profileRef}
        />
      </div>
      <div className="NickNameInitialForm">
        <label htmlFor="InitialSaveName">New Nickname</label>
        <input
          id="InitialSaveName"
          type="text"
          placeholder="New Nickname"
          maxLength={8}
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
          }}
        />
      </div>
      <button className="InitialSettingSaveBtn" onClick={setDefaultInfo}>
        Save
      </button>
    </div>
  );
}
