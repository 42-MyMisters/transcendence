import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { MdAddPhotoAlternate } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import * as chatAtom from "../../components/atom/ChatAtom";
import { AdminLogPrinter } from "../../event/event.util";

import "../../styles/LoginModal.css";

const RegisterImgUpload = {
  width: 200,
  height: 200,
  borderRadius: 100,
};

function RegisterImg() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!files || files.length === 0) return;
    const fileReader = new FileReader();
    fileReader.addEventListener("loadend", () => {
      if (typeof fileReader.result === "string") {
        setImageSrc(fileReader.result);
      }
    });
    fileReader.readAsDataURL(files[0]);
  }, [files]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setFiles(e.target.files);
  };

  return (
    <form>
      {isImageExist(imageSrc) ? (
        <img src={imageSrc} style={RegisterImgUpload} />
      ) : (
        <img style={RegisterImgUpload} />
      )}
      <label className="input-file-btn" htmlFor="input-file" style={{ fontSize: 42 }}>
        <MdAddPhotoAlternate />
      </label>
      <input
        type="file"
        id="input-file"
        accept="image/png, image/jpeg"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </form>
  );
}

function RegisterNickName() {
  const [adminConsole,] = useAtom(chatAtom.adminConsoleAtom);

  const nickNameInputStyle = {
    fontSize: 50,
    width: 532,
  };
  const saveBtnStyle = {
    marginTop: "5%",
    width: 540,
    height: 100,
    fontFamily: "Inter",
    fontSize: 50,
  };

  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const navigateChat = () => {
    navigate("/chat");
  };

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;
    setUsername(newValue);
  };
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    AdminLogPrinter(adminConsole, username);
  };
  return (
    <form style={{ marginTop: "5%" }} onSubmit={onSubmit}>
      <div>
        <input
          value={username}
          onChange={onChange}
          type="text"
          placeholder="닉네임"
          style={nickNameInputStyle}
        />
      </div>
      <div>
        <button style={saveBtnStyle} onClick={navigateChat}>
          Save
        </button>
      </div>
    </form>
  );
}

const isImageExist = (imageSrc: string | null): imageSrc is string => {
  return imageSrc !== null;
};

const isFileExist = (files: FileList | null): files is FileList => {
  return !files || files.length === 0;
};

export default function Register() {
  return (
    <>
      <RegisterImg />
      <RegisterNickName />
    </>
  );
}
