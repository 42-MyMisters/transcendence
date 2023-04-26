import "../../styles/BackGround.css";
import "../../styles/GamePlayerInfo.css";
import PlayerRecordBoard from "./PlayerRecordBoard";
import CheckBox from "./CheckBox";

export default function Waiting() {
  const records: {
    LeftSideNickName: string;
    LeftSideScore: number;
    RightSideScore: number;
    RightSideNickName: string;
  }[] = [
    {
      LeftSideNickName: "User1",
      LeftSideScore: 5,
      RightSideScore: 4,
      RightSideNickName: "User24",
    },
  ];

  return (
    <div className="QueueBackGround">
      <div className="LeftWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">NickNameL</div>
          <PlayerRecordBoard records={records} />
        </div>
      </div>
      <div className="RightWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">NickNameR</div>
          <PlayerRecordBoard records={records} />
        </div>
      </div>
      <CheckBox />
    </div>
  );
}
