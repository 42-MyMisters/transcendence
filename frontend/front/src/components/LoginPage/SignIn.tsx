import { useEffect } from "react";

import "../../styles/LoginModals.css";

export default function SignInModal() {
  function handleLoginBtn() {
    window.location.href = "http://localhost:4000/login/oauth";
  }

  return (
    <div className="LoginModalsBG">
      <div className="LoginTxt">Sign In</div>
      <button className="LoginBtn" onClick={handleLoginBtn}>
        Intra
      </button>
    </div>
  );
}
