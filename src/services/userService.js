// src/services/userService.js
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
} from "firebase/firestore";
import { db } from "../firebase/config";
import { deleteUserAuth } from "./authService";

const usersRef = collection(db, "users");

/**
 * Get all staff/users
 */
export const getAllUsers = async () => {
  try {
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get all users error:", error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
};

/**
 * Add new staff member (creates auth + Firestore doc)
 * Note: Use authService.signUpUser for full creation
 */
export const addStaffMember = async (staffData) => {
  try {
    const docRef = await addDoc(usersRef, {
      ...staffData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add staff error:", error);
    throw error;
  }
};

/**
 * Update staff member
 */
export const updateStaffMember = async (userId, updates) => {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Update staff error:", error);
    throw error;
  }
};

/**
 * Delete staff member
 */
export const deleteStaffMember = async (userId) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    // Note: Auth user deletion requires Cloud Function or Admin SDK
    return { success: true };
  } catch (error) {
    console.error("Delete staff error:", error);
    throw error;
  }
};

/**
 * Get staff by role
 */
export const getStaffByRole = async (role) => {
  try {
    const q = query(usersRef, where("role", "==", role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get staff by role error:", error);
    throw error;
  }
};

/**
 * Search staff
 */
export const searchStaff = async (searchTerm) => {
  try {
    // Firestore doesn't support partial text search natively
    // For production, consider Algolia or Typesense
    const snapshot = await getDocs(usersRef);
    const allStaff = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const term = searchTerm.toLowerCase();
    return allStaff.filter(
      (staff) =>
        staff.fullName?.toLowerCase().includes(term) ||
        staff.email?.toLowerCase().includes(term) ||
        staff.phone?.includes(term)
    );
  } catch (error) {
    console.error("Search staff error:", error);
    throw error;
  }
};
