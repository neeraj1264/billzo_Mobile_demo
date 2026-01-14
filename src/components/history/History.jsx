import React, { useState, useEffect } from "react";
import "./History.css";
import { FaPrint, FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchOrders, removeOrder } from "../../api";
import Header from "../header/Header";
import RawBTPrintButton from "../Utils/RawBTPrintButton";
import WhatsAppButton from "../Utils/WhatsappOrder";
import { MdDelete } from "react-icons/md";
import Rawbt3Inch from "../Utils/Rawbt3Inch";

const History = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [filter, setFilter] = useState("Today");
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Track expanded order
  const [loading, setLoading] = useState(false); // Loading state
  const [showRemoveBtn, setShowRemoveBtn] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [modalMessage, setModalMessage] = useState(""); // Modal message
  const [totalCash, setTotalCash] = useState(0);
  const [totalUpi, setTotalUpi] = useState(0);

  // Show remove button on long press
  let pressTimer;
  const handlePressStart = () => {
    pressTimer = setTimeout(() => {
      setShowRemoveBtn(true);
    }, 1000);
  };
  const handlePressEnd = () => {
    clearTimeout(pressTimer);
  };

  const handleRemoveOrder = async (orderId) => {
    try {
      const advanceFeatured =
        localStorage.getItem("advancedFeature") === "true";

      if (!advanceFeatured) {
        // not enabled → show “feature not granted” message
        setModalMessage("Advance feature not granted.");
        setIsModalOpen(true);
        return;
      }

      // advanced feature is enabled → ask for confirmation
      const confirmDelete = window.confirm(
        "This will permanently delete the order. Are you sure?"
      );
      if (!confirmDelete) return; // user cancelled

      // user confirmed → proceed with deletion
      await removeOrder(orderId);

      // update local state
      const updatedOrders = orders.filter((o) => o.id !== orderId);
      setOrders(updatedOrders);
      setFilteredOrders((prev) => prev.filter((o) => o.id !== orderId));

      console.log("Order removed successfully from both MongoDB and state");
    } catch (error) {
      console.error("Error removing order:", error.message);
      // you could also show a toast / modal here
    }
  };

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true); // Start loading
      try {
        const data = await fetchOrders(); // Call the API function

        setOrders(data);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today at midnight

        // Calculate start and end time for the selected day
        const daysAgo = getDaysAgo(filter);
        const startOfSelectedDay = new Date(today);
        startOfSelectedDay.setDate(today.getDate() - daysAgo);

        const endOfSelectedDay = new Date(startOfSelectedDay);
        endOfSelectedDay.setHours(23, 59, 59, 999);

        // Filter orders for the selected day
        const dayOrders = data.filter((order) => {
          const orderDate = new Date(order.timestamp);
          return (
            orderDate >= startOfSelectedDay && orderDate <= endOfSelectedDay
          );
        });

        setFilteredOrders(dayOrders);

              // Calculate grand total for the day
        const total = dayOrders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        );
        setGrandTotal(total);
         const cashTotal = dayOrders.reduce(
          (sum, o) => sum + (o.cashAmount || 0),
          0
        );
        const upiTotal = dayOrders.reduce(
          (sum, o) => sum + (o.upiAmount || 0),
          0
        );

        setTotalCash(cashTotal);
        setTotalUpi(upiTotal);
      } catch (error) {
        console.error("Error fetching orders:", error.message);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    getOrders();
  }, [filter]);

  // Helper to get "days ago" count
  const getDaysAgo = (filterValue) => {
    switch (filterValue) {
      case "Today":
        return 0;
      case "Yesterday":
        return 1;
      default:
        return parseInt(filterValue.split(" ")[0]); // Extract '2' from '2 days ago'
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (isoString) => {
    const orderDate = new Date(isoString);
    const day = orderDate.getDate();
    const month = orderDate.toLocaleString("default", { month: "short" });
    const year = orderDate.getFullYear();
    const hours = orderDate.getHours() % 12 || 12;
    const minutes = orderDate.getMinutes().toString().padStart(2, "0");
    const period = orderDate.getHours() >= 12 ? "PM" : "AM";

    return `${month} ${day}, ${year} - ${hours}:${minutes} ${period}`;
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const toggleOrder = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  const handleWhatsappClick = (order) => {
    const customerPhoneNumber = order.phone; // Correct field to access phone number
    const message = `We hope you had a delightful order experience with us. Your feedback is incredibly valuable as we continue to enhance our services. How did you enjoy your meal? We’d love to hear your thoughts.\nTeam: Chicago Delight's`;
    // Create the WhatsApp URL to send the message
    const whatsappUrl = `https://wa.me/+91${customerPhoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    // Open WhatsApp with the message
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div>
      <Header headerName="Order History" />
      <div className="filter-container">
        <select
          id="filter"
          value={filter}
          onChange={handleFilterChange}
          style={{ borderRadius: "1rem" }}
        >
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          {[...Array(6)].map((_, i) => (
            <option key={i} value={`${i + 2} days ago`}>
              {i + 2} days ago
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="lds-ripple">
          <div></div>
          <div></div>
        </div>
      ) : (
        <div className="history-container">
          <div className="grand-total">
            <h2 className="total-sale">
              <select
                id="filter"
                value={filter}
                onChange={handleFilterChange}
                style={{ borderRadius: "1rem" }}
              >
                <option value="Today">
                  Today ₹
                  {orders
                    .filter(
                      (order) =>
                        new Date(order.timestamp).toLocaleDateString() ===
                        new Date().toLocaleDateString()
                    )
                    .reduce((sum, order) => sum + order.totalAmount, 0)}
                </option>
                <option value="Yesterday">
                  Yesterday ₹
                  {orders
                    .filter((order) => {
                      const orderDate = new Date(order.timestamp);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return (
                        orderDate.toLocaleDateString() ===
                        yesterday.toLocaleDateString()
                      );
                    })
                    .reduce((sum, order) => sum + order.totalAmount, 0)}
                </option>
                {[...Array(6)].map((_, i) => (
                  <option key={i} value={`${i + 2} days ago`}>
                    {i + 2} days ago ₹
                    {orders
                      .filter((order) => {
                        const orderDate = new Date(order.timestamp);
                        const filterDate = new Date();
                        filterDate.setDate(filterDate.getDate() - (i + 2));
                        return (
                          orderDate.toLocaleDateString() ===
                          filterDate.toLocaleDateString()
                        );
                      })
                      .reduce((sum, order) => sum + order.totalAmount, 0)}
                  </option>
                ))}
              </select>
            </h2>

               {/* <div className="payment-totals">
                <div className="cash-box">
                  <h3>
                    Cash:
                    <span>₹{totalCash}</span>
                  </h3>
                </div>
                <div className="upi-box">
                  <h3>
                    Upi:
                    <span>₹{totalUpi}</span>
                  </h3>
                </div>
              </div> */}

          </div>

          {filteredOrders.length > 0 ? (
            [...filteredOrders].reverse().map((order, index) => (
              <div
                key={order.id}
                className="order-section"
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
              >
                <div
                  onClick={() => toggleOrder(order.id)}
                  className="order-lable"
                >
                  <h2>
                    Order {filteredOrders.length - index} -{" "}
                    <span>{formatDate(order.timestamp)}</span>
                  </h2>
                  <div>
     
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <strong>Amount Received: ₹{order.totalAmount}</strong>{" "}
                    {order.phone && (
                      <FaWhatsapp
                        className="whatsapp"
                        onClick={() => handleWhatsappClick(order)}
                      />
                    )}
                  </div>
                  {showRemoveBtn && (
                    <button
                      className="deletebtn"
                      onClick={() => handleRemoveOrder(order.id)}
                    >
                      <MdDelete />
                    </button>
                  )}
                </div>

                {expandedOrderId === order.id && ( // Render table only if this order is expanded
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((product, idx) => (
                        <tr key={idx}>
                          <td>
                            {product.size
                              ? `${product.name} (${product.size})`
                              : product.name}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {product.price}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {product.quantity}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {product.price * product.quantity}
                          </td>
                        </tr>
                      ))}

                      {/* DELIVERY ROW */}
                      {order.delivery > 0 && (
                        <tr>
                          <td>
                            <strong>Delivery Charge</strong>
                          </td>
                          <td></td>
                          <td></td>
                          <td style={{ textAlign: "right" }}>
                            <strong>+{order.delivery}</strong>
                          </td>
                        </tr>
                      )}

                      {/* DISCOUNT ROW */}
                      {order.discount > 0 && (
                        <tr>
                          <td>
                            <strong>Discount</strong>
                          </td>
                          <td></td>
                          <td></td>
                          <td style={{ textAlign: "right" }}>
                            <strong>-{order.discount}</strong>
                          </td>
                        </tr>
                      )}

    {(order.cashAmount || order.upiAmount) && (
                        <>
                          {order.cashAmount > 0 && (
                            <tr>
                              <td colSpan={2} style={{ textAlign: "right" }}>
                                <strong>Cash Paid:</strong>
                              </td>
                              <td colSpan={2}style={{ textAlign: "right" }}>
                                <strong>
                                  ₹{Number(order.cashAmount).toFixed(2)}
                                </strong>
                              </td>
                            </tr>
                          )}
                          {order.upiAmount > 0 && (
                            <tr>
                              <td colSpan={2} style={{ textAlign: "right" }}>
                                <strong>UPI Paid:</strong>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <strong>
                                  ₹{Number(order.upiAmount).toFixed(2)}
                                </strong>
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                      
                      {/* ICONS ROW */}
                      {/* <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>
                          <Rawbt3Inch
                            productsToSend={order.products}
                            customerPhone={order.phone}
                            customerName={order.name}
                            customerAddress={order.address}
                            deliveryChargeAmount={order.delivery}
                            parsedDiscount={order.discount}
                            timestamp={order.timestamp}
                            includeGST={order.includeGST}
                            icon={() => (
                              <FaPrint
                                size={32}
                                style={{
                                  color: "#1abc9c",
                                  transition: "transform 0.1s ease",
                                  textAlign: "center",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform =
                                    "scale(1.2)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = "scale(1)")
                                }
                              />
                            )}
                          />
                        </td>
                      </tr> */}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          ) : (
            <p>No orders found for {filter.toLowerCase()}.</p>
          )}
        </div>
      )}
      {/* Custom Modal */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content-history">
            <p className="custom-modal-message-history">{modalMessage}</p>
            <div className="custom-modal-actions">
              <button
                className="custom-modal-button confirm-button-history"
                onClick={() => setIsModalOpen(false)}
              >
                ok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
