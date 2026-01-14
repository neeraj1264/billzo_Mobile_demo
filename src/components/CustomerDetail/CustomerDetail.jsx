// CustomerDetail.js
import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { handleScreenshot } from "../Utils/DownloadPng"; // Import the function
import "./Customer.css";
// import { handleScreenshotAsPDF } from "../Utils/DownloadPdf";
import Header from "../header/Header";
import { fetchcustomerdata, sendorder, setdata } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WhatsAppButton from "../Utils/WhatsappOrder";
import RawBTPrintButton from "../Utils/RawBTPrintButton";
import Rawbt3Inch from "../Utils/Rawbt3Inch";

const toastOptions = {
  position: "bottom-right",
  autoClose: 2000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};
const CustomerDetail = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [includeGST, setIncludeGST] = useState(false);

  const [deliveryCharge, setDeliveryCharge] = useState();
  const [discount, setDiscount] = useState(); // New discount state
  const parsedDiscount = parseFloat(discount) || 0; // Parsed discount

  const [showPopup, setShowPopup] = useState(false);
  const [productsToSend, setproductsToSend] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orders, setOrders] = useState([]);
  // const getdeliveryCharge = localStorage.getItem("deliveryCharge");
  const deliveryChargeAmount = parseFloat(deliveryCharge) || 0;
  // State to hold all saved customers for auto-fill
  const [savedCustomers, setSavedCustomers] = useState([]);
  // State to hold suggestions based on current phone input
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  // New state for name suggestions
  const [nameSuggestions, setNameSuggestions] = useState([]);

  const invoiceRef = useRef(); // Reference to the hidden invoice content
  const navigate = useNavigate();

  const RestorentName = localStorage.getItem("RestorentName");

  useEffect(() => {
    // Load selected products and total amount from localStorage
    const storedProducts =
      JSON.parse(localStorage.getItem("productsToSend")) || [];
    const storedAmount = parseFloat(localStorage.getItem("totalAmount")) || 0;
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(savedOrders);

    setproductsToSend(storedProducts);
    setTotalAmount(storedAmount);
  }, []);

  useEffect(() => {
    // Fetch customer data from API (or use localStorage fallback)
    const fetchData = async () => {
      try {
        const response = await fetchcustomerdata();
        console.log("Fetched customers:", response);
        const customersArray = Array.isArray(response)
          ? response
          : response.data || [];
        setSavedCustomers(customersArray);
      } catch (error) {
        console.error("Error fetching customer data:", error.message);
        const localStorageCustomers =
          JSON.parse(localStorage.getItem("customers")) || [];
        if (localStorageCustomers.length > 0) {
          setSavedCustomers(localStorageCustomers);
        }
      }
    };
    fetchData();
  }, []);

  // Update suggestions based on current phone input (prefix match)
  useEffect(() => {
    if (customerPhone.trim().length === 10) {
      setPhoneSuggestions([]);
    } else if (customerPhone.trim() !== "") {
      const suggestions = savedCustomers.filter((customer) =>
        String(customer.phone).trim().startsWith(customerPhone.trim())
      );
      setPhoneSuggestions(suggestions);
    } else {
      setPhoneSuggestions([]);
    }
  }, [customerPhone, savedCustomers]);

  // New effect for filtering suggestions by customer name
  useEffect(() => {
    if (customerName.trim() === "") {
      setNameSuggestions([]);
    } else {
      const suggestions = savedCustomers.filter((customer) =>
        customer.name
          .toLowerCase()
          .startsWith(customerName.trim().toLowerCase())
      );
      setNameSuggestions(suggestions);
    }
  }, [customerName, savedCustomers]);

  // When a suggestion is clicked, fill the fields and clear suggestions.
  const handleSuggestionClick = (customer) => {
    setCustomerPhone(String(customer.phone));
    setCustomerName(customer.name);
    setCustomerAddress(customer.address);
    setPhoneSuggestions([]);
    setNameSuggestions([]);
  };

  // New handler for clicking on a name suggestion.
  const handleNameSuggestionClick = (customer) => {
    setCustomerName(customer.name);
    setCustomerPhone(String(customer.phone));
    setCustomerAddress(customer.address);
    setNameSuggestions([]);
    setPhoneSuggestions([]); // Optionally clear phone suggestions too
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendClick = async () => {
    const productsToSend = JSON.parse(localStorage.getItem("productsToSend"));
    if (!productsToSend || productsToSend.length === 0) {
      toast.error("Please add product before proceed", toastOptions);
      return; // Exit the function early
    }

    setShowPopup(true);

    if (deliveryCharge) {
      localStorage.setItem("deliveryCharge", deliveryCharge);
    }

    const orderId = `order_${Date.now()}`;

    // Create an order object
    const order = {
      id: orderId,
      products: productsToSend,
      totalAmount:
        calculateTotalPrice(productsToSend) +
        (parseFloat(deliveryCharge) || 0) -
        parsedDiscount,
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
      timestamp: new Date().toISOString(),
      discount: parsedDiscount, // save discount
      delivery: parseFloat(deliveryCharge) || 0,
      includeGST,
    };
    console.log(order);
    const customerDataObject = {
      id: orderId,
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
      timestamp: new Date().toISOString(),
    };

    // Get the current orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];

    // Add the new order to the list
    savedOrders.push(order);

    // Save the updated orders back to localStorage
    localStorage.setItem("orders", JSON.stringify(savedOrders));

    try {
      console.log("🔶 Final order object:", order);
      console.log("🔶 JSON payload:", JSON.stringify(order));

      // Send the order to your backend to be saved in MongoDB
      const data = await sendorder(order);
      console.log("Order created:", data);

      // You can clear localStorage or perform any other actions as needed
      // localStorage.removeItem("products"); // Example
    } catch (error) {
      console.error("Error sending order:", error.message);
    }

    try {
      const customerDataResponse = await setdata(customerDataObject);
      if (
        customerDataResponse.message ===
        "Customer already exists, no changes made."
      ) {
        console.log(
          "Customer already exists in the database, no need to add again."
        );
      } else {
        console.log("Customer Data Added", customerDataResponse);
      }
    } catch (error) {
      console.error("Error sending customer data:", error.message);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);

    // Navigate to the invoice page
    navigate("/invoice");

    window.location.reload();
  };

  const handlePngDownload = () => {
    // Show the hidden invoice, take the screenshot, and then hide it again
    invoiceRef.current.style.display = "block";
    setTimeout(() => {
      handleScreenshot("invoice");
      invoiceRef.current.style.display = "none";
    }, 10);
  };

  // const UsbPrint = async () => {
  //   try {
  //     const kotContent = document.getElementById("mobileinvoice").innerHTML;

  //     const newWindow = window.open("", "", "width=600,height=400");
  //     newWindow.document.write(`
  //       <html>
  //         <head>
  //           <title>KOT</title>
  //           <style>
  //             body {
  //               font-family: Arial, sans-serif;
  //               font-size: 12px;
  //               margin: 3rem 0;
  //               padding: 0;
  //               width: 48mm;
  //             }
  //             table {
  //               width: 94%;
  //               border-collapse: collapse;
  //             }
  //             th, td {
  //               border: 2px solid black;
  //               padding: 2px;
  //               text-align: left;
  //               font-size: 10px;
  //               font-weight: bold;
  //             }
  //             .total {
  //               font-size: 13px;
  //               text-align: left;
  //               margin-top: 4px;
  //               display: flex;
  //               justify-content: space-between;
  //             }
  //             .totalAmount {
  //               font-size: 15px;
  //               font-weight: 800;
  //               border: 2px dashed;
  //               text-align: center;
  //               background: black;
  //               color: white;
  //               padding: 0.4rem;
  //             }
  //             .logo {
  //               display: flex;
  //               margin: auto;
  //             }
  //             .logo img {
  //               width: 40px;
  //               height: auto;
  //             }
  //             hr {
  //               border: 2px dashed;
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           ${kotContent}
  //         </body>
  //       </html>
  //     `);

  //     newWindow.document.close();

  //     newWindow.onload = () => {
  //       newWindow.focus();
  //       newWindow.print();
  //       newWindow.close();
  //     };
  //   } catch (error) {
  //     console.error("Error generating printable content:", error);
  //   }
  // };

  // Helper function to calculate total price
  const calculateTotalPrice = (products = []) => {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  // Handle customer phone input validation
  const handlePhoneChange = (e) => {
    const phoneValue = e.target.value;

    // Only allow numeric input and ensure length is <= 10
    // if (/^\d*$/.test(phoneValue) && phoneValue.length <= 10) {
    setCustomerPhone(phoneValue);
    // }
  };

  const itemTotal = calculateTotalPrice(productsToSend);
  const gstAmount = includeGST ? +(itemTotal * 0.05).toFixed(2) : 0;
  const netTotal =
    itemTotal + gstAmount + deliveryChargeAmount - parsedDiscount;

  return (
    <div>
      <ToastContainer />
      <Header />
      <div className="cust-inputs" style={{ marginTop: "4rem" }}>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name..."
        />
        {/* Name Suggestions Dropdown */}
        {nameSuggestions.length > 0 && (
          <ul
            className="suggestions"
            style={{
              background: "#fff",
              border: "2px solid black",
              zIndex: 10,
              listStyle: "none",
              padding: 0,
              margin: "auto",
              width: "90%",
              maxHeight: "150px",
              overflowY: "auto",
              borderRadius: "1rem",
            }}
          >
            {nameSuggestions.map((suggestion) => (
              <li
                key={suggestion.phone} // Assuming phone is unique
                onClick={() => handleNameSuggestionClick(suggestion)}
                style={{
                  padding: "0.5rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {suggestion.name} - {suggestion.phone}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="cust-inputs">
        <input
          type="text"
          value={customerPhone}
          onChange={handlePhoneChange}
          placeholder="Customer phone..."
        />
      </div>
      {/* Suggestions Dropdown */}
      {phoneSuggestions.length > 0 && (
        <ul
          className="suggestions"
          style={{
            background: "#fff",
            border: "2px solid black",
            zIndex: 10,
            listStyle: "none",
            padding: 0,
            margin: "auto",
            width: "90%",
            maxHeight: "150px",
            overflowY: "auto",
            borderRadius: "1rem",
          }}
        >
          {phoneSuggestions.map((suggestion) => (
            <li
              key={suggestion.phone}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {suggestion.phone} - {suggestion.name}
            </li>
          ))}
        </ul>
      )}
      <div className="cust-inputs">
        <input
          type="text"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="Customer address..."
        />
      </div>
      <div className="cust-inputs">
        <input
          type="number"
          value={deliveryCharge}
          onChange={(e) => setDeliveryCharge(e.target.value)}
          placeholder="Delivery charge..."
        />
      </div>
      <div className="cust-inputs">
        <input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          placeholder="Discount amount..."
        />
      </div>
      {/* Hidden Invoice Content */}
      <div
        className="invoice-content"
        id="invoice"
        ref={invoiceRef}
        style={{ display: "none" }}
      >
        <img src="/logo.jpg" alt="Logo" className="logo" />
        <h1 style={{ textAlign: "center", margin: 0, fontSize: "35px" }}>
          Chicago Delight's
        </h1>
        <p style={{ textAlign: "center", margin: 0, fontSize: "15px" }}>
          Oppsite Swarag Agency Kurukshetra <br /> Road Pehowa(136-128) <br /> 9896642812 <br /> 90340-62812
        </p>
        <hr />
        <h2 style={{ textAlign: "center", margin: 0, fontSize: "20px" }}>
          Invoice Details
        </h2>
        <div className="customer-info">
          {/* Bill No and Date */}
          <p style={{ fontSize: "15px" }}>
            Bill
            No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {`#${Math.floor(1000 + Math.random() * 9000)}`}{" "}
            {/* Random 6-digit bill number */}
          </p>
          <p style={{ fontSize: "15px" }}>
            Created
            On&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }) +
              " " +
              new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true, // Enables 12-hour format
              })}
          </p>
          {customerName && (
            <p style={{ fontSize: "15px" }}>
              Customer Name &nbsp;&nbsp;- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {customerName}
            </p>
          )}
          {customerPhone && (
            <p style={{ fontSize: "15px" }}>
              Phone Number &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;
              {customerPhone}
            </p>
          )}
          {customerAddress && (
            <p style={{ fontSize: "15px" }}>
              Address&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {customerAddress}
            </p>
          )}
        </div>
        <table
          style={{
            width: "100%",
            tableLayout: "fixed", // allow us to control column widths
          }}
        >
          <colgroup>
            <col style={{ width: "50%" }} /> {/* product name */}
            <col style={{ width: "15%" }} /> {/* qty */}
            <col style={{ width: "15%" }} /> {/* price */}
            <col style={{ width: "20%" }} /> {/* total */}
          </colgroup>
          <thead>
            <tr className="productname">
              <th>Product Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {productsToSend.map((product, index) => (
              <tr key={index} className="productdetail">
                <td>
                  {product.size
                    ? `${product.name} (${product.size})`
                    : product.name}
                </td>
                <td style={{ textAlign: "Center" }}>{product.quantity || 1}</td>
                <td style={{ textAlign: "Center" }}>₹{product.price}</td>
                <td style={{ textAlign: "center" }}>
                  ₹{product.price * (product.quantity || 1)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
           {includeGST && (
          <tr className="productdetail">
            <td colSpan={3} style={{ textAlign: "right", fontStyle: "italic" }}>
              GST (5%)
            </td>
            <td style={{ textAlign: "center" }}>+₹{gstAmount}</td>
          </tr>
        )}
            {deliveryChargeAmount > 0 && (
              <tr className="productdetail">
                {/* span first three cols to label “Service Charge” */}
                <td
                  colSpan={3}
                  style={{ textAlign: "right", fontStyle: "italic" }}
                >
                  Service Charge
                </td>
                <td style={{ textAlign: "center" }}>
                  +₹{deliveryChargeAmount}
                </td>
              </tr>
            )}

            {parsedDiscount > 0 && (
              <tr className="productdetail">
                <td
                  colSpan={3}
                  style={{ textAlign: "right", fontStyle: "italic" }}
                >
                  Discount
                </td>
                <td style={{ textAlign: "center" }}>-₹{parsedDiscount}</td>
              </tr>
            )}
          </tfoot>
        </table>
        <p className="totalAmount">Net Total: ₹{netTotal.toFixed(2)}</p>
      </div>
      {/* mobile print content */}
      <div
        className="invoice-content"
        id="mobileinvoice"
        // ref={invoiceRef}
        style={{ display: "none" }}
      >
        <img src="/logo.png" alt="Logo" width={100} className="logo" />
        <h1 style={{ textAlign: "center", margin: 0, fontSize: "25px" }}>
          Foodies Hub
        </h1>
        <p
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: "14px",
            padding: "0 2px",
          }}
        >
          Pehowa, Haryana, 136128
        </p>
        <p style={{ textAlign: "center", margin: 0, fontSize: "14px" }}>
          +91 70158-23645
        </p>
        <hr />
        <h2 style={{ textAlign: "center", margin: 0, fontSize: "20px" }}>
          Invoice Details
        </h2>
        <div className="customer-info">
          <p style={{ fontSize: "15px" }}>
            Bill No&nbsp;&nbsp;-&nbsp;&nbsp;
            {`#${Math.floor(1000 + Math.random() * 9000)}`}{" "}
            {/* Random 6-digit bill number */}
          </p>
          <p style={{ fontSize: "13px" }}>
            Created On:&nbsp;
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }) +
              " " +
              new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true, // Enables 12-hour format
              })}
          </p>

          {customerPhone && (
            <p style={{ fontSize: "12px" }}>
              Phone Number &nbsp;- &nbsp;{customerPhone}
            </p>
          )}
          {customerAddress && (
            <p style={{ fontSize: "13px" }}>
              Address&nbsp;-&nbsp;{customerAddress}
            </p>
          )}
        </div>
        <table>
          <thead>
            <tr className="productname">
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {productsToSend.map((product, index) => (
              <tr key={index} className="productdetail">
                <td>
                  {product.size
                    ? `${product.name} (${product.size})`
                    : product.name}
                </td>
                <td style={{ textAlign: "Center" }}>{product.quantity || 1}</td>
                <td style={{ textAlign: "Center" }}>₹{product.price}</td>
                <td style={{ textAlign: "Center" }}>
                  ₹{product.price * (product.quantity || 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Show this whole section only if there’s a delivery charge or a discount */}
        {(deliveryChargeAmount !== 0 || parsedDiscount !== 0) && (
          <>
            {/* Item total is always shown whenever any extra applies */}
            <div className="total">
              <p style={{ margin: "0" }}>Item Total</p>
              <p style={{ margin: "0" }}>
                {productsToSend
                  .reduce(
                    (sum, product) =>
                      sum + product.price * (product.quantity || 1),
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>

            {/* Service Charge line: only if there is one */}
            {deliveryChargeAmount !== 0 && (
              <div className="total">
                <p style={{ margin: "0" }}>Service Charge:</p>
                <p style={{ margin: "0" }}>
                  +{deliveryChargeAmount.toFixed(2)}
                </p>
              </div>
            )}

            {/* Discount line: only if there is one */}
            {parsedDiscount !== 0 && (
              <div className="total">
                <p style={{ margin: "0" }}>Discount:</p>
                <p style={{ margin: "0" }}>-{parsedDiscount.toFixed(2)}</p>
              </div>
            )}
          </>
        )}
        <p className="totalAmount">
          Net Total: ₹
          {(
            productsToSend.reduce(
              (sum, product) => sum + product.price * (product.quantity || 1),
              0
            ) +
            deliveryChargeAmount -
            parsedDiscount
          ).toFixed(2)}
        </p>{" "}
        <div
          style={{
            textAlign: "center",
            fontSize: "15px",
            paddingBottom: "2rem",
          }}
        >
          Thank You!
        </div>
        <hr />
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          {" "}
          Order Online
        </div>
        <img
          src="/qr-code.png"
          alt="QR Code"
          style={{ width: "80%", display: "flex", margin: "2px auto" }}
        />
      </div>
      <button onClick={handleSendClick} className="done">
        Send <FaArrowRight className="Invoice-arrow" />
      </button>
      {/* Modal Popup */}
      {showPopup && (
        <div className="popupOverlay">
          <div className="popupContent">
            <h2>Select Action</h2>

             {/* GST toggle */}
          {/* <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              checked={includeGST}
              onChange={e => setIncludeGST(e.target.checked)}
              style={{ width: '20%' }}
            />
            Include 5% GST
          </label> */}

            <WhatsAppButton
              productsToSend={productsToSend}
              deliveryChargeAmount={deliveryChargeAmount}
              deliveryCharge={deliveryCharge}
              parsedDiscount={parsedDiscount}
              customerPhone={customerPhone}
              customerName={customerName}
              customerAddress={customerAddress}
              restaurantName={RestorentName}
              includeGST={includeGST}
            />
            <button onClick={handlePngDownload} className="popupButton">
              Download Invoice
            </button>
            <Rawbt3Inch
              productsToSend={productsToSend}
              parsedDiscount={parsedDiscount}
              deliveryChargeAmount={parseFloat(deliveryCharge) || 0}
              customerPhone={customerPhone}
              customerName={customerName}
              customerAddress={customerAddress}
              includeGST={includeGST} 
            />
            {/* <button onClick={UsbPrint} className="popupButton">
              Usb Print
            </button> */}

            <button onClick={handleClosePopup} className="popupCloseButton">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
