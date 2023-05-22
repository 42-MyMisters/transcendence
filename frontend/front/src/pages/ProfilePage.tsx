import BackGround from "../components/BackGround";
import ChangeImageModal from "../components/ProfilePage/ChangeImageModal";
import ChangeNameModal from "../components/ProfilePage/ChangeNameModal";
import ProfileFriend from "../components/ProfilePage/ProfileFriend";
import ProfileImage from "../components/ProfilePage/ProfileImage";
import ProfileMatchHistory from "../components/ProfilePage/ProfileMatchHistory";
import ProfileNick from "../components/ProfilePage/ProfileNick";
import ProfileOptions from "../components/ProfilePage/ProfileOptions";
import ProfilePageBG from "../components/ProfilePage/ProfilePageBG";
import TFAQRModal from "../components/TFAQRModal";
import TopBar from "../components/TopBar";

import { useAtomValue } from "jotai";
import { TFAModalAtom, changeImageModalAtom, changeNameModalAtom } from "../components/atom/ModalAtom";
import { ProfileAtom, UserAtom, isMyProfileAtom } from "../components/atom/UserAtom";

export default function ProfilePage() {
  const changeNameModal = useAtomValue(changeNameModalAtom);
  const changeImageModal = useAtomValue(changeImageModalAtom);
  const userInfo = useAtomValue(UserAtom);
  const isMyProfile = useAtomValue(isMyProfileAtom);
  const profile = useAtomValue(ProfileAtom);
  const TFAModal = useAtomValue(TFAModalAtom);

  return (
    <BackGround>
      <TopBar />
      {
        TFAModal
          ? <TFAQRModal />
          : ''
      }
      {changeNameModal && isMyProfile ? <ChangeNameModal /> : null}
      {changeImageModal && isMyProfile ? <ChangeImageModal /> : null}
      <ProfilePageBG>
        {
          isMyProfile
            ? <ProfileImage imgUrl={userInfo?.profileUrl ?? "/src/assets/smile.png"} />
            : <ProfileImage imgUrl={profile?.profileUrl ?? "/src/assets/smile.png"} />
        }
        {
          isMyProfile
            ? <ProfileNick nickName={userInfo?.nickname ?? "NickName"} />
            : <ProfileNick nickName={profile?.nickname ?? "NickName"} />
        }
        <ProfileOptions />
        <ProfileFriend />
        <ProfileMatchHistory />
      </ProfilePageBG>
    </BackGround>
  );
}
