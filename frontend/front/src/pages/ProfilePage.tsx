import BackGround from "../components/BackGround";
import ProfilePageBG from "../components/ProfilePage/ProfilePageBG";
import ProfileNick from "../components/ProfilePage/ProfileNick";
import ProfileOptions from "../components/ProfilePage/ProfileOptions";
import TopBar from "../components/TopBar";
import ProfileImage from "../components/ProfilePage/ProfileImage";
import ProfileFriend from "../components/ProfilePage/ProfileFriend";
import ProfileMatchHistory from "../components/ProfilePage/ProfileMatchHistory";

export default function ProfilePage() {
  return (
    <BackGround>
      <TopBar />
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
