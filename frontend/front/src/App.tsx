import { StrictMode, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "jotai";

import ChatPage from "./pages/ChatPage";
import GamePage from "./pages/GamePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

import { PressKey } from "./event/pressKey";


export default function App() {
  const [socketState, setSocketState] = useState(0);
  // const reverse = () => {
  //   console.log(socketState);
  //   if (socketState) {
  //     setSocketState(0);
  //     console.log("in true -> false");
  //   } else {
  //     setSocketState(1);
  //     console.log("in false -> true");
  //   }
  //   console.log(socketState);
  // };
  // PressKey(["a"], () => { reverse() });


  return (
    <StrictMode>
      <Provider>
        <div className="WindowWrap">
          <Router>
            <Routes>
              <Route path="/chat" element={<ChatPage state={socketState} />}></Route>
              <Route path="/game" element={<GamePage />}></Route>
              <Route path="/profile" element={<ProfilePage />}></Route>
              <Route path="/" element={<LoginPage />}></Route>
              <Route path="*" element={<NotFoundPage />}></Route>
            </Routes>
          </Router>
        </div>
      </Provider>
    </StrictMode >
  );
}
