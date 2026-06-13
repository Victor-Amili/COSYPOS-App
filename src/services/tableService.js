// src/services/tableService.js
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
} from "firebase/firestore";
import { db } from "../firebase/config";

const tablesRef = collection(db, "tables");

/**
 * Get all tables
 */
export const getAllTables = async () => {
  try {
    const q = query(tablesRef, orderBy("tableNumber", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get tables error:", error);
    throw error;
  }
};

/**
 * Get tables by floor
 */
export const getTablesByFloor = async (floor) => {
  try {
    const q = query(tablesRef, where("floor", "==", floor), orderBy("tableNumber", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get tables by floor error:", error);
    throw error;
  }
};

/**
 * Get table by ID
 */
export const getTableById = async (tableId) => {
  try {
    const docSnap = await getDoc(doc(db, "tables", tableId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Get table error:", error);
    throw error;
  }
};

/**
 * Get table by number
 */
export const getTableByNumber = async (tableNumber) => {
  try {
    const q = query(tablesRef, where("tableNumber", "==", tableNumber));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error("Get table by number error:", error);
    throw error;
  }
};

/**
 * Add new table
 */
export const addTable = async (tableData) => {
  try {
    const docRef = await addDoc(tablesRef, {
      ...tableData,
      status: "available",
      currentOrderId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add table error:", error);
    throw error;
  }
};

/**
 * Update table
 */
export const updateTable = async (tableId, updates) => {
  try {
    await updateDoc(doc(db, "tables", tableId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Update table error:", error);
    throw error;
  }
};

/**
 * Delete table
 */
export const deleteTable = async (tableId) => {
  try {
    await deleteDoc(doc(db, "tables", tableId));
    return { success: true };
  } catch (error) {
    console.error("Delete table error:", error);
    throw error;
  }
};

/**
 * Get table occupancy stats
 */
export const getTableStats = async () => {
  try {
    const snapshot = await getDocs(tablesRef);
    const tables = snapshot.docs.map((doc) => doc.data());

    const total = tables.length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const available = tables.filter((t) => t.status === "available").length;
    const reserved = tables.filter((t) => t.status === "reserved").length;

    return { total, occupied, available, reserved, occupancyRate: total > 0 ? (occupied / total) * 100 : 0 };
  } catch (error) {
    console.error("Get table stats error:", error);
    throw error;
  }
};

/**
 * Subscribe to tables (real-time)
 */
export const subscribeToTables = (callback) => {
  const q = query(tablesRef, orderBy("tableNumber", "asc"));
  return onSnapshot(q, (snapshot) => {
    const tables = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(tables);
  });
};
