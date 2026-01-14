import React, { useState } from "react";
import "./Login.css";

const Login = ({ setBaseUrl }) => {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [modalMessage, setModalMessage] = useState(""); // Modal message
  const USERS = JSON.parse(import.meta.env.VITE_USERS || "[]");

  const handleLogin = () => {
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setModalMessage("Login successful!");
      setIsModalOpen(true); // Show the success modal
      setTimeout(() => {
        setBaseUrl(user.baseUrl); // Set BASE_URL dynamically
        localStorage.setItem("userBaseUrl", user.baseUrl); // Persist BASE_URL in localStorage
        localStorage.setItem("advpassword", user.advancepassword);
        localStorage.setItem("RestorentName", user.restoname);
        localStorage.setItem("Address", user.address);
      }, 1000); // Delay for 2 seconds (2000 milliseconds)
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  const login = localStorage.getItem("userBaseUrl");
  const modalBackgroundColor = !login ? "green" : ""; // Set background color conditionally

  return (
    <div className="login-form">
      <h2>Login to continue</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="form">
        <div className="form-group">
          <label>username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setusername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <button onClick={handleLogin} className="login-btn">
        Login
      </button>
      {/* Custom Modal */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content" style={{ backgroundColor: modalBackgroundColor , color: "white" }}>
            <p className="custom-modal-message">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
