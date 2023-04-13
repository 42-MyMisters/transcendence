import "../../styles/LoginModals.css";

export default function TFAModal() {
  return (
    <div className="LoginModalsBG">
      <div className="LoginTxt">2FA</div>
      <input type="text" className="LoginModalInput" placeholder="Numbers" />
      <button className="LoginBtn">verify</button>
    </div>
  );
}
