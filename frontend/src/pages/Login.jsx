import { useState } from "react";
import axios from "axios";
import { connectSocket } from "../socket";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const token = res.data.token;

      // ✅ store token
      localStorage.setItem("token", token);

      console.log("✅ Login success");

      // ✅ connect socket
      const socket = connectSocket(token);

      // ✅ test listeners immediately
      socket.on("task_created", (data) => {
        console.log("📌 Task Created:", data);
      });

      socket.on("task_updated", (data) => {
        console.log("✏️ Task Updated:", data);
      });

      socket.on("task_deleted", (data) => {
        console.log("🗑️ Task Deleted:", data);
      });

      socket.on("activity_created", (data) => {
        console.log("📊 Activity:", data);
      });

    } catch (err) {
      console.error("❌ Login failed", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;