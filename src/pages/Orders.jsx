import { useState } from "react";
import { Plus, Search, Pencil, Trash2, CreditCard } from "lucide-react";
import { dummyOrders, getStatusBadgeStyle, getStatusDot } from "../data/dummyData";

function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const tabs = [
    { id: "all", label: "All" },
    { id: "in-process", label: "In Process" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredOrders = dummyOrders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const handlePayBill = (order) => {
    setSelectedOrder(order);
    setShowPinModal(true);
  };

  const handlePinConfirm = () => {
    setShowPinModal(false);
    setShowPaymentModal(true);
  };

  return (
    <div className="p-6">
      {/* Tabs and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-pink-400 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-all">
            <Plus className="w-4 h-4" />
            Add New Order
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search a name, order etc"
              className="w-[280px] pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/50"
            />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-[#1e1e1e] rounded-2xl p-5 border border-white/5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-400/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-pink-400">{order.tableNumber}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{order.customerName}</h3>
                  <p className="text-xs text-gray-500">Order # {order.orderNumber}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusBadgeStyle(order.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
                {order.statusText}
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
              <span>{order.date}</span>
              <span>{order.time}</span>
            </div>

            {/* Items Table */}
            <div className="mb-4">
              <div className="grid grid-cols-[30px_1fr_50px] gap-2 text-xs text-gray-500 mb-2">
                <span>Qty</span>
                <span>Items</span>
                <span className="text-right">Price</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[30px_1fr_50px] gap-2 text-xs py-1.5 border-t border-white/5">
                  <span className="text-gray-400">{String(item.qty).padStart(2, "0")}</span>
                  <span className="text-gray-300">{item.name}</span>
                  <span className="text-gray-400 text-right">${item.price}</span>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between py-3 border-t border-white/10 mb-4">
              <span className="text-xs text-gray-500">SubTotal</span>
              <span className="text-sm font-semibold text-white">${order.subtotal}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-all">
                <Pencil className="w-4 h-4" />
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/5 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePayBill(order)}
                className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 bg-pink-400/20 text-pink-300 rounded-xl text-sm font-medium hover:bg-pink-400/30 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Pay Bill
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-[#1e1e1e] rounded-3xl p-8 w-[380px]">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-white mb-6">Enter your PIN</h3>
              <PinInput onConfirm={handlePinConfirm} onClose={() => setShowPinModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <PaymentModal order={selectedOrder} onClose={() => setShowPaymentModal(false)} />
      )}
    </div>
  );
}

// PIN Input Component
function PinInput({ onConfirm, onClose }) {
  const [pin, setPin] = useState("");
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const handleNumber = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => onConfirm(newPin), 300);
      }
    }
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <>
      <div className="flex items-center justify-center gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < pin.length ? "bg-white" : "bg-white/20"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((num) => (
          <button key={num} onClick={() => handleNumber(num)}
            className="aspect-square rounded-2xl bg-[#2a2a2a] text-white text-xl font-medium hover:bg-[#3a3a3a] transition-all active:scale-95">
            {num}
          </button>
        ))}
        <div />
        <button onClick={handleDelete}
          className="aspect-square rounded-2xl bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-all active:scale-95 flex items-center justify-center">
          <span className="text-lg">⌫</span>
        </button>
      </div>
    </>
  );
}

// Payment Modal Component
function PaymentModal({ order, onClose }) {
  const [tip, setTip] = useState("2.00");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const subtotal = order.subtotal || 649;
  const tax = subtotal * 0.05;
  const tipAmount = parseFloat(tip) || 0;
  const total = subtotal + tax + tipAmount;

  const handleNumber = (num) => setTip(tip === "0" ? num : tip + num);
  const handleDelete = () => setTip(tip.slice(0, -1) || "0");

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: "💵" },
    { id: "debit", label: "Debit Card", icon: "💳" },
    { id: "ewallet", label: "E-Wallet", icon: "📱" },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
      <div className="flex gap-6">
        {/* Order Summary */}
        <div className="bg-[#1e1e1e] rounded-3xl p-6 w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Table {order.tableNumber}</h3>
              <p className="text-sm text-gray-400">{order.customerName}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
              ✕
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-[#2a2a2a] rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-400/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-pink-400">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500">x {item.qty}</p>
                </div>
                <span className="text-xs text-white">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Tax 5%</span><span className="text-white">${tax.toFixed(1)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Tip</span><span className="text-white">${tipAmount.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t border-white/10 font-semibold"><span className="text-white">Total</span><span className="text-white">${total.toFixed(1)}</span></div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    paymentMethod === method.id
                      ? "bg-pink-400/20 border-pink-400/50 text-pink-300"
                      : "bg-[#2a2a2a] border-white/5 text-gray-400 hover:border-white/10"
                  }`}>
                  <span className="text-lg">{method.icon}</span>
                  <span className="text-[10px]">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="w-full py-3 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-all">
            Order Completed
          </button>
        </div>

        {/* Tips Keypad */}
        <div className="bg-[#1e1e1e] rounded-3xl p-8 w-[320px]">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tips Amount</h3>
            <p className="text-3xl font-bold text-white">{tip}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {numbers.map((num) => (
              <button key={num} onClick={() => handleNumber(num)}
                className="aspect-square rounded-2xl bg-[#2a2a2a] text-white text-xl font-medium hover:bg-[#3a3a3a] transition-all active:scale-95">
                {num}
              </button>
            ))}
            <div />
            <button onClick={handleDelete}
              className="aspect-square rounded-2xl bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-all active:scale-95 flex items-center justify-center">
              <span className="text-lg">⌫</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex-1 py-3 bg-white/5 text-gray-400 rounded-xl text-sm hover:bg-white/10 transition-all">Print Receipt</button>
            <button className="flex-1 py-3 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-all">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;