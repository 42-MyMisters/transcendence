import "../../styles/LoginModals.css";

export default function SignInModal() {
  function handleLoginBtn() {
    window.location.href = `${String(process.env.REACT_APP_API_URL)}/login/oauth`;
  }
  function handleIDPWLoginBtn(){
    window.location.href = `${String(process.env.REACT_APP_API_URL)}/login/`
  }
    function handleRegisterBtn(){
    window.location.href = `${String(process.env.REACT_APP_API_URL)}/register/`
  }
  return (
    <div className="LoginModalsBG">
      <div className="login-form">
          <input type="text" name="email" className="text-field" placeholder="email" />
          <input type="password" name="password" className="text-field" placeholder="password" />
          <button className="submit-btn" onClick={handleIDPWLoginBtn}> Login </button> 
          <button className="submit-btn" onClick={handleLoginBtn} > 42 Intra Login </button>
          <button className="register-btn" onClick={handleRegisterBtn} > Register </button>
      </div>
    </div>
  );
}
