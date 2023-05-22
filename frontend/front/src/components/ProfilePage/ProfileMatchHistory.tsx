import "../../styles/ProfilePage.css";

import { PlayerRecordLine } from "../GamePage/PlayerRecordBoard";

import { ReactElement } from "react";
import { useAtom, useAtomValue } from "jotai";
import { ProfileAtom, UserAtom, isMyProfileAtom } from "../atom/UserAtom";
import { Game } from "../GamePage/Pong";

export default function ProfileMatchHistory() {
  const isMyProfile = useAtomValue(isMyProfileAtom);
  const userInfo = useAtomValue(UserAtom);
  const profile = useAtomValue(ProfileAtom);

  return (
    <div className="ProfileMatchFrame">
      <div className="ProfileMatchScore">{`${userInfo?.games?.length ?? 0}games ${userInfo?.games?.filter((game) => game.winner.nickname === userInfo.nickname)?.length ?? 0
        }win ${userInfo?.games?.filter((game) => game.winner.nickname !== userInfo.nickname)?.length ?? 0
        }lose`}</div>
      <div className="ProfileMatchELO">{`ELO ${userInfo?.ELO ?? 1000}`}</div>
      <div className="ProfileMatchHistoryBG">
        <div className="ProfileMatchHistoryList">
          {
            isMyProfile
              // ? Object.entries(userInfo.games).map(())
              ? ''
              // userInfo?.games?.map((game) => {
              //   return (
              //     <PlayerRecordLine
              //       key={game.gid + game.winner.nickname + game.loser.nickname}
              //       LeftSideNickName={game.winner.nickname}
              //       LeftSideScore={game.winnerScore}
              //       RightSideScore={game.loserScore}
              //       RightSideNickName={game.loser.nickname}
              //     />
              //   );
              // })
              : ''

          }
          {/* {records.map(
            (record: {
              LeftSideNickName: string;
              LeftSideScore: string;
              RightSideScore: string;
              RightSideNickName: string;
            }): ReactElement => (
              <PlayerRecordLine
                LeftSideNickName={record.LeftSideNickName}
                LeftSideScore={record.LeftSideScore}
                RightSideScore={record.RightSideScore}
                RightSideNickName={record.RightSideNickName}
              />
            )
          )} */}
        </div>
      </div>
    </div>
  );
}
