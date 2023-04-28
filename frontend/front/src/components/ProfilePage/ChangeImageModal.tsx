import { useAtom } from "jotai";
import { UserAtom } from "../atom/UserAtom";
import { changeImageModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/pressKey";
import FormData from "form-data";

import "../../styles/ChangeImageModal.css";
import { useState } from "react";

export default function ChangeImageModal() {
  const [changeImageModal, setchangeImageModal] = useAtom(changeImageModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [newImage, setNewImage] = useState("");

  PressKey(["Escape"], () => {
    setchangeImageModal(false);
  });

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formElement = document.getElementById("forChangeImage") as HTMLFormElement;
    if (formElement) {
      const formData = new FormData(formElement);

      const parts: BlobPart[] = [];

      for (const [name, value] of (formData as any).entries()) {
        parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
      }

      const blob = new Blob(parts, { type: "multipart/form-data" });

      let response = fetch("http://localhost:4000/user/profile-img-change", {
        method: "POST",
        body: blob,
      });
    }
  };

  return (
    <>
      <div className="ChangeImageModalBG"></div>
      <div className="ChangeImageModal">
        <form
          id="forChangeImage"
          encType="multipart/form-data"
          className="ChangeImageForm"
          onSubmit={(e) => handleOnSubmit(e)}
        >
          <label htmlFor="ChangeImage">New Image</label>
          <input id="ChangeImage" type="file" accept=".jpg,.jpeg,.png" multiple></input>
        </form>
        <button type="submit" className="ChangeImage" onClick={() => setchangeImageModal(false)}>
          Save
        </button>
        <button className="ChangeImageCancel" onClick={() => setchangeImageModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
