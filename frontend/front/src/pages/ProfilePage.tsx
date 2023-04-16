import BackGround from "../components/BackGround";
import ProfilePageBG from "../components/ProfilePage/ProfilePageBG";
import ProfileNick from "../components/ProfilePage/ProfileNick";
import ProfileOptions from "../components/ProfilePage/ProfileOptions";
import TopBar from "../components/TopBar";
import ProfileImage from "../components/ProfilePage/ProfileImage";
import ProfileFriend from "../components/ProfilePage/ProfileFriend";
import ProfileMatchHistory from "../components/ProfilePage/ProfileMatchHistory";
import ChangeNameModal from "../components/ProfilePage/ChangNameModal";

import { useAtom } from "jotai";
import { changeNameModalAtom } from "../components/atom/ModalAtom";

export default function ProfilePage() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  return (
    <BackGround>
      <TopBar />
      {changeNameModal ? <ChangeNameModal /> : null}
      <ProfilePageBG>
        <ProfileImage />
        <ProfileNick />
        <ProfileOptions />
        <ProfileFriend />
        <ProfileMatchHistory />
      </ProfilePageBG>
    </BackGround>
  );
}
