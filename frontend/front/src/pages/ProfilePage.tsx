import BackGround from "../components/BackGround";
import ProfilePageBG from "../components/ProfilePage/ProfilePageBG";
import ProfileNick from "../components/ProfilePage/ProfileNick";
import ProfileOptions from "../components/ProfilePage/ProfileOptions";
import TopBar from "../components/TopBar";
import ProfileImage from "../components/ProfilePage/ProfileImage";
import ProfileFriend from "../components/ProfilePage/ProfileFriend";
import ProfileMatchHistory from "../components/ProfilePage/ProfileMatchHistory";
import ChangeNameModal from "../components/ProfilePage/ChangeNameModal";
import ChangeImageModal from "../components/ProfilePage/ChangeImageModal";
import TFAQRModal from "../components/TFAQRModal";

import { useAtom } from "jotai";
import { changeNameModalAtom } from "../components/atom/ModalAtom";
import { changeImageModalAtom } from "../components/atom/ModalAtom";
import { UserAtom, isMyProfileAtom, ProfileAtom } from "../components/atom/UserAtom";
import { TFAModalAtom, TFAQRURL } from "../components/atom/ModalAtom";

export default function ProfilePage() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [changeImageModal, setchangeImageModal] = useAtom(changeImageModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [isMyProfile, setIsMyProfile] = useAtom(isMyProfileAtom);
  const [profile, setProfile] = useAtom(ProfileAtom);
  const [TFAModal, setTFAModal] = useAtom(TFAModalAtom);

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
