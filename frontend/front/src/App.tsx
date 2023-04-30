import { StrictMode, useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import GamePage from "./pages/GamePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

import { Provider, atom, useAtom, useAtomValue, useSetAtom } from "jotai";

import { hasLoginAtom } from './components/atom/ChatAtom';

function CheckLogin({ children }: { children: JSX.Element }) {
  const [hasLogin] = useAtom(hasLoginAtom);

  if (!hasLogin) {
    return (
      <>
        <LoginPage />
        {/* {children} */}
      </>
    );
  } else {
    return <>{children}</>;
  }
}

export default function App() {
  return (
    <StrictMode>
      <Provider>
        <div className="WindowWrap">
          <Router>
            <CheckLogin>
              <Routes>
                <Route path="/chat" element={<ChatPage />}></Route>
                <Route path="/game" element={<GamePage />}></Route>
                <Route path="/profile" element={<ProfilePage />}></Route>
                <Route path="/" element={<LoginPage />}></Route>
                <Route path="*" element={<NotFoundPage />}></Route>
              </Routes>
            </CheckLogin>
          </Router>
        </div>
      </Provider>
    </StrictMode>
  );
}
