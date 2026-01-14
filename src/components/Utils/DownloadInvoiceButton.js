// src/Utils/DownloadInvoiceButton.jsx
import React, { useRef } from "react";
import { toast } from "react-toastify";
import { handleScreenshot } from "./DownloadPng";

export default function DownloadInvoiceButton({ invoiceRef, toastOptions }) {
  const onClick = () => {
    if (!invoiceRef.current) {
      return toast.error("Invoice not ready", toastOptions);
    }
    invoiceRef.current.style.display = "block";
    setTimeout(() => {
      handleScreenshot("invoice");
      invoiceRef.current.style.display = "none";
    }, 10);
  };

  return (
    <button onClick={onClick} className="popupButton">
      Download Invoice
    </button>
  );
}
