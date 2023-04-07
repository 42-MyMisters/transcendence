import "../../styles/GamePlayerInfo.css";

function PlayerRecordLine() {
  return (
    <div className="PlayerRecordWrap">
      <div className="LeftSideNickName">NickNameL</div>
      <div className="LeftSideScore">4</div>
      <div className="VSText">VS</div>
      <div className="RightSideScore">5</div>
      <div className="RightSideNickName">NickNameR</div>
    </div>
  );
}

export default function PlayerRecordBoard() {
  return (
    <div className="PlayerRecordBoard">
      <PlayerRecordLine />
    </div>
  );
}
