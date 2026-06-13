// src/services/attendanceService.js
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
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const attendanceRef = collection(db, "attendance");

/**
 * Get all attendance records
 */
export const getAllAttendance = async () => {
  try {
    const q = query(attendanceRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get attendance error:", error);
    throw error;
  }
};

/**
 * Get attendance by user
 */
export const getAttendanceByUser = async (userId) => {
  try {
    const q = query(attendanceRef, where("userId", "==", userId), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get attendance by user error:", error);
    throw error;
  }
};

/**
 * Get attendance by date
 */
export const getAttendanceByDate = async (date) => {
  try {
    const q = query(attendanceRef, where("date", "==", date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get attendance by date error:", error);
    throw error;
  }
};

/**
 * Get attendance by date range
 */
export const getAttendanceByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      attendanceRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get attendance by range error:", error);
    throw error;
  }
};

/**
 * Mark attendance
 */
export const markAttendance = async (attendanceData) => {
  try {
    // Check if attendance already exists for this user+date
    const q = query(
      attendanceRef,
      where("userId", "==", attendanceData.userId),
      where("date", "==", attendanceData.date)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      // Update existing
      const docId = existing.docs[0].id;
      await updateDoc(doc(db, "attendance", docId), {
        ...attendanceData,
        updatedAt: serverTimestamp(),
      });
      return { success: true, id: docId, updated: true };
    }

    // Create new
    const docRef = await addDoc(attendanceRef, {
      ...attendanceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id, updated: false };
  } catch (error) {
    console.error("Mark attendance error:", error);
    throw error;
  }
};

/**
 * Update attendance
 */
export const updateAttendance = async (attendanceId, updates) => {
  try {
    await updateDoc(doc(db, "attendance", attendanceId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Update attendance error:", error);
    throw error;
  }
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (attendanceId) => {
  try {
    await deleteDoc(doc(db, "attendance", attendanceId));
    return { success: true };
  } catch (error) {
    console.error("Delete attendance error:", error);
    throw error;
  }
};

/**
 * Get attendance stats
 */
export const getAttendanceStats = async (startDate, endDate) => {
  try {
    const q = query(
      attendanceRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((doc) => doc.data());

    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const halfShift = records.filter((r) => r.status === "half-shift").length;
    const leave = records.filter((r) => r.status === "leave").length;

    return { total, present, absent, halfShift, leave };
  } catch (error) {
    console.error("Get attendance stats error:", error);
    throw error;
  }
};
