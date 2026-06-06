import { useState } from "react";
import { Plus, Minus, Pencil, Send } from "lucide-react";
import QRCode from "react-qr-code";
import { dummyMenuCategories, dummyMenuItems } from "../datas/dummyData";

function OrdersTables() {
  const [quantities, setQuantities] = useState({});

  const updateQty = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const qrValue = `${window.location.origin}/table/01`;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Category Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {dummyMenuCategories.map((category) => (
            <div key={category.id} className="bg-[#1e1e1e] rounded-2xl p-4 border border-white/5 hover:border-pink-400/30 transition-all cursor-pointer group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
              <h3 className="text-sm font-medium text-white mb-1">{category.name}</h3>
              <p className="text-xs text-gray-500">{category.items} items</p>
            </div>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-4 gap-4">
          {dummyMenuItems.map((item) => (
            <div key={item.id} className="bg-[#1e1e1e] rounded-2xl p-4 border border-white/5">
              <span className="text-[10px] text-gray-500 mb-2 block">{item.status}</span>
              <div className="w-full aspect-square rounded-xl bg-[#2a2a2a] flex items-center justify-center mb-3">
                <span className="text-4xl">{item.image}</span>
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{item.name}</h3>
              <p className="text-sm text-pink-400 font-semibold mb-3">${item.price.toFixed(2)}</p>
              <div className="flex items-center justify-between">
                <button onClick={() => updateQty(item.id, -1)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-medium text-white w-8 text-center">
                  {String(quantities[item.id] || 0).padStart(2, "0")}
                </span>
                <button onClick={() => updateQty(item.id, 1)}
                  className="w-8 h-8 rounded-lg bg-pink-400/20 flex items-center justify-center text-pink-400 hover:bg-pink-400/30 transition-all">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Order Summary */}
      <div className="w-[340px] flex-shrink-0 p-6 pl-0">
        <div className="w-[320px] bg-[#1e1e1e] rounded-2xl border border-white/5 flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-white">Table 01</h2>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-400">Watson Joyce</p>
          </div>

          {/* Order Items */}
          <div className="flex-1 p-5 space-y-3 overflow-y-auto">
            {[
              { id: 1, name: "Chicken Parmesan", qty: 2, price: 55.0 },
              { id: 2, name: "Chicken Parmesan", qty: 2, price: 55.0 },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-[#2a2a2a] rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-pink-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-pink-400">{String(item.id).padStart(2, "0")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">x {item.qty}</p>
                </div>
                <span className="text-sm font-medium text-white">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="p-5 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">$110.00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Tax 5%</span>
              <span className="text-white">$5.5</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-white/5">
              <span className="text-white">Total</span>
              <span className="text-white">$117.5</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="px-5 pb-4">
            <p className="text-xs text-gray-500 mb-2">Payment Method</p>
            <div className="bg-white rounded-xl p-3 flex flex-col items-center">
              <QRCode value={qrValue} size={80} level="H" />
              <p className="text-[10px] text-gray-400 mt-1">Scan QR Code</p>
            </div>
          </div>

          {/* Send Button */}
          <div className="p-5 pt-0">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-all">
              <Send className="w-4 h-4" />
              Send To Kitchen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdersTables;