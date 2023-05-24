import { useAtomValue } from 'jotai';
import "../../styles/LadderBoard.css";
import { leaderBoardAtom } from '../atom/ChatAtom';

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
  const leaderBoard = useAtomValue(leaderBoardAtom);

  return (
    <div className="LadderBoardWrap">
      <div className="LadderBoardBG">
        <div className="LadderBoardHeadLine">
          <LadderLog rank="RANK" nickName="Nickname" record="Record" elo="ELO" />
        </div>
        <div className="LadderLogList">
          {
            leaderBoard.map((key, value) => {
              return (
                <LadderLog
                  key={key.nickname}
                  rank={String(value + 1)}
                  nickName={key.nickname}
                  record={key.winRate + '% - ' + key.winGameCount + "win " + key.lostGameCount + "lose"}
                  elo={String(key.elo)}
                />
              )
            })
          }
        </div>
      </div>
    </div>
  );
}
