import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, CreditCard, X, Printer, LayoutGrid } from "lucide-react";
import { getStatusBadgeStyle, getStatusDot } from "../datas/dummyData";
import { db } from "../firebase/config";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";


function Orders() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showPinModal, setShowPinModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);


    // Fetch orders from Firebase (real-time)
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "orders"), (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Sort by createdAt newest first
            data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setOrders(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);
    // Auto-open payment modal from QR code scan
    // In Orders.jsx — replace your existing QR useEffect with this:

    useEffect(() => {
        const tableFromQR = searchParams.get("table");
        const orderFromQR = searchParams.get("order");
        const shouldPay = searchParams.get("pay") === "true";

        console.log("📱 QR Scan detected:", { tableFromQR, orderFromQR, shouldPay });

        if (shouldPay && !showPaymentModal) {
            // Find the order — either by order ID or by table number
            let order = null;

            if (orderFromQR) {
                // Direct order link
                order = orders.find((o) => o.id === orderFromQR);
            } else if (tableFromQR) {
                // Table link — find the most recent active order for this table
                order = orders.find(
                    (o) =>
                        o.tableNumber === tableFromQR &&
                        (o.status === "in-process" || o.status === "ready")
                );
            }

            if (order) {
                console.log("✅ Found order for payment:", order.orderNumber);
                setSelectedOrder(order);
                setShowPaymentModal(true);
                // Clear URL so refresh doesn't reopen
                setSearchParams({}, { replace: true });
            } else {
                console.log("❌ No order found for this table/order");
                // Optional: Show a message that order is not ready
            }
        }
    }, [searchParams, orders, showPaymentModal, setSearchParams]);

    const tabs = [
        { id: "all", label: "All" },
        { id: "in-process", label: "In Process" },
        { id: "completed", label: "Completed" },
        { id: "cancelled", label: "Cancelled" },
    ];

    const filteredOrders = orders.filter((order) => {
        if (activeTab !== "all" && order.status !== activeTab) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            order.customerName.toLowerCase().includes(q) ||
            order.orderNumber.includes(q) ||
            order.tableNumber.includes(q)
        );
    });

    const handlePayBill = (order) => {
        setSelectedOrder(order);
        setShowPinModal(true);
    };

    const handlePinConfirm = () => {
        setShowPinModal(false);
        setShowPaymentModal(true);
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Delete this order?")) return;
        try {
            await deleteDoc(doc(db, "orders", orderId));
            // No need to update state - onSnapshot handles it
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete order");
        }
    };

    const handleAddOrder = async (newOrder) => {
        try {
            // Add to Firebase - onSnapshot will update state
            await addDoc(collection(db, "orders"), {
                ...newOrder,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            setShowAddModal(false);
        } catch (error) {
            console.error("Add error:", error);
            alert("Failed to create order");
        }
        // Create notification for new order
        await addDoc(collection(db, "notifications"), {
            title: "New Order",
            message: `Order #${newOrder.orderNumber} for Table ${newOrder.tableNumber} — $${newOrder.total.toFixed(2)}`,
            type: "order",
            read: false,
            createdAt: serverTimestamp(),
        });
    };
    const handleEditOrder = async (updatedOrder) => {
        try {
            const { id, ...data } = updatedOrder;
            await updateDoc(doc(db, "orders", id), {
                ...data,
                updatedAt: serverTimestamp(),
            });
            setShowEditModal(false);
            setSelectedOrder(null);
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update order");
        }
    };

    return (
        <div className="p-4 sm:p-6">
            {/* DESKTOP: Tabs left, Actions right | MOBILE: Stacked */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id
                                ? "bg-[#F5C6CC] text-[#7D5B67]"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => navigate("/orders-tables")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-all whitespace-nowrap"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden sm:inline">Table View</span>
                        <span className="sm:hidden">Table</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-sm font-medium hover:bg-[#F5C6CC]/80 transition-all whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add New Order</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search a name, order etc"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[280px] pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile search bar */}
            <div className="sm:hidden mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search a name, order etc"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e1e] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                    />
                </div>
            </div>



            {/* Orders Grid */}
            <div div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {loading ? (

                    <div className="col-span-full text-center py-12 text-gray-500 text-sm">
                        Loading orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 text-sm">
                        No orders found
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-[#1e1e1e] rounded-2xl p-4 sm:p-5 border border-white/5"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#F5C6CC]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-[#F5C6CC]">
                                            {order.tableNumber}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-white truncate">
                                            {order.customerName}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Order # {order.orderNumber}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusBadgeStyle(
                                        order.status
                                    )}`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                                            order.status
                                        )}`}
                                    />
                                    {order.statusText}
                                </div>
                            </div>

                            {/* Date/Time */}
                            <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                                <span>{order.date}</span>
                                <span>{order.time}</span>
                            </div>

                            {/* Items */}
                            <div className="mb-4">
                                <div className="grid grid-cols-[30px_1fr_50px] gap-2 text-xs text-gray-500 mb-2">
                                    <span>Qty</span>
                                    <span>Items</span>
                                    <span className="text-right">Price</span>
                                </div>
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-[30px_1fr_50px] gap-2 text-xs py-1.5 border-t border-white/5"
                                    >
                                        <span className="text-gray-400">
                                            {String(item.qty).padStart(2, "0")}
                                        </span>
                                        <span className="text-gray-300 truncate">{item.name}</span>
                                        <span className="text-gray-400 text-right">${item.price}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Subtotal */}
                            <div className="flex items-center justify-between py-3 border-t border-white/10 mb-4">
                                <span className="text-xs text-gray-500">SubTotal</span>
                                <span className="text-sm font-semibold text-white">
                                    ${order.subtotal}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setShowEditModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-all"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/5 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePayBill(order)}
                                    className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 bg-[#F5C6CC]/20 text-[#F5C6CC] rounded-xl text-sm font-medium hover:bg-[#F5C6CC]/30 transition-all"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Pay Bill
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* MODALS */}
            {
                showAddModal && (
                    <AddOrderModal onClose={() => setShowAddModal(false)} onAdd={handleAddOrder} />
                )
            }
            {
                showEditModal && selectedOrder && (
                    <EditOrderModal order={selectedOrder} onClose={() => setShowEditModal(false)} onSave={handleEditOrder} />
                )
            }

            {/* PIN MODAL */}
            {
                showPinModal && (
                    <div className="fixed inset-0 bg-black/70 flex justify-end z-[100]">
                        <div
                            className="bg-[#1e1e1e] h-full w-full sm:w-[400px] p-6 sm:p-8 flex flex-col justify-center"
                            style={{
                                borderTopLeftRadius: "12px",
                                borderBottomLeftRadius: "12px",
                            }}
                        >
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white mb-2">Enter your PIN</h3>
                                <p className="text-xs text-gray-400 mb-6">Please enter your 4-digit PIN</p>
                                <PinInput onConfirm={handlePinConfirm} onClose={() => setShowPinModal(false)} />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* PAYMENT MODAL */}
            {
                showPaymentModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/70 flex justify-end z-[100]">
                        <div
                            className="bg-[#1e1e1e] h-full w-full sm:w-[700px] flex flex-col sm:flex-row overflow-hidden"
                            style={{
                                borderTopLeftRadius: "12px",
                                borderBottomLeftRadius: "12px",
                            }}
                        >
                            <PaymentModal order={selectedOrder} onClose={() => setShowPaymentModal(false)} />
                        </div>
                    </div>
                )
            }
        </div >
    );
}

// ... keep your existing AddOrderModal, EditOrderModal, PinInput, PaymentModal components ...
function AddOrderModal({ onClose, onAdd }) {
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [items, setItems] = useState([{ name: "", price: "", qty: "1" }]);

    const addItemField = () => {
        setItems([...items, { name: "", price: "", qty: "1" }]);
    };

    const removeItemField = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validItems = items
            .filter((item) => item.name.trim() !== "" && item.price !== "")
            .map((item) => ({
                qty: parseInt(item.qty) || 1,
                name: item.name,
                price: parseFloat(item.price) || 0,
            }));

        const subtotal = validItems.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
        );

        const newOrder = {
            orderNumber: String(Math.floor(Math.random() * 900) + 100),
            customerName: customerName || "Guest",
            tableNumber: tableNumber || "01",
            status: "in-process",
            statusText: "Cooking Now",
            date: new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                year: "numeric",
            }),
            time: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            }),
            items:
                validItems.length > 0
                    ? validItems
                    : [{ qty: 1, name: "No items", price: 0 }],
            subtotal: subtotal,
            tax: subtotal * 0.05,
            total: subtotal * 1.05,
        };
        onAdd(newOrder);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
            <div className="bg-[#1e1e1e] rounded-3xl p-8 w-[480px] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Add New Order</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                            Customer Name
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                            Table Number
                        </label>
                        <input
                            type="text"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="e.g. 07"
                            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-400">Items</label>
                            <button
                                type="button"
                                onClick={addItemField}
                                className="text-xs text-[#F5C6CC] hover:text-[#7D5B67] flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[1fr_80px_60px_30px] gap-2 items-end"
                                >
                                    <div>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, "name", e.target.value)}
                                            placeholder="Item name"
                                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) =>
                                                updateItem(index, "price", e.target.value)
                                            }
                                            placeholder="Price"
                                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => updateItem(index, "qty", e.target.value)}
                                            placeholder="Qty"
                                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItemField(index)}
                                        className="pb-2 text-gray-500 hover:text-red-400 transition-colors"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-sm font-medium hover:bg-[#F5C6CC]/80 transition-all mt-2"
                    >
                        Create Order
                    </button>
                </form>
            </div>
        </div>
    );
}

