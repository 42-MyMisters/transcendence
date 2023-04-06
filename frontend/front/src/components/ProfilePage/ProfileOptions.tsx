import "../../styles/ProfilePage.css";

export default function ProfileOptions() {
  return (
    <div className="ProfileOptions">
      <div>change Password</div>
      <div>change Nickname</div>
      <div>change Profile Image</div>
      <div>
        2FA
        <input type="checkbox" id="checkbox_TFA" name="TFA" value="false" />
        <label htmlFor="checkbox_TFA"></label>
      </div>
    </div>
  );
}
