import { useAtomValue } from 'jotai';
import "../../styles/GamePlayerInfo.css";
import { userListAtom } from '../atom/ChatAtom';
import { GameRecordType } from '../atom/UserAtom';

export function PlayerRecordLine({
  LeftSideNickName,
  LeftSideScore,
  RightSideScore,
  RightSideNickName,
}: {
  LeftSideNickName: string;
  LeftSideScore: number;
  RightSideScore: number;
  RightSideNickName: string;
}) {
  return (
    <div className="PlayerRecordWrap">
      <div className="LeftSideNickName">{LeftSideNickName}</div>
      <div className="LeftSideScore">{LeftSideScore}</div>
      <div className="VSText">VS</div>
      <div className="RightSideScore">{RightSideScore}</div>
      <div className="RightSideNickName">{RightSideNickName}</div>
    </div>
  );
}

export function PlayerRecordLineLose({
  LeftSideNickName,
  LeftSideScore,
  RightSideScore,
  RightSideNickName,
}: {
  LeftSideNickName: string;
  LeftSideScore: number;
  RightSideScore: number;
  RightSideNickName: string;
}) {
  return (
    <div className="PlayerRecordWrapLose">
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
      {/* <div className="PlayerRecoreList">{rec}</div> */}
      {

        records?.length === 0
          ? ''
          : records?.map((game) => {
            return (
              game.winnerUid === userId
                ? <PlayerRecordLine
                  key={game.gid + game.winnerNickname + game.loserNickname}
                  LeftSideNickName={game.winnerNickname}
                  LeftSideScore={game.winnerScore}
                  RightSideScore={game.loserScore}
                  RightSideNickName={game.loserNickname}
                />
                : <PlayerRecordLineLose
                  key={game.gid + game.winnerNickname + game.loserNickname}
                  LeftSideNickName={game.winnerNickname}
                  LeftSideScore={game.winnerScore}
                  RightSideScore={game.loserScore}
                  RightSideNickName={game.loserNickname}
                />
            );
          })
      }
    </div>
  );
}
