import "../../styles/LoginModals.css";

export default function InitialSettingModal() {
  return (
    <div className="LoginModalsBG">
      <input type="text" placeholder="NickName" />
      <div className="LoginBtns">Save</div>
    </div>
  );
}
