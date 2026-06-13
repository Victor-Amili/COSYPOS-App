// src/services/reservationService.js
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
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";

const reservationsRef = collection(db, "reservations");

/**
 * Get all reservations
 */
export const getAllReservations = async () => {
  try {
    const q = query(reservationsRef, orderBy("reservationDate", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get reservations error:", error);
    throw error;
  }
};

/**
 * Get reservations by status
 */
export const getReservationsByStatus = async (status) => {
  try {
    const q = query(
      reservationsRef,
      where("status", "==", status),
      orderBy("reservationDate", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get reservations by status error:", error);
    throw error;
  }
};

/**
 * Get reservation by ID
 */
export const getReservationById = async (reservationId) => {
  try {
    const docSnap = await getDoc(doc(db, "reservations", reservationId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Get reservation error:", error);
    throw error;
  }
};

/**
 * Get reservations by table
 */
export const getReservationsByTable = async (tableNumber) => {
  try {
    const q = query(
      reservationsRef,
      where("tableNumber", "==", tableNumber),
      orderBy("reservationDate", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get reservations by table error:", error);
    throw error;
  }
};

/**
 * Get reservations by date
 */
export const getReservationsByDate = async (date) => {
  try {
    const q = query(
      reservationsRef,
      where("reservationDate", "==", date),
      orderBy("reservationTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get reservations by date error:", error);
    throw error;
  }
};

/**
 * Get reservations by date range
 */
export const getReservationsByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      reservationsRef,
      where("reservationDate", ">=", startDate),
      where("reservationDate", "<=", endDate),
      orderBy("reservationDate", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get reservations by range error:", error);
    throw error;
  }
};

/**
 * Create new reservation
 */
export const createReservation = async (reservationData) => {
  try {
    // Check for table conflicts
    const conflicts = await checkTableAvailability(
      reservationData.tableNumber,
      reservationData.reservationDate,
      reservationData.reservationTime,
      reservationData.checkOut
    );

    if (conflicts.length > 0) {
      throw new Error("Table is not available for the selected time");
    }

    const docRef = await addDoc(reservationsRef, {
      ...reservationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update table status if confirmed
    if (reservationData.status === "confirmed") {
      await updateDoc(doc(db, "tables", reservationData.tableId), {
        status: "reserved",
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Create reservation error:", error);
    throw error;
  }
};

/**
 * Update reservation
 */
export const updateReservation = async (reservationId, updates) => {
  try {
    await updateDoc(doc(db, "reservations", reservationId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Update table status if status changed
    if (updates.status) {
      const reservation = await getReservationById(reservationId);
      if (reservation?.tableId) {
        const tableStatus = updates.status === "confirmed" ? "reserved" : "available";
        await updateDoc(doc(db, "tables", reservation.tableId), {
          status: tableStatus,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Update reservation error:", error);
    throw error;
  }
};

/**
 * Cancel reservation
 */
export const cancelReservation = async (reservationId) => {
  try {
    const reservation = await getReservationById(reservationId);

    await updateDoc(doc(db, "reservations", reservationId), {
      status: "cancelled",
      updatedAt: serverTimestamp(),
    });

    // Free up table
    if (reservation?.tableId) {
      await updateDoc(doc(db, "tables", reservation.tableId), {
        status: "available",
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Cancel reservation error:", error);
    throw error;
  }
};

/**
 * Delete reservation
 */
export const deleteReservation = async (reservationId) => {
  try {
    const reservation = await getReservationById(reservationId);

    await deleteDoc(doc(db, "reservations", reservationId));

    // Free up table
    if (reservation?.tableId) {
      await updateDoc(doc(db, "tables", reservation.tableId), {
        status: "available",
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Delete reservation error:", error);
    throw error;
  }
};

/**
 * Check table availability
 */
export const checkTableAvailability = async (tableNumber, date, startTime, endTime) => {
  try {
    const q = query(
      reservationsRef,
      where("tableNumber", "==", tableNumber),
      where("reservationDate", "==", date),
      where("status", "in", ["confirmed", "awaited"])
    );
    const snapshot = await getDocs(q);
    const reservations = snapshot.docs.map((doc) => doc.data());

    // Check time overlap
    return reservations.filter((res) => {
      const resStart = timeToMinutes(res.reservationTime);
      const resEnd = timeToMinutes(res.checkOut);
      const newStart = timeToMinutes(startTime);
      const newEnd = timeToMinutes(endTime);

      return newStart < resEnd && newEnd > resStart;
    });
  } catch (error) {
    console.error("Check availability error:", error);
    throw error;
  }
};

/**
 * Get reservation stats
 */
export const getReservationStats = async () => {
  try {
    const snapshot = await getDocs(reservationsRef);
    const reservations = snapshot.docs.map((doc) => doc.data());

    const total = reservations.length;
    const confirmed = reservations.filter((r) => r.status === "confirmed").length;
    const awaited = reservations.filter((r) => r.status === "awaited").length;
    const cancelled = reservations.filter((r) => r.status === "cancelled").length;
    const failed = reservations.filter((r) => r.status === "failed").length;

    return { total, confirmed, awaited, cancelled, failed };
  } catch (error) {
    console.error("Get reservation stats error:", error);
    throw error;
  }
};

/**
 * Subscribe to reservations (real-time)
 */
export const subscribeToReservations = (callback) => {
  const q = query(reservationsRef, orderBy("reservationDate", "desc"));
  return onSnapshot(q, (snapshot) => {
    const reservations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(reservations);
  });
};

// Helper: Convert time string to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};
