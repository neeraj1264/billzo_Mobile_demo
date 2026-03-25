import React from "react";

export default function WhatsAppButton({
  productsToSend,
  deliveryChargeAmount,
  deliveryCharge,
  parsedDiscount,
  customerPhone,
  customerName,
  customerAddress,
  includeGST = true,
}) {
  // Helper to calculate total price of items
  const calculateTotalPrice = (items = []) =>
    items.reduce((sum, p) => sum + p.price * (p.quantity || 1), 0);

    const itemTotal = calculateTotalPrice(productsToSend);
    const gstAmount = includeGST ? +(itemTotal * 0.05).toFixed(2) : 0;

  const handleSendToWhatsApp = () => {
    // Compute current total
    const currentTotal =
      calculateTotalPrice(productsToSend) + (includeGST ? gstAmount : 0) +
      deliveryChargeAmount -
      parsedDiscount;

    // Map product details
    const productDetails = productsToSend
      .map((product, i) => {
        const qty = product.quantity || 1;
        const sizeLabel = product.size ? ` ${product.size}` : "";
        return `${i+1}. ${qty} x ${product.name}${sizeLabel} = ₹${
          product.price * qty
        }`;
      })
      .join("\n");

    // Optional charges
    const serviceText = deliveryCharge
      ? `Service Charge: +${deliveryChargeAmount}`
      : "";
    const discountText = parsedDiscount
      ? `Discount: -₹${parsedDiscount}`
      : "";

    // Order ID
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Construct message
    let message = encodeURIComponent(
      `*🍔🍕 Foodies Hub 🍕🍔*\n\n` +
        `Order: *${orderId}*` +
        (customerName ? `\nName: *${customerName}*` : "") +
        (customerPhone ? `\nPhone: *${customerPhone}*` : "") +
        (customerAddress ? `\nAddress: *${customerAddress}*` : "") +
        `\nAmount: *₹${currentTotal}*` +
        `\n\n----------item----------\n${productDetails}\n` +
        (serviceText ? `\n${serviceText}` : "") +
        (discountText ? `\n${discountText}` : "")
    );
  if (includeGST) {
    message += `\n\nGST (5%): ₹${gstAmount}`;   // ← only if includeGST
  }
    // Format number for WhatsApp
    const formattedPhone = `${customerPhone}`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    window.open(waUrl, "_blank");
  };

  return (
    <button onClick={handleSendToWhatsApp} className="popupButton">
      Send to WhatsApp
    </button>
  );
}
