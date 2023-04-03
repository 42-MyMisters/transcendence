import "../../styles/LoginModals.css";

export default function TFAModal() {
  return (
    <div className="LoginModalsBG">
      <div className="LoginTxts">2FA</div>
      <input type="text" placeholder="Numbers" />
      <div className="LoginBtns">verify</div>
    </div>
  );
}
