import "../../styles/LadderBoard.css";

function LadderLog({
  rank,
  nickName,
  record,
  elo,
}: {
  rank: string;
  nickName: string;
  record: string;
  elo: string;
}) {
  return (
    <div className="LadderLog">
      <div className="LadderLogRank">{rank}</div>
      <div className="LadderLogNick">{nickName}</div>
      <div className="LadderLogRecord">{record}</div>
      <div className="LadderLogELO">{elo}</div>
    </div>
  );
}

export default function LadderBoard() {
  return (
    <div className="LadderBoardWrap">
      <div className="LadderBoardBG">
        <div className="LadderBoardHeadLine">
          <LadderLog rank="RANK" nickName="Nickname" record="Record" elo="ELO" />
        </div>
        <div className="LadderLogList">
          <LadderLog rank="1" nickName="Nickname" record="Record" elo="1020" />
          <LadderLog rank="2" nickName="Nickname" record="Record" elo="1000" />
          <LadderLog rank="3" nickName="Nickname" record="Record" elo="980" />
        </div>
      </div>
    </div>
  );
}
