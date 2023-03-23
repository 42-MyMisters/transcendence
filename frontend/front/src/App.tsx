import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import GamePage from "./pages/GamePage";
import SettingPage from "./pages/SettingPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegitsterPage";

import "./App.css";

export default function App() {
  return (
    <div className="WindowWrap">
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage/>}></Route>
        <Route path="/chat" element={<ChatPage/>}></Route>
        <Route path="/game" element={<GamePage/>}></Route>
        <Route path="/setting" element={<SettingPage/>}></Route>
        <Route path="/notfound" element={<NotFoundPage/>}></Route>
        <Route path="/" element={<LoginPage/>}></Route>
        <Route path="*" element={<NotFoundPage/>}></Route>
      </Routes>
    </Router>
    </div>
  );
}