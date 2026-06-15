import { useState, useEffect } from "react";
import { Plus, Minus, Pencil, Send, Trash2, ShoppingCart, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { db } from "../firebase/config";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";

// 🔥 YOUR LOCAL IP - Change this when you deploy!
const LOCAL_IP = "192.168.43.254";
const PORT = "5173";

// Use this for local testing:
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

// Use this for production:
// const BASE_URL = "https://your-app.vercel.app";

function OrdersTables() {

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // 🔥 NEW: Listen for payment status changes on current order
  useEffect(() => {
    if (!currentOrderId) return;

    const unsub = onSnapshot(doc(db, "orders", currentOrderId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        console.log("📡 Order status update:", data.status);

        // If order is paid/completed, clear the QR code
        if (data.status === "completed" || data.paymentStatus === "paid") {
          console.log("✅ Order paid! Clearing QR code...");
          setCurrentOrderId(null);
        }
      }
    });

    return () => unsub();
  }, [currentOrderId]);

  // Fetch categories and products from Firebase
  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubProd = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const updateQty = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const addToCart = (item) => {
    const qty = quantities[item.id] || 1;
    if (qty === 0) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.name === item.name);
      if (existing) {
        return prev.map((c) =>
          c.name === item.name ? { ...c, qty: c.qty + qty } : c
        );
      }
      return [...prev, { id: Date.now(), name: item.name, qty, price: item.price }];
    });
    setQuantities((prev) => ({ ...prev, [item.id]: 0 }))
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const saveEditItem = () => {
    if (!editingItem) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
            ...item,
            name: editingItem.name,
            price: parseFloat(editingItem.price) || 0,
            qty: parseInt(editingItem.qty) || 1,
          }
          : item
      )
    );
    setEditingItem(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Generate QR code URL (for customer phone)
  const getQRValue = () => {
    if (currentOrderId) {
      return `${BASE_URL}/pay?order=${currentOrderId}&table=01`;
    }
    return `${BASE_URL}/pay?table=01`;
  };

  // 🔥 NEW: Generate desktop payment modal URL (for staff to click)
  const getDesktopPayUrl = () => {
    if (currentOrderId) {
      return `/orders?order=${currentOrderId}&table=01&pay=true`;
    }
    return `/orders?table=01&pay=true`;
  };

  // 🔥 NEW: Navigate to desktop payment modal
  const handleDesktopPayClick = () => {
    // Open payment modal by navigating with query params
    // Your Orders.jsx useEffect will detect this and open PaymentModal
    window.location.href = `${window.location.origin}${getDesktopPayUrl()}`;
  };

  // Cart panel content (shared between desktop and mobile drawer)
  const CartContent = () => (
    <div className="bg-[#1d1d1d] rounded-2xl lg:rounded-none border border-white/5 lg:border-none flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base sm:text-lg font-semibold text-white">Table 01</h2>
          {currentOrderId && (
            <p className="text-[10px] text-[#F5C6CC]">Order #{currentOrderId.slice(-4)}</p>
          )}
          <button
            onClick={() => setShowCartDrawer(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button className="hidden lg:block text-gray-400 hover:text-white transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-400">Watson Joyce</p>
      </div>

      {/* Cart Items - Scrollable area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
        <div className="flex flex-col gap-2 sm:gap-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 text-xs py-4">
              No items in cart
            </div>
          ) : (
            <>
              {(showAll ? cart : cart.slice(0, 2)).map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center gap-2 bg-[#2a2a2a] rounded-xl p-2 sm:p-2.5 flex-shrink-0"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#F5C6CC]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#F5C6CC]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all"
                    >
                      <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </button>
                    <span className="text-[10px] sm:text-xs font-medium text-white w-4 sm:w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-[#F5C6CC]/20 flex items-center justify-center text-[#F5C6CC] hover:bg-[#F5C6CC]/30 transition-all"
                    >
                      <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </button>
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-white w-10 sm:w-12 text-right">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-gray-500 hover:text-[#F5C6CC] transition-colors"
                    >
                      <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length > 2 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-[10px] sm:text-xs text-[#F5C6CC] hover:text-[#7D5B67] text-center py-1.5 sm:py-2 font-medium transition-colors flex-shrink-0"
                >
                  {showAll ? "Show less" : `+${cart.length - 2} more items`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Totals - Fixed at bottom */}
      <div className="p-3 sm:p-4 border-t border-white/5 space-y-1 sm:space-y-1.5 flex-shrink-0">
        <div className="flex items-center justify-between text-[10px] sm:text-xs">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] sm:text-xs">
          <span className="text-gray-400">Tax 5%</span>
          <span className="text-white">${tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold pt-1 sm:pt-1.5 border-t border-white/5">
          <span className="text-white">Total</span>
          <span className="text-white">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* QR Code - Customer scans to pay on THEIR phone */}
      <div className="px-3 sm:p-4 pb-2 sm:pb-3 flex-shrink-0">
        <p className="text-[9px] sm:text-[10px] text-gray-500 mb-1 sm:mb-1.5 text-center">
          {currentOrderId ? "Scan to Pay" : "Send order to kitchen first"}
        </p>
        <div className="bg-dark rounded-xl p-2 sm:p-3 flex flex-col items-center">
          {currentOrderId ? (
            <>
              <QRCodeSVG
                value={getQRValue()}
                size={100}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
              <p className="text-[9px] sm:text-[10px] text-gray-700 mt-1.5 font-medium text-center">
                Scan with your phone camera
              </p>

              {/* 🔥 NEW: Clickable URL to desktop payment modal */}
              <button
                onClick={handleDesktopPayClick}
                className="mt-2 text-[8px] sm:text-[9px] text-[#F5C6CC] hover:text-[#7D5B67] hover:underline transition-all text-center break-all px-2 cursor-pointer bg-transparent border-none"
              >
                Or click here to pay on this device
              </button>
            </>
          ) : (
            <div className="w-[100px] h-[100px] bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center px-2">
                QR will appear after sending to kitchen
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Send Button - ALWAYS VISIBLE at bottom */}
      <div className="p-3 sm:p-4 pt-0 flex-shrink-0">
        <button
          onClick={async () => {
            if (cart.length === 0) {
              alert("Cart is empty!");
              return;
            }
            try {
              const orderData = {
                orderNumber: String(Math.floor(Math.random() * 9000) + 1000),
                tableNumber: "01",
                tableId: "table_1st_01",
                customerName: "Watson Joyce",
                customerPhone: "",
                customerEmail: "",
                status: "in-process",
                statusText: "In Kitchen",
                items: cart.map(item => ({
                  name: item.name,
                  qty: item.qty,
                  price: item.price,
                  productId: item.id
                })),
                subtotal: subtotal,
                tax: tax,
                tip: 0,
                total: total,
                paymentMethod: "cash",
                paymentStatus: "pending",
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };

              const docRef = await addDoc(collection(db, "orders"), orderData);
              setCurrentOrderId(docRef.id);

              // Create notification
              await addDoc(collection(db, "notifications"), {
                title: "New Order",
                message: `Order #${orderData.orderNumber} for Table 01 — $${total.toFixed(2)}`,
                type: "order",
                read: false,
                createdAt: serverTimestamp(),
              });

              alert("Order sent to kitchen! QR code is ready for customer.");
              setCart([]);
            } catch (error) {
              console.error("Error creating order:", error);
              alert("Failed to send order");
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-xs sm:text-sm font-medium hover:bg-[#F5C6CC]/80 transition-all"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Send To Kitchen
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6 overflow-y-auto">
        {/* Header with cart button on mobile */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">

          </div>

          {/* Mobile cart button */}
          <button
            onClick={() => setShowCartDrawer(true)}
            className="lg:hidden relative w-10 h-10 rounded-xl bg-[#F5C6CC]/20 flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5 text-[#F5C6CC]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F5C6CC] text-[#7D5B67] text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Categories - 2 cols mobile, 3 tablet, 4 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">No categories found</div>
          ) : categories.map((category) => (
            <div
              key={category.id}
              className="bg-[#1e1e1e] rounded-2xl p-3 sm:p-4 border border-white/5 hover:border-[#F5C6CC]/30 transition-all cursor-pointer group"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-white mb-0.5 sm:mb-1">
                {category.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {category.itemCount} items
              </p>
            </div>
          ))}
        </div>

        {/* Menu Items - 2 cols mobile, 3 tablet, 4 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">Loading menu...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">No items found</div>
          ) : products.filter(p => p.status === "active").map((item) => (
            <div
              key={item.id}
              className="bg-[#1e1e1e] rounded-2xl p-3 sm:p-4 border border-white/5"
            >
              <span className="text-[9px] sm:text-[10px] text-gray-500 mb-1 sm:mb-2 block">
                {item.status}
              </span>
              <div className="w-full aspect-square rounded-xl bg-[#2a2a2a] flex items-center justify-center mb-2 sm:mb-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-2xl sm:text-4xl">🍽️</span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-white mb-0.5 sm:mb-1 truncate">
                {item.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#F5C6CC] font-semibold mb-2 sm:mb-3">
                ${item.price.toFixed(2)}
              </p>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <button
                  onClick={() => updateQty(item.id, -1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs sm:text-sm font-medium text-white w-6 sm:w-8 text-center">
                  {String(quantities[item.id] || 0).padStart(2, "0")}
                </span>
                <button
                  onClick={() => updateQty(item.id, 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F5C6CC]/20 flex items-center justify-center text-[#F5C6CC] hover:bg-[#F5C6CC]/30 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => addToCart(item)}
                className="w-full py-1.5 sm:py-2 bg-[#F5C6CC]/20 text-[#F5C6CC] rounded-lg text-[10px] sm:text-xs font-medium hover:bg-[#F5C6CC]/30 transition-all"
              >
                Add to Order
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP: Right Panel - Fixed width, always visible */}
      <div className="hidden lg:block w-[340px] flex-shrink-0 p-6 pl-0 overflow-hidden">
        <CartContent />
      </div>

      {/* MOBILE: Cart Bottom Sheet - slides up like payment modal */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCartDrawer(false)}
          />
          {/* Drawer - Full height with proper scroll */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-3xl h-[90vh] flex flex-col animate-slide-up">
            {/* Drag handle */}
            <div className="flex items-center justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>
            {/* Cart content - takes full height */}
            <div className="flex-1 overflow-hidden">
              <CartContent />
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1e1e1e] rounded-3xl p-6 sm:p-8 w-full max-w-[380px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-white">Edit Item</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-white"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Item Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C6CC]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Price ($)</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C6CC]/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={editingItem.qty}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, qty: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C6CC]/50"
                  />
                </div>
              </div>
              <button
                onClick={saveEditItem}
                className="w-full py-3 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-sm font-medium hover:bg-[#F5C6CC]/80 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersTables;