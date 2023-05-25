import "../../styles/LoginModals.css";

export default function SignInModal() {
  function handleLoginBtn() {
    window.location.href = `${String(process.env.REACT_APP_API_URL)}/login/oauth`;
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
