"use client";

import React, { useState } from "react";
import axios from "axios";

export type User = {
  username: string;
  email?: string;
  age?: number;
  token?: string;
};

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
};

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isLogin
        ? "http://localhost:8080/api/signin"
        : "http://localhost:8080/api/signup";

      const payload = isLogin
        ? { username, password }
        : { username, password, email, age };

      const res = await axios.post<User>(url, payload);

      if (isLogin) {
        setMessage(`Đăng nhập thành công! Xin chào ${res.data.username || username}`);
        if (res.data.token) localStorage.setItem("token", res.data.token);
        onLoginSuccess(res.data);
        onClose();
      } else {
        setMessage("Đăng ký thành công! Hãy đăng nhập");
        const agree = window.confirm("Đăng ký thành công! Bạn có muốn chuyển sang đăng nhập không?");
        if (agree) {
          setIsLogin(true);
          setMessage("");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || error.response?.data?.error || "Có lỗi xảy ra");
      } else {
        setMessage("Lỗi không xác định");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-white/10">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-xl"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
          {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-gray-700 focus:border-pink-400 focus:ring focus:ring-pink-500/30 outline-none"
            required
          />

          {!isLogin && (
            <input
              type="email"
              placeholder="Địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-gray-700 focus:border-yellow-400 focus:ring focus:ring-yellow-500/30 outline-none"
              required
            />
          )}

          {!isLogin && (
            <input
              type="number"
              placeholder="Tuổi"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-gray-700 focus:border-green-400 focus:ring focus:ring-green-500/30 outline-none"
              required
            />
          )}

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-400 focus:ring focus:ring-blue-500/30 outline-none"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-yellow-500 hover:to-pink-500 transition-all duration-300 shadow-lg"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {/* Thông báo */}
        {message && (
          <p className="text-center mt-4 text-sm text-green-400">{message}</p>
        )}

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            className="text-sm text-gray-300 hover:text-pink-400 transition"
          >
            {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
