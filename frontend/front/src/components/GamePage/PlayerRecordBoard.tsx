import { ReactElement } from "react";
import "../../styles/GamePlayerInfo.css";

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
}: {
  records: {
    LeftSideNickName: string;
    LeftSideScore: number;
    RightSideScore: number;
    RightSideNickName: string;
  }[];
}) {
  const rec = records.map(
    (record: {
      LeftSideNickName: string;
      LeftSideScore: number;
      RightSideScore: number;
      RightSideNickName: string;
    }): ReactElement => (
      <PlayerRecordLine
        LeftSideNickName={record.LeftSideNickName}
        LeftSideScore={record.LeftSideScore}
        RightSideScore={record.RightSideScore}
        RightSideNickName={record.RightSideNickName}
      />
    )
  );

  return (
    <div className="PlayerRecordBoard">
      <div className="PlayerRecoreList">{rec}</div>
    </div>
  );
}
