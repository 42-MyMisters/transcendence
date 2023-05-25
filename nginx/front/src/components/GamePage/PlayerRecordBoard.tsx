import "../../styles/GamePlayerInfo.css";
import { GameRecordType } from '../atom/UserAtom';

export function PlayerRecordLine({
  LeftSideNickName,
  LeftSideScore,
  RightSideScore,
  RightSideNickName,
  color = '#9BDEAC',
}: {
  LeftSideNickName: string;
  LeftSideScore: number;
  RightSideScore: number;
  RightSideNickName: string;
  color?: string;
}) {
  return (
    <div className="PlayerRecordWrap" style={{ backgroundColor: color }}>
      <div className="LeftSideNickName">{LeftSideNickName}</div>
      <div className="LeftSideScore">{LeftSideScore}</div>
      <div className="VSText">VS</div>
      <div className="RightSideScore">{RightSideScore}</div>
      <div className="RightSideNickName">{RightSideNickName}</div>
    </div>
  );
}

export default function PlayerRecordBoard({
  records,
  userId,
}: {
  records: GameRecordType[];
  userId: number;
}) {
  return (
    <div className="PlayerRecordBoard">
      <div className="PlayerRecoreList">

        {

          records?.length === 0
            ? ''
            : records?.map((game) => {
              return (
                game.winnerUid === userId
                  ? <PlayerRecordLine
                    key={game.gid + game.winnerNickname}
                    LeftSideNickName={game.winnerNickname}
                    LeftSideScore={game.winnerScore}
                    RightSideScore={game.loserScore}
                    RightSideNickName={game.loserNickname}
                  />
                  : <PlayerRecordLine
                    key={game.gid + game.loserNickname}
                    LeftSideNickName={game.loserNickname}
                    LeftSideScore={game.loserScore}
                    RightSideScore={game.winnerScore}
                    RightSideNickName={game.winnerNickname}
                    color={"#E2979C"}
                  />
              );
            })
        }
      </div>
    </div>
  );
}
