// src/services/notificationService.js
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

const notificationsRef = collection(db, "notifications");

/**
 * Get all notifications
 */
export const getAllNotifications = async () => {
  try {
    const q = query(notificationsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get notifications error:", error);
    throw error;
  }
};

/**
 * Get notifications for user
 */
export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      notificationsRef,
      where("userId", "in", [userId, null]),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get user notifications error:", error);
    throw error;
  }
};

/**
 * Get unread notifications
 */
export const getUnreadNotifications = async (userId) => {
  try {
    const q = query(
      notificationsRef,
      where("userId", "in", [userId, null]),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get unread notifications error:", error);
    throw error;
  }
};

/**
 * Create notification
 */
export const createNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Mark as read error:", error);
    throw error;
  }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (userId) => {
  try {
    const q = query(
      notificationsRef,
      where("userId", "in", [userId, null]),
      where("read", "==", false)
    );
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.update(doc(db, "notifications", docSnap.id), {
        read: true,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Mark all as read error:", error);
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
    return { success: true };
  } catch (error) {
    console.error("Delete notification error:", error);
    throw error;
  }
};

/**
 * Subscribe to notifications (real-time)
 */
export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    notificationsRef,
    where("userId", "in", [userId, null]),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(notifications);
  });
};

// Import writeBatch
import { writeBatch } from "firebase/firestore";
