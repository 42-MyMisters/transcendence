import { MouseEvent, useEffect, useState } from "react";
import Register from "../components/LoginPage/Register";
import "../styles/LoginModal.css";

// export default function LoginPage() {
//   return (
//     <div className="ModalWrap">
//       <div className="ModalBox">
//         <h1 className="ModalTitle">Sign in</h1>
//         <button className="LogInBtn">Intra</button>
//       </div>
//     </div>
//   );
// }

function AuthenticatorComponent() {}

function RegisterComponent() {
  return (
    <img
      width="100px"
      height="100px"
      src="data:image/png;base64,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"
    />
  );
}

function LoginChecker() {
  return <div>bye</div>;
}

export default function LoginPage() {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    console.log(clicked);
  }, [clicked]);

  const handleOnClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const response = await fetch("http://localhost:4000");

    if (response.status === 200) {
      setClicked(true);
    }
  };

  return (
    <div className="ModalWrap">
      <div className="ModalBox">
        <button
          id="SignInBtn"
          onClick={handleOnClick}
          className="ModalBtn"
          style={clicked ? { display: "none" } : { display: "blocked" }}
        >
          click me!
        </button>
        {clicked === true ? <Register /> : <LoginChecker />}
      </div>
    </div>
  );
}
