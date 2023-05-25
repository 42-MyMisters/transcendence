import { StrictMode } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import ChatWrapper from "./pages/ChatWrapper";
import GamePage from "./pages/GamePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";
import { Provider, useAtomValue } from "jotai";
import { hasLoginAtom } from "./components/atom/ChatAtom";

function CheckLogin({ children }: { children: JSX.Element }) {
  const hasLogin = useAtomValue(hasLoginAtom);

  if (!hasLogin) {
    return (
      <>
        <LoginPage />
      </>
    );
  } else {
    return (
      <>
        {children}
      </>
    );
  }
}

export default function App() {
  return (
    <StrictMode>
      <Provider>
        <div className="WindowWrap">
          <Router>
            <CheckLogin>
              <ChatWrapper>
                <Routes>
                  <Route path="/" element={<LoginPage />}></Route>
                  <Route path="/chat" element={<ChatPage />}></Route>
                  <Route path="/game" element={<GamePage />}></Route>
                  <Route path="/profile" element={<ProfilePage />}></Route>
                  <Route path="*" element={<NotFoundPage />}></Route>
                </Routes>
              </ChatWrapper>
            </CheckLogin>
          </Router>
        </div>
      </Provider>
    </StrictMode>
  );
}
