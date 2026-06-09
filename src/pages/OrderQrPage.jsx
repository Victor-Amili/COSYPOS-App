import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CreditCard, Wallet, Banknote, QrCode } from "lucide-react";

function TableOrder() {
  const { tableId } = useParams();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paid, setPaid] = useState(false);

  // Demo order data (in real app, fetch from backend by tableId)
  const order = {
    tableNumber: tableId || "01",
    customerName: "Guest",
    orderNumber: "980",
    items: [
      { qty: 2, name: "Chicken Parmesan", price: 55.0 },
      { qty: 1, name: "Roasted Chicken", price: 35.0 },
      { qty: 3, name: "Classic Lemonade", price: 12.0 },
    ],
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const qrValue =
    typeof window !== "undefined"
      ? window.location.href
      : `http://localhost:5173/table/${tableId || "01"}`;

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: Banknote },
    { id: "debit", label: "Card", icon: CreditCard },
    { id: "ewallet", label: "E-Wallet", icon: Wallet },
  ];

  const handlePay = () => {
    setPaid(true);
    setTimeout(() => setPaid(false), 4000);
  };

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-sm text-gray-400 mb-1">Thank you for dining with us</p>
        <p className="text-xs text-gray-500">Table {order.tableNumber} • Order #{order.orderNumber}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      {/* Table Info */}
      <div className="text-center mb-6">
        <p className="text-xs text-gray-500 mb-1">COSYPOS Restaurant</p>
        <h2 className="text-2xl font-bold text-white">Table {order.tableNumber}</h2>
        <p className="text-sm text-gray-400">Order # {order.orderNumber}</p>
      </div>

      {/* Order Items */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Your Order</h3>
        <div className="space-y-2 mb-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{item.qty}x</span>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <span className="text-white font-medium">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tax 5%</span>
            <span className="text-white">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1.5 border-t border-white/10">
            <span className="text-white">Total</span>
            <span className="text-pink-400">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl p-5 flex flex-col items-center mb-4">
        <QrCode className="w-40 h-40 text-black mb-3" />
        <p className="text-sm text-gray-700 font-medium mb-1">Scan QR Code to Pay</p>
        <p className="text-[10px] text-gray-400 text-center break-all">{qrValue}</p>
      </div>

      {/* Payment Methods */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Select Payment Method</p>
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  paymentMethod === method.id
                    ? "bg-pink-400/20 border-pink-400/50 text-pink-300"
                    : "bg-[#1e1e1e] border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePay}
        className="w-full py-3.5 bg-pink-400 text-white rounded-xl text-sm font-bold hover:bg-pink-500 transition-all active:scale-95"
      >
        Pay ${total.toFixed(2)}
      </button>

      <p className="text-center text-[10px] text-gray-600 mt-4">
        Secure payment powered by COSYPOS
      </p>
    </div>
  );
}

export default TableOrder;