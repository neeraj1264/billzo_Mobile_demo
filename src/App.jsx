// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Invoice from "./components/Invoice/Invoice";
import "./App.css";
import CustomerDetail from "./components/CustomerDetail/CustomerDetail";
import NewProduct from "./components/ProductAdded/NewProduct";
import History from "./components/history/History";
import { CustomerData } from "./components/data/CustomerData";
import Advance from "./components/advance/Advance";
import Login from "./components/login/Login"; 
import OrderReport from "./OrderReport";

const App = () => {
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordPopup, setShowPasswordPopup] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [baseUrl, setBaseUrl] = useState(""); // Dynamic BASE_URL

  const currentRoute = window.location.pathname;
  const USERS = JSON.parse(import.meta.env.VITE_USERS || "[]");

  // Clear 'productsToSend' from localStorage on page reload
  useEffect(() => {
    // Check if the user is already logged in
    const storedBaseUrl = localStorage.getItem("userBaseUrl");
    if (storedBaseUrl) {
      setBaseUrl(storedBaseUrl);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(true);
    }

    const storedPasswordStatus = localStorage.getItem("passwordCorrect");
    if (storedPasswordStatus === "true") {
      setIsPasswordCorrect(true);
      setShowPasswordPopup(false); // Hide password popup if already logged in
    }

    const handleBeforeUnload = () => {
      localStorage.removeItem("productsToSend");
    };

    // Set the event listener for page reload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleClickOutsidePopup = (event) => {
      // Check if the clicked element is not inside the install popup
      if (!event.target.closest(".install-popup")) {
        setInstallPrompt(null);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    document.addEventListener("click", handleClickOutsidePopup);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      document.removeEventListener("click", handleClickOutsidePopup);
    };
  }, []);

  return (
      <Router>
        {!isLoggedIn ? (
          <Routes>
            <Route
              path="*"
              element={
                <Login
                  setBaseUrl={(url) => {
                    localStorage.setItem("userBaseUrl", url);
                    setBaseUrl(url);
                    setIsLoggedIn(true);
                  }}
                />
              }
            />
          </Routes>
        ) : (
          <>
            <Routes>
              <Route path="/" element={<Navigate to="/invoice" />} />
              <Route
                path="/NewProduct"
                element={<NewProduct setSelectedProducts={() => {}} />}
              />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/customer-detail" element={<CustomerDetail />} />
              <Route path="/customer-data" element={<CustomerData />} />
              <Route path="/history" element={<History />} />
              <Route path="/advance" element={<Advance />} />
              <Route path="/report" element={<OrderReport />} />
            </Routes>
          </>
        )}
      </Router>
        );
};

export default App;
