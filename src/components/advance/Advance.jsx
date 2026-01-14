import React, { useState, useEffect } from "react";
import "./Advance.css";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";

const Advance = ({ orders, setOrders }) => {
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdvancedAccessGranted, setIsAdvancedAccessGranted] = useState(false);
  const [advancedCheckboxState, setAdvancedCheckboxState] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [modalMessage, setModalMessage] = useState(""); // Modal message

  const advpassword = localStorage.getItem("advpassword")
  const AdvPassword = advpassword;
  console.log("Advance password is :",AdvPassword);

  useEffect(() => {
    const advancedFeatureAccess = localStorage.getItem("advancedFeature");

    if (advancedFeatureAccess === "true") {
      setIsAdvancedAccessGranted(true);
      setAdvancedCheckboxState(true);
    }
  }, []);

  const handlePasswordSubmit = () => {
    if (password === AdvPassword) {
      localStorage.setItem("advancedFeature", "true");
      setTimeout(() => {
        setIsAdvancedAccessGranted(true);
        setAdvancedCheckboxState(true);
        setShowPasswordPopup(false);
      }, 1500);
      setModalMessage("Access granted");
      setIsModalOpen(true); // Show the success modal
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } else {
      setModalMessage("Incorrect password. Try again.");
      setIsModalOpen(true); // Show the success modal
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    }
  };

  const handleAdvancedCheckboxClick = () => {
    if (advancedCheckboxState) {
      localStorage.removeItem("advancedFeature");
      setModalMessage("Access removed!");
      setIsModalOpen(true); // Show the success modal
      setTimeout(() => {
        setAdvancedCheckboxState(false);
        setIsAdvancedAccessGranted(false);
      }, 1500);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } else {
      setShowPasswordPopup(true);
    }
  };

  const advancedFeatureAccess = localStorage.getItem("advancedFeature");
  const modalBackgroundColor = advancedFeatureAccess === "true" ? "green" : "red"; // Set background color conditionally

  return (
    <>
      <Header />
      <div className="advance-page">
        {/* Advanced Features Checkbox */}
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={advancedCheckboxState}
              onChange={handleAdvancedCheckboxClick}
            />
            <h4>Access Advanced Features</h4>
          </label>
        </div>

        {/* Password Popup */}
        {showPasswordPopup && (
          <div className="advance-password-popup">
            <div className="popup-content">
              <h3>Enter Password</h3>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button onClick={handlePasswordSubmit}>Submit</button>
              <button onClick={() => setShowPasswordPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content-history"  style={{ backgroundColor: modalBackgroundColor }} >
            <p className="custom-modal-message-history">{modalMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Advance;
