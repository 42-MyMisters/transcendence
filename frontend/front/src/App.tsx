import { StrictMode, useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import GamePage from "./pages/GamePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

import { socketFirstTouch } from './components/atom/SocketAtom';
import { socket } from './socket/socket';
import { Provider, atom, useAtom, useAtomValue, useSetAtom } from "jotai";


export default function App() {

  const [socketState, setSocketState] = useState(socket);

  useEffect(() => {
    console.log(socketState);
  }, []);

  // const value = useAtomValue(socketFirstTouch);
  // const ShowSocket = () => {
  //   console.log("value : ", value);
  // };
  // const setSocket = useSetAtom(socketFirstTouch);
  // const setTrue = () => { setSocket(true) };
  // const setFalse = () => { setSocket(false) };

  return (
    <StrictMode>
      {/* <button onClick={ShowSocket}>show socket value</button>
      <button onClick={setTrue}>set true</button>
      <button onClick={setFalse}>set false</button> */}
      <Provider >
        <div className="WindowWrap">
          <Router>
            <Routes>
              <Route path="/chat" element={<ChatPage />}></Route>
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
