import "../../styles/BackGround.css";
import "../../styles/GamePlayerInfo.css";
import PlayerRecordBoard from "./PlayerRecordBoard";

export default function Waiting() {
  return (
    <div className="QueueBackGround">
      <div className="LeftWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">NickNameL</div>
          <PlayerRecordBoard />
        </div>
      </div>
      <div className="RightWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">NickNameR</div>
          <PlayerRecordBoard />
        </div>
      </div>
    </div>
  );
}
