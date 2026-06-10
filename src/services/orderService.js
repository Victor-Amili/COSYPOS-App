// src/services/orderService.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const ordersRef = collection(db, "orders");

/**
 * Get all orders
 */
export const getAllOrders = async () => {
  try {
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get all orders error:", error);
    throw error;
  }
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status) => {
  try {
    const q = query(
      ordersRef,
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get orders by status error:", error);
    throw error;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    const docSnap = await getDoc(doc(db, "orders", orderId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Get order error:", error);
    throw error;
  }
};

/**
 * Get order by table number (for QR payment)
 */
export const getOrderByTable = async (tableNumber) => {
  try {
    const q = query(
      ordersRef,
      where("tableNumber", "==", tableNumber),
      where("status", "in", ["in-process", "ready"]),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error("Get order by table error:", error);
    throw error;
  }
};

/**
 * Create new order
 */
export const createOrder = async (orderData) => {
  try {
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const docRef = await addDoc(ordersRef, {
      ...orderData,
      subtotal,
      tax,
      total,
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update table status
    await updateDoc(doc(db, "tables", orderData.tableId), {
      status: "occupied",
      currentOrderId: docRef.id,
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
};

/**
 * Update order
 */
export const updateOrder = async (orderId, updates) => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Update order error:", error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status, statusText) => {
  try {
    const updates = { status, statusText, updatedAt: serverTimestamp() };

    if (status === "completed") {
      updates.paymentStatus = "paid";
      updates.completedAt = serverTimestamp();

      // Free up the table
      const order = await getOrderById(orderId);
      if (order?.tableId) {
        await updateDoc(doc(db, "tables", order.tableId), {
          status: "available",
          currentOrderId: null,
          updatedAt: serverTimestamp(),
        });
      }
    }

    await updateDoc(doc(db, "orders", orderId), updates);
    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
};

/**
 * Process payment
 */
export const processPayment = async (orderId, paymentData) => {
  try {
    const { paymentMethod, tip = 0 } = paymentData;
    const order = await getOrderById(orderId);

    if (!order) throw new Error("Order not found");

    const tipAmount = parseFloat(tip) || 0;
    const total = order.total + tipAmount;

    await updateDoc(doc(db, "orders", orderId), {
      paymentMethod,
      tip: tipAmount,
      total,
      paymentStatus: "paid",
      status: "completed",
      statusText: "Completed",
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Free up table
    if (order.tableId) {
      await updateDoc(doc(db, "tables", order.tableId), {
        status: "available",
        currentOrderId: null,
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Process payment error:", error);
    throw error;
  }
};

/**
 * Delete order
 */
export const deleteOrder = async (orderId) => {
  try {
    const order = await getOrderById(orderId);

    // Free up table if assigned
    if (order?.tableId) {
      await updateDoc(doc(db, "tables", order.tableId), {
        status: "available",
        currentOrderId: null,
        updatedAt: serverTimestamp(),
      });
    }

    await deleteDoc(doc(db, "orders", orderId));
    return { success: true };
  } catch (error) {
    console.error("Delete order error:", error);
    throw error;
  }
};

/**
 * Search orders
 */
export const searchOrders = async (searchTerm) => {
  try {
    const snapshot = await getDocs(ordersRef);
    const allOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const term = searchTerm.toLowerCase();
    return allOrders.filter(
      (order) =>
        order.customerName?.toLowerCase().includes(term) ||
        order.orderNumber?.includes(term) ||
        order.tableNumber?.includes(term)
    );
  } catch (error) {
    console.error("Search orders error:", error);
    throw error;
  }
};

/**
 * Get today's orders
 */
export const getTodaysOrders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      ordersRef,
      where("createdAt", ">=", Timestamp.fromDate(today)),
      where("createdAt", "<", Timestamp.fromDate(tomorrow))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get today's orders error:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time orders
 */
export const subscribeToOrders = (callback) => {
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
};

/**
 * Subscribe to orders by status
 */
export const subscribeToOrdersByStatus = (status, callback) => {
  const q = query(
    ordersRef,
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
};
