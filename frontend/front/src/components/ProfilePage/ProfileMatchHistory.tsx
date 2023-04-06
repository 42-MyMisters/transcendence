import "../../styles/ProfilePage.css";

export default function ProfileMatchHistory() {
  return (
    <div className="ProfileMatchFrame">
      <div className="ProfileMatchScore">%dgames %dwin %dlose</div>
      <div className="ProfileMatchELO">ELO %d</div>
      <div className="ProfileMatchHistoryBG">
        <div className="ProfileMatchHistoryList">
          <div>history1</div>
          <div>history2</div>
        </div>
      </div>
    </div>
  );
}
