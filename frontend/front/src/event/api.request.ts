import { NavigateFunction } from "react-router-dom";
import type { UserType } from "../components/atom/UserAtom";
import type * as chatType from "../socket/chat.dto";
import * as socket from "../socket/chat.socket";
import { AdminLogPrinter } from "../event/event.util";

type setUserInfo = React.Dispatch<React.SetStateAction<UserType>>;

export async function DoFollow(
  adminConsole: boolean,
  userUid: number,
  doOrUndo: boolean,
  followingList: chatType.userDto,
  setFollowingList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
  userList: chatType.userDto
): Promise<number> {
  let status = -1;
  const resource = doOrUndo ? "follow" : "unfollow";

  await fetch(`${process.env.REACT_APP_API_URL}/user/` + resource + `/${userUid}`, {
    credentials: "include",
    method: "POST",
  })
    .then((response) => {
      status = response.status;
      switch (response.status) {
        case 201: {
          if (doOrUndo) {
            const tempFollowing: chatType.userDto = {};
            tempFollowing[userUid] = {
              ...userList[userUid],
            };
            setFollowingList({ ...followingList, ...tempFollowing });
          } else {
            const tempFollowing = { ...followingList };
            delete tempFollowing[userUid];
            setFollowingList({ ...tempFollowing });
          }
          break;
        }
        default: {
          throw new Error(`${response.status}`);
        }
      }
    })
    .catch((error) => {
      AdminLogPrinter(adminConsole, `\nDoFollow catch_error: ${error} `);
    });

  return status;
}

export async function changeProfileImage(
  adminConsole: boolean,
  imageData: FormData,
  callback = (): any => { }
): Promise<number> {
  let status = -1;

  try {
    await fetch(`${process.env.REACT_APP_API_URL}/user/profile-img-change`, {
      credentials: "include",
      method: "POST",
      body: imageData,
    })
      .then((response) => {
        status = response.status;
        AdminLogPrinter(adminConsole, '\nchangeProfileImage: ', response);
        if (response.status === 201) {
          socket.socket.emit('user-change-info', 'image');
          callback();
        } else {
          throw new Error(`${response.status}`);
        }
      })
      .catch((error) => {
        AdminLogPrinter(adminConsole, `\nchangeProfileImage error: ${error}`);
      });
  } catch (error) {
    alert(error);
  }

  return status;
}

export async function changeNickName(
  adminConsole: boolean,
  newName: string,
  callback = (): any => { }
): Promise<number> {
  let status = -1;

  await fetch(`${process.env.REACT_APP_API_URL}/user/nickname`, {
    credentials: "include",
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: newName,
  })
    .then((response) => {
      status = response.status;
      AdminLogPrinter(adminConsole, '\nchangeNickName:', response);
      if (response.status === 200) {
        socket.socket.emit('user-change-info', 'name');
        callback();
      } else {
        throw new Error(`${response.status}`);
      }
    })
    .catch((error) => {
      if (error.message === "400") {
        alert("중복된 닉네임입니다.");
      }
      AdminLogPrinter(adminConsole, `\nchangeNickName error: ${error}`);
    });

  return status;
}

export async function GetMyInfo(
  adminConsole: boolean,
  setUserInfo: setUserInfo
): Promise<number> {
  let status = -1;

  await fetch(`${process.env.REACT_APP_API_URL}/user/me`, {
    credentials: "include",
    method: "GET",
  })
    .then((response) => {
      switch (response.status) {
        case 200: {
          status = 200;
          return response.json();
        }
        default: {
          throw new Error(`${response.status}`);
        }
      }
    })
    .then((response) => {
      AdminLogPrinter(adminConsole, `\nGetMyInfo: ${JSON.stringify(response)}`);
      response.nickname = response.nickname.split("#", 2)[0];
      setUserInfo({ ...response, date: new Date() });
    })
    .catch((error) => {
      status = error.message;
      AdminLogPrinter(adminConsole, `\nGetMyInfo catch_error: ${error} `);
    });

  return status;
}

export async function GetOtherProfile(
  adminConsole: boolean,
  setUserInfo: setUserInfo,
  uid: number): Promise<number> {
  let status = -1;

  await fetch(`${process.env.REACT_APP_API_URL}/user/profile/` + `${uid}`, {
    credentials: "include",
    method: "GET",
  })
    .then((response) => {
      switch (response.status) {
        case 200: {
          status = 200;
          return response.json();
        }
        default: {
          throw new Error(`${response.status}`);
        }
      }
    })
    .then((response) => {
      AdminLogPrinter(adminConsole, `\nGetOtherProfile: ${JSON.stringify(response)}`);
      response.nickname = response.nickname.split("#", 2)[0];
      setUserInfo({ ...response });
    })
    .catch((error) => {
      status = error.message;
      AdminLogPrinter(adminConsole, `\nGetOtherProfile catch_error: ${error} `);
    });

  return status;
}

export async function RefreshToken(
  adminConsole: boolean,
  callback = (): any => { }): Promise<number> {
  let status = -1;

  AdminLogPrinter(adminConsole, `in try refresh Token`);
  await fetch(`${process.env.REACT_APP_API_URL}/login/oauth/refresh`, {
    credentials: "include",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("refreshToken"),
    },
  })
    .then((response) => {
      status = response.status;
      switch (response.status) {
        case 201: {
          callback();
          break;
        }
        default: {
          throw new Error(`${response.status}`);
        }
      }
    })
    .catch((error) => {
      AdminLogPrinter(adminConsole, `\nRefreshToken catch_error: ${error} `);
    });

  return status;
}

export function LogOut(
  adminConsole: boolean,
  setRefreshToken: React.Dispatch<React.SetStateAction<boolean>>,
  navigate: NavigateFunction,
  to: string
) {
  AdminLogPrinter(adminConsole, "logout");
  socket.socket.emit("chat-logout");
  socket.socket.disconnect();
  localStorage.clear();
  setRefreshToken(false);
  navigate(to);
}
