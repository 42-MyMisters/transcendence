import { useState } from "react";
import "../styles/TFAQRModal.css";
import { useAtom } from "jotai";
import { TFAModalAtom, TFAQRURL } from "./atom/ModalAtom";

export default function TFAQRModal({ AuthBtn }: { AuthBtn: () => void }) {
  const [authCode, setAuthCode] = useState("");
  const [qrcodeURL] = useAtom(TFAQRURL);
  const [TFAModal, setTFAModal] = useAtom(TFAModalAtom);

  return (
    <>
      <div className="TFAQRModalBG" />
      <div className="TFAQRModal">
        <div
          className="TFAQRCode"
          style={{
            backgroundImage: `url(${qrcodeURL})`,
            backgroundSize: "200px",
            width: "200px",
            height: "200px",
          }}
        />
        <div className="TFAAuthCodeForm">
          <label htmlFor="TFAAuthCode">Numbers</label>
          <input
            id="TFAAuthCode"
            type="text"
            placeholder="Numbers"
            maxLength={6}
            value={authCode}
            onChange={(e) => {
              setAuthCode(e.target.value);
            }}
          />
        </div>
        <button className="TFAAuthBtn" onClick={AuthBtn}>
          Authenticate
        </button>
      </div>
    </>
  );
}
