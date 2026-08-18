import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useLang } from "./LanguageContext";

interface LoginScreenProps {
  onLoginSuccess: (nickname: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { t, toggleLang } = useLang();

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setError(t.loginError);
      return;
    }
    if (password.length < 6) {
      setError(t.errShortPassword);
      return;
    }

    setIsLoading(true);
    setError("");

    const sanitizedNick = nickname.trim().toLowerCase().replace(/\s+/g, "");
    const fakeEmail = `${sanitizedNick}@finance.local`;

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, fakeEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, fakeEmail, password);
      }

      localStorage.setItem("finance-app:nickname", nickname.trim());
      onLoginSuccess(nickname.trim());
    } catch (err) {
      console.error("Auth error:", err);

      const firebaseErr = err as { code?: string };

      if (firebaseErr.code === "auth/email-already-in-use") {
        setError(t.errNickTaken);
      } else if (
        firebaseErr.code === "auth/invalid-credential" ||
        firebaseErr.code === "auth/wrong-password" ||
        firebaseErr.code === "auth/user-not-found"
      ) {
        setError(t.errWrongCredentials);
      } else {
        setError(t.authError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setNickname("");
    setPassword("");
  };

  return (
    <div className="finance-dashboard login-container">
      <div className="login-lang-toggle">
        <button type="button" className="lang-toggle-btn" onClick={toggleLang}>
          {t.langToggle}
        </button>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">{t.title}</h1>
          <h2 className="login-subtitle">{t.loginTitle}</h2>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          <div className="login-form-group">
            <label className="login-form-label">{t.loginLabel}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t.loginPlaceholder}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              maxLength={20}
            />
          </div>

          <div className="login-form-group">
            <label className="login-form-label">{t.loginPin}</label>
            <input
              type="password"
              className="form-input"
              placeholder={t.pinPlaceholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              maxLength={30}
            />
          </div>

          {error && <div className="login-error-box">{error}</div>}

          <div className="form-actions login-form-actions">
            <button
              type="submit"
              className="btn-add login-submit-btn"
              disabled={isLoading}
            >
              {isLoading
                ? t.loginLoading
                : isRegisterMode
                  ? t.modeRegister
                  : t.loginBtn}
            </button>
          </div>
        </form>

        <div className="login-toggle-wrapper">
          <button
            type="button"
            className="login-toggle-mode-btn"
            onClick={toggleMode}
          >
            {isRegisterMode ? t.toggleToLogin : t.toggleToRegister}
          </button>
        </div>
      </div>
    </div>
  );
}
