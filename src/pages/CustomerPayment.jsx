import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

function CustomerPayment() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);
  const [tip, setTip] = useState(0);
  const [processing, setProcessing] = useState(false);

  const orderId = searchParams.get("order");
  const tableNum = searchParams.get("table");

  // Debug: log what we received
  useEffect(() => {
    console.log("📱 CustomerPayment loaded");
    console.log("   orderId:", orderId);
    console.log("   tableNum:", tableNum);
    console.log("   Full URL:", window.location.href);
  }, [orderId, tableNum]);

  // Fetch order from Firebase
  useEffect(() => {
    if (!orderId && !tableNum) {
      setError("No order or table specified in URL");
      setLoading(false);
      return;
    }

    // Try fetching with getDocs first (more reliable than onSnapshot for one-time load)
    const fetchOrder = async () => {
      try {
        let q;

        if (orderId) {
          // Fetch by order ID
          console.log("🔍 Fetching order by ID:", orderId);
          q = query(collection(db, "orders"), where("__name__", "==", orderId));
        } else if (tableNum) {
          // Fetch by table number - get most recent active order
          console.log("🔍 Fetching order by table:", tableNum);
          q = query(
            collection(db, "orders"),
            where("tableNumber", "==", tableNum),
            where("status", "in", ["in-process", "ready"])
          );
        }

        const snapshot = await getDocs(q);
        console.log("📊 Found docs:", snapshot.size);

        if (snapshot.empty) {
          setError("No active order found for this table.");
          setLoading(false);
          return;
        }

        // Get the first (most recent) order
        const doc = snapshot.docs[0];
        const orderData = { id: doc.id, ...doc.data() };
        console.log("✅ Order found:", orderData.orderNumber);

        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching order:", err);
        setError(`Failed to load order: ${err.message}`);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, tableNum]);

  const subtotal = order?.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0;
  const tax = subtotal * 0.05;
  const total = subtotal + tax + tip;

  const handlePay = async (method) => {
    if (!order || processing) return;
    setProcessing(true);

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: "completed",
        statusText: "Paid",
        paymentStatus: "paid",
        paymentMethod: method,
        tip: tip,
        total: total,
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        title: "Payment Received",
        message: `Table ${order.tableNumber} paid $${total.toFixed(2)} via ${method}`,
        type: "order",
        read: false,
        createdAt: serverTimestamp(),
      });

      setPaid(true);
    } catch (err) {
      console.error("Payment failed:", err);
      setError(`Payment failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F5C6CC]/20 border-t-[#F5C6CC] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading your order...</p>
          <p className="text-gray-600 text-xs mt-2">Order: {orderId || "N/A"}</p>
          <p className="text-gray-600 text-xs">Table: {tableNum || "N/A"}</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Something Went Wrong</h1>
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <div className="bg-[#1a1a1a] rounded-xl p-4 text-left text-xs text-gray-500">
          <p>Debug Info:</p>
          <p>Order ID: {orderId || "none"}</p>
          <p>Table: {tableNum || "none"}</p>
          <p>URL: {window.location.href}</p>
        </div>
      </div>
    );
  }

  // Success screen
  if (paid) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-bounce">
          <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
        <p className="text-gray-400 mb-1">Payment successful</p>
        <p className="text-gray-500 text-sm mb-6">Table {order?.tableNumber} • Order #{order?.orderNumber}</p>
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
          <p className="text-gray-400 text-sm mb-1">Amount Paid</p>
          <p className="text-4xl font-bold text-[#F5C6CC]">${total.toFixed(2)}</p>
        </div>
        <p className="text-gray-600 text-xs mt-8">You can close this page</p>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Order Not Found</h1>
        <p className="text-gray-400 text-sm">This order may have been paid or cancelled.</p>
        <p className="text-gray-600 text-xs mt-4">Table: {tableNum || "N/A"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4 border-b border-white/5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-[#F5C6CC]">COSYPOS</h1>
        <p className="text-gray-400 text-sm">Table {order.tableNumber} • Order #{order.orderNumber}</p>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
        {/* Order Items */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Your Order</h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5C6CC]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#F5C6CC]">{item.qty}x</span>
                  </div>
                  <span className="text-gray-300 text-sm">{item.name}</span>
                </div>
                <span className="text-white text-sm font-medium">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-3 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-300">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (5%)</span>
              <span className="text-gray-300">${tax.toFixed(2)}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tip</span>
                <span className="text-[#F5C6CC]">${tip.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tip Selection */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Add a Tip</h2>
          <div className="grid grid-cols-4 gap-2">
            {[0, 2, 5, 10].map((amount) => (
              <button
                key={amount}
                onClick={() => setTip(amount)}
                disabled={processing}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  tip === amount
                    ? "bg-[#F5C6CC] text-[#7D5B67]"
                    : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]"
                } disabled:opacity-50`}
              >
                {amount === 0 ? "No Tip" : `$${amount}`}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-white">Total</span>
            <span className="text-3xl font-bold text-[#F5C6CC]">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400">Pay With</h2>

          <button
            onClick={() => handlePay("card")}
            disabled={processing}
            className="w-full flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-2xl border border-white/5 hover:border-[#F5C6CC]/30 transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F5C6CC]/20 flex items-center justify-center text-2xl">
              💳
            </div>
            <div className="text-left flex-1">
              <p className="text-white font-medium">Card Payment</p>
              <p className="text-gray-500 text-xs">Apple Pay, Google Pay, Card</p>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => handlePay("cash")}
            disabled={processing}
            className="w-full flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-2xl border border-white/5 hover:border-[#F5C6CC]/30 transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F5C6CC]/20 flex items-center justify-center text-2xl">
              💵
            </div>
            <div className="text-left flex-1">
              <p className="text-white font-medium">Pay at Counter</p>
              <p className="text-gray-500 text-xs">Show this screen to cashier</p>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Processing overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#F5C6CC]/20 border-t-[#F5C6CC] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium">Processing payment...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerPayment;