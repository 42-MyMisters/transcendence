import "../../styles/ProfilePage.css";

export default function ProfileImage({ imgUrl }: { imgUrl: string }) {
  return (
    <div
      className="ProfileImage"
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "200px",
        width: "200px",
        height: "200px",
      }}
    />
  );
}
