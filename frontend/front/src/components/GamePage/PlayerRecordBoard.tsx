import { useAtomValue } from 'jotai';
import "../../styles/GamePlayerInfo.css";
import { userListAtom } from '../atom/ChatAtom';

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

export default function PlayerRecordBoard({
  records,
  userId,
}: {
  // records: GameRecordType[];
  records: any;
  userId: number;
}) {
  const userList = useAtomValue(userListAtom);

  const rec = records.reverse().map((record) => (
    record.gm_winnerId === userId
      ? <PlayerRecordLine
        key={record.gm_gid + userId}
        LeftSideNickName={userList[userId].userDisplayName}
        LeftSideScore={record.gm_winnerScore}
        RightSideScore={record.gm_loserScore}
        RightSideNickName={userList[record.gm_loserId].userDisplayName}
      />
      : <PlayerRecordLine
        key={record.gm_gid + userId}
        LeftSideNickName={userList[userId].userDisplayName}
        LeftSideScore={record.gm_loserScore}
        RightSideScore={record.gm_winnerScore}
        RightSideNickName={userList[record.gm_winnerId].userDisplayName}
      />
  )
  );

  return (
    <div className="PlayerRecordBoard">
      <div className="PlayerRecoreList">{rec}</div>
    </div>
  );
}