function EditOrderModal({ order, onClose, onSave }) {
    const [customerName, setCustomerName] = useState(order.customerName);
    const [tableNumber, setTableNumber] = useState(order.tableNumber);
    const [items, setItems] = useState(
        order.items.map((item) => ({
            ...item,
            price: String(item.price),
            qty: String(item.qty),
        }))
    );
    const [status, setStatus] = useState(order.status);

    const addItemField = () => {
        setItems([...items, { name: "", price: "", qty: "1" }]);
    };

    const removeItemField = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validItems = items
            .filter((item) => item.name.trim() !== "" && item.price !== "")
            .map((item) => ({
                qty: parseInt(item.qty) || 1,
                name: item.name,
                price: parseFloat(item.price) || 0,
            }));

        const subtotal = validItems.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
        );

        const statusTextMap = {
            ready: "Ready to serve",
            "in-process": "Cooking Now",
            completed: "Completed",
            cancelled: "Cancelled",
        };

        const updatedOrder = {
            ...order,
            customerName: customerName || "Guest",
            tableNumber: tableNumber || "01",
            status: status,
            statusText: statusTextMap[status] || "Cooking Now",
            items: validItems,
            subtotal: subtotal,
            tax: subtotal * 0.05,
            total: subtotal * 1.05,
        };
        onSave(updatedOrder);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
            <div className="bg-[#1e1e1e] rounded-3xl p-8 w-[480px] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                        Edit Order #{order.orderNumber}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                            Customer Name
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                            Table Number
                        </label>
                        <input
                            type="text"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C6CC]/50"
                        >
                            <option value="in-process">In Process</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-400">Items</label>
                            <button
                                type="button"
                                onClick={addItemField}
                                className="text-xs text-[#F5C6CC] hover:text-[#7D5B67] flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[1fr_80px_60px_30px] gap-2 items-end"
                                >
                                    <div>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, "name", e.target.value)}
                                            placeholder="Item name"
                                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) =>
                                                updateItem(index, "price", e.target.value)
                                            }
                                            placeholder="Price"
                                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => updateItem(index, "qty", e.target.value)}
                                            placeholder="Qty"
                                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C6CC]/50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItemField(index)}
                                        className="pb-2 text-gray-500 hover:text-red-400 transition-colors"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-sm font-medium hover:bg-[#F5C6CC]/80 transition-all mt-2"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}

function PinInput({ onConfirm, onClose }) {
    const [pin, setPin] = useState("");
    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9",];

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

    const handleClear = () => setPin("");

    return (
        <>
            <div className="flex items-center justify-center gap-3 mb-8">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all ${i < pin.length ? "bg-white" : "bg-white/20"
                            }`}
                    />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
                {numbers.map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumber(num)}
                        className="aspect-square rounded-2xl bg-[#2a2a2a] text-white text-xl font-medium hover:bg-[#3a3a3a] transition-all active:scale-95"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleClear}
                    className="aspect-square rounded-2xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all active:scale-95 flex items-center justify-center text-sm font-medium"
                >
                    CLEAR
                </button>
                <button
                    onClick={handleNumber.bind(null, "0")}
                    className="aspect-square rounded-2xl bg-[#2a2a2a] text-white text-xl font-medium  hover:bg-[#3a3a3a] transition-all active:scale-95 flex items-center justify-center"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    className="aspect-square rounded-2xl bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-all active:scale-95 flex items-center justify-center"
                >
                    <span className="text-lg">&#x232B;</span>
                </button>
            </div>
            <button
                onClick={onClose}
                className="w-full py-3 bg-white/5 text-gray-400 rounded-xl text-sm hover:bg-white/10 transition-all"
            >
                Cancel
            </button>
        </>
    );
}

// replace the PaymentModal component

function PaymentModal({ order, onClose }) {
    const [tip, setTip] = useState("2.00");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [showKeypad, setShowKeypad] = useState(false);
    const [paid, setPaid] = useState(false);
    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    const subtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );
    const tax = subtotal * 0.05;
    const tipAmount = parseFloat(tip) || 0;
    const total = subtotal + tax + tipAmount;

    const handleNumber = (num) => setTip(tip === "0" ? num : tip + num);
    const handleDelete = () => setTip(tip.slice(0, -1) || "0");
    const handleClear = () => setTip("0");

    const paymentMethods = [
        { id: "cash", label: "Cash", icon: "💵" },
        { id: "debit", label: "Card", icon: "💳" },
        { id: "ewallet", label: "E-Wallet", icon: "📱" },
    ];

    const handlePrintReceipt = () => {
        const printWindow = window.open("", "_blank");
        const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.orderNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px; }
          .center { text-align: center; }
          .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { font-size: 12px; color: #666; margin-bottom: 15px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; font-size: 13px; margin: 5px 0; }
          .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
          .footer { margin-top: 20px; font-size: 11px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">COSYPOS</div>
          <div class="subtitle">Restaurant POS</div>
        </div>
        <div class="divider"></div>
        <div class="item"><span>Order #:</span><span>${order.orderNumber}</span></div>
        <div class="item"><span>Table:</span><span>${order.tableNumber}</span></div>
        <div class="item"><span>Customer:</span><span>${order.customerName}</span></div>
        <div class="item"><span>Date:</span><span>${order.date}</span></div>
        <div class="item"><span>Time:</span><span>${order.time}</span></div>
        <div class="divider"></div>
        ${order.items
                .map(
                    (item) => `
          <div class="item">
            <span>${item.qty}x ${item.name}</span>
            <span>$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `
                )
                .join("")}
        <div class="divider"></div>
        <div class="item"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="item"><span>Tax (5%):</span><span>$${tax.toFixed(2)}</span></div>
        <div class="item"><span>Tip:</span><span>$${tipAmount.toFixed(2)}</span></div>
        <div class="item total"><span>TOTAL:</span><span>$${total.toFixed(2)}</span></div>
        <div class="divider"></div>
        <div class="item"><span>Payment:</span><span>${paymentMethod.toUpperCase()}</span></div>
        <div class="footer">
          Thank you for dining with us!<br>
          Please come again
        </div>
      </body>
      </html>
    `;
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.print();
    };

    const handlePay = async () => {
        try {
            // 1. Update the order in Firebase
            await updateDoc(doc(db, "orders", order.id), {
                status: "completed",
                statusText: "Paid",
                paymentStatus: "paid",
                paymentMethod: paymentMethod,
                tip: tipAmount,
                total: total,
                paidAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 2. Create notification for staff
            try {
                await addDoc(collection(db, "notifications"), {
                    title: "Payment Received",
                    message: `Table ${order.tableNumber} paid $${total.toFixed(2)} via ${paymentMethod}`,
                    type: "order",
                    read: false,
                    orderId: order.id,
                    tableNumber: order.tableNumber,
                    amount: total,
                    createdAt: serverTimestamp(),
                });
            } catch (notifErr) {
                console.warn("Notification failed (non-critical):", notifErr.message);
            }

            // 3. Show success screen
            setPaid(true);
            setTimeout(() => {
                setPaid(false);
                onClose();
            }, 4000);

        } catch (err) {
            console.error("Payment failed:", err);
            alert("Payment failed to save: " + err.message);
        }
    };

    // SUCCESS SCREEN
    if (paid) {
        return (
            <div className="fixed inset-0 bg-black/70 flex justify-end z-[100]">
                <div
                    className="bg-[#1e1e1e] h-full w-full sm:w-[700px] flex flex-col sm:flex-row overflow-hidden items-center justify-center"
                    style={{
                        borderTopLeftRadius: "12px",
                        borderBottomLeftRadius: "12px",
                    }}
                >
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                        <p className="text-sm text-gray-400 mb-1">Thank you for dining with us</p>
                        <p className="text-xs text-gray-500">Table {order.tableNumber} • Order #{order.orderNumber}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-end z-[100]">
            <div
                className="bg-[#1e1e1e] h-full w-full sm:w-[700px] flex flex-col sm:flex-row overflow-hidden"
                style={{
                    borderTopLeftRadius: "12px",
                    borderBottomLeftRadius: "12px",
                }}
            >
                {/* LEFT PANEL - Order Summary (scrollable) */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Header - fixed */}
                    <div className="p-4 sm:p-5 border-b border-white/5 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-white">
                                    Table {order.tableNumber}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-400">{order.customerName}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                    Order # {order.orderNumber}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white text-lg flex-shrink-0"
                            >
                                &#x2715;
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                        {/* Items */}
                        <div className="space-y-2 mb-5">
                            {order.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 bg-[#2a2a2a] rounded-xl p-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-[#F5C6CC]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-bold text-[#F5C6CC]">
                                            {String(idx + 1).padStart(2, "0")}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white truncate">{item.name}</p>
                                        <p className="text-[10px] text-gray-500">x {item.qty}</p>
                                    </div>
                                    <span className="text-xs text-white font-medium">
                                        ${(item.price * item.qty).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 text-sm mb-5">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="text-white">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Tax 5%</span>
                                <span className="text-white">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Tip</span>
                                <span className="text-white">${tipAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t border-white/10">
                                <span className="text-white">Total</span>
                                <span className="text-white text-lg">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="mb-5">
                            <p className="text-xs text-gray-500 mb-2">Payment Method</p>
                            <div className="grid grid-cols-3 gap-2">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${paymentMethod === method.id
                                            ? "bg-[#F5C6CC]/20 border-[#F5C6CC]/50 text-[#7D5B67]"
                                            : "bg-[#2a2a2a] border-white/5 text-gray-400 hover:border-white/10"
                                            }`}
                                    >
                                        <span className="text-lg">{method.icon}</span>
                                        <span className="text-[10px]">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePay}
                            className="w-full py-3 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-sm font-medium hover:bg-[#F5C6CC]/80 transition-all active:scale-95"
                        >
                            Pay ${total.toFixed(2)}
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL - Tips */}
                <div className="w-full sm:w-[280px] lg:w-[300px] border-t sm:border-t-0 sm:border-l border-white/5 flex-shrink-0 flex flex-col">
                    {/* MOBILE: Compact tips bar with Edit/Hide */}
                    <div className="sm:hidden p-3 border-b border-white/5 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-500">Tip Amount</p>
                                <p className="text-lg font-bold text-white">${tip}</p>
                            </div>
                            <button
                                onClick={() => setShowKeypad(!showKeypad)}
                                className="px-3 py-1.5 bg-[#F5C6CC]/20 text-[#7D5B67] rounded-lg text-xs font-medium"
                            >
                                {showKeypad ? "Hide" : "Edit"}
                            </button>
                        </div>

                        {/* Expandable keypad on mobile */}
                        {showKeypad && (
                            <div className="mt-3">
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {numbers.map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => handleNumber(num)}
                                            className="aspect-square rounded-xl bg-[#2a2a2a] text-white text-lg font-medium hover:bg-[#3a3a3a] transition-all active:scale-95"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleClear}
                                        className="aspect-square rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all active:scale-95 flex items-center justify-center text-xs font-medium"
                                    >
                                        CLR
                                    </button>
                                    <button
                                        onClick={() => handleNumber("0")}
                                        className="aspect-square rounded-xl bg-[#2a2a2a] text-white text-lg font-medium hover:bg-[#3a3a3a] transition-all active:scale-95"
                                    >
                                        0
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="aspect-square rounded-xl bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        <span className="text-base">&#x232B;</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrintReceipt}
                                        className="flex-1 py-2 bg-white/5 text-gray-400 rounded-xl text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-1"
                                    >
                                        <Printer className="w-3 h-3" />
                                        Print
                                    </button>
                                    <button className="flex-1 py-2 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-xs font-medium hover:bg-[#F5C6CC]/80 transition-all">
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DESKTOP: Full keypad */}
                    <div className="hidden sm:flex flex-col flex-1">
                        <div className="p-4 sm:p-5 border-b border-white/5 flex-shrink-0 text-center">
                            <h3 className="text-sm font-semibold text-white mb-1">Tips Amount</h3>
                            <p className="text-2xl font-bold text-white">${tip}</p>
                        </div>
                        <div className="flex-1 flex flex-col justify-center p-4 sm:p-5">
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {numbers.map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleNumber(num)}
                                        className="aspect-square rounded-2xl bg-[#2a2a2a] text-white text-xl font-medium hover:bg-[#3a3a3a] transition-all active:scale-95"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={handleClear}
                                    className="aspect-square rounded-2xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all active:scale-95 flex items-center justify-center text-xs font-medium"
                                >
                                    CLEAR
                                </button>
                                <button
                                    onClick={() => handleNumber("0")}
                                    className="aspect-square rounded-2xl bg-[#2a2a2a] text-white text-xl font-medium hover:bg-[#3a3a3a] transition-all active:scale-95"
                                >
                                    0
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="aspect-square rounded-2xl bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-all active:scale-95 flex items-center justify-center"
                                >
                                    <span className="text-lg">&#x232B;</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintReceipt}
                                    className="flex-1 py-3 bg-white/5 text-gray-400 rounded-xl text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print
                                </button>
                                <button className="flex-1 py-3 bg-[#F5C6CC] text-[#7D5B67] rounded-xl text-xs font-medium hover:bg-[#F5C6CC]/80 transition-all">
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Orders;