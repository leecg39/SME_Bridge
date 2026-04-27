"use client";

import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("register");

  function handleSubmit() {
    window.localStorage.setItem(
      "smeBridgeUser",
      JSON.stringify({ name: "김영호", email: "ceo@example.com" }),
    );
    window.location.href = "/dashboard";
  }

  return (
    <section className="page">
      <h1 className="page-title">계정 시작</h1>
      <p className="lead">데모 계정으로 MVP 흐름을 바로 확인할 수 있습니다.</p>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="segmented" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <button
            className={mode === "register" ? "active" : ""}
            type="button"
            onClick={() => setMode("register")}
          >
            회원가입
          </button>
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => setMode("login")}
          >
            로그인
          </button>
        </div>
        <div className="form" style={{ marginTop: 24 }}>
          <div className="field">
            <label htmlFor="email">이메일</label>
            <input id="email" defaultValue="ceo@example.com" type="email" />
          </div>
          <div className="field">
            <label htmlFor="password">비밀번호</label>
            <input id="password" defaultValue="succession2026" type="password" />
          </div>
          {mode === "register" ? (
            <div className="field">
              <label htmlFor="name">성함</label>
              <input id="name" defaultValue="김영호" />
            </div>
          ) : null}
          <button className="button-primary" type="button" onClick={handleSubmit}>
            {mode === "register" ? "회원가입 후 대시보드로" : "로그인"}
          </button>
        </div>
      </div>
    </section>
  );
}
