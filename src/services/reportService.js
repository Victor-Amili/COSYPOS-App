// src/services/reportService.js
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const ordersRef = collection(db, "orders");
const reservationsRef = collection(db, "reservations");
const productsRef = collection(db, "products");
const usersRef = collection(db, "users");

// ==================== DASHBOARD STATS ====================

/**
 * Get dashboard overview stats
 */
export const getDashboardStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's orders
    const todayQuery = query(
      ordersRef,
      where("createdAt", ">=", Timestamp.fromDate(today))
    );
    const todaySnapshot = await getDocs(todayQuery);
    const todayOrders = todaySnapshot.docs.map((doc) => doc.data());

    const dailySales = todayOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Monthly orders
    const monthQuery = query(
      ordersRef,
      where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
    );
    const monthSnapshot = await getDocs(monthQuery);
    const monthOrders = monthSnapshot.docs.map((doc) => doc.data());

    const monthlyRevenue = monthOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Table occupancy
    const tablesSnapshot = await getDocs(collection(db, "tables"));
    const tables = tablesSnapshot.docs.map((doc) => doc.data());
    const occupiedTables = tables.filter((t) => t.status === "occupied").length;

    return {
      dailySales,
      monthlyRevenue,
      totalTables: tables.length,
      occupiedTables,
      todayOrderCount: todayOrders.length,
      monthOrderCount: monthOrders.length,
    };
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    throw error;
  }
};

/**
 * Get popular dishes
 */
export const getPopularDishes = async (limit = 5) => {
  try {
    const snapshot = await getDocs(ordersRef);
    const orders = snapshot.docs.map((doc) => doc.data());

    const dishCounts = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.productId || item.name;
        if (!dishCounts[key]) {
          dishCounts[key] = {
            name: item.name,
            count: 0,
            revenue: 0,
            image: item.image || "",
          };
        }
        dishCounts[key].count += item.qty;
        dishCounts[key].revenue += item.price * item.qty;
      });
    });

    return Object.values(dishCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error("Get popular dishes error:", error);
    throw error;
  }
};

/**
 * Get sales chart data
 */
export const getSalesChartData = async (period = "monthly") => {
  try {
    const snapshot = await getDocs(
      query(ordersRef, where("paymentStatus", "==", "paid"), orderBy("createdAt", "asc"))
    );
    const orders = snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));

    const data = {};

    orders.forEach((order) => {
      if (!order.createdAt) return;

      let key;
      if (period === "daily") {
        key = order.createdAt.toISOString().split("T")[0];
      } else if (period === "weekly") {
        const week = getWeekNumber(order.createdAt);
        key = `Week ${week}`;
      } else {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        key = monthNames[order.createdAt.getMonth()];
      }

      if (!data[key]) {
        data[key] = { label: key, sales: 0, revenue: 0 };
      }
      data[key].sales += 1;
      data[key].revenue += order.total || 0;
    });

    return Object.values(data);
  } catch (error) {
    console.error("Get sales chart error:", error);
    throw error;
  }
};

// ==================== RESERVATION REPORTS ====================

/**
 * Get reservation report
 */
export const getReservationReport = async (startDate, endDate) => {
  try {
    const q = query(
      reservationsRef,
      where("reservationDate", ">=", startDate),
      where("reservationDate", "<=", endDate)
    );
    const snapshot = await getDocs(q);
    const reservations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const stats = {
      total: reservations.length,
      confirmed: reservations.filter((r) => r.status === "confirmed").length,
      awaited: reservations.filter((r) => r.status === "awaited").length,
      cancelled: reservations.filter((r) => r.status === "cancelled").length,
      failed: reservations.filter((r) => r.status === "failed").length,
      totalRevenue: reservations
        .filter((r) => r.status === "confirmed")
        .reduce((sum, r) => sum + (r.depositFee || 0), 0),
    };

    return { reservations, stats };
  } catch (error) {
    console.error("Get reservation report error:", error);
    throw error;
  }
};

// ==================== REVENUE REPORTS ====================

/**
 * Get revenue report
 */
export const getRevenueReport = async (startDate, endDate) => {
  try {
    const q = query(
      ordersRef,
      where("createdAt", ">=", Timestamp.fromDate(new Date(startDate))),
      where("createdAt", "<=", Timestamp.fromDate(new Date(endDate))),
      where("paymentStatus", "==", "paid")
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Top selling items
    const itemStats = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.productId || item.name;
        if (!itemStats[key]) {
          itemStats[key] = {
            name: item.name,
            sellPrice: item.price,
            totalQty: 0,
            totalRevenue: 0,
          };
        }
        itemStats[key].totalQty += item.qty;
        itemStats[key].totalRevenue += item.price * item.qty;
      });
    });

    // Calculate profit (requires costPrice from products)
    const productsSnapshot = await getDocs(productsRef);
    const products = {};
    productsSnapshot.docs.forEach((doc) => {
      products[doc.id] = doc.data();
    });

    const topSelling = Object.values(itemStats).map((item) => {
      const product = Object.values(products).find((p) => p.name === item.name);
      const costPrice = product?.costPrice || 0;
      const profit = item.totalRevenue - costPrice * item.totalQty;
      const profitMargin = item.totalRevenue > 0 ? (profit / item.totalRevenue) * 100 : 0;

      return {
        ...item,
        costPrice,
        profit,
        profitMargin: profitMargin.toFixed(2),
      };
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      orders,
      topSelling: topSelling.sort((a, b) => b.totalRevenue - a.totalRevenue),
      totalRevenue,
      totalOrders: orders.length,
    };
  } catch (error) {
    console.error("Get revenue report error:", error);
    throw error;
  }
};

// ==================== STAFF REPORTS ====================

/**
 * Get staff report
 */
export const getStaffReport = async (startDate, endDate) => {
  try {
    // Get all staff
    const staffQuery = query(usersRef, where("role", "in", ["staff", "manager"]));
    const staffSnapshot = await getDocs(staffQuery);
    const staff = staffSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Get attendance for period
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendance = attendanceSnapshot.docs.map((doc) => doc.data());

    // Calculate stats per staff
    const staffStats = staff.map((member) => {
      const memberAttendance = attendance.filter((a) => a.userId === member.id);
      const present = memberAttendance.filter((a) => a.status === "present").length;
      const absent = memberAttendance.filter((a) => a.status === "absent").length;
      const halfShift = memberAttendance.filter((a) => a.status === "half-shift").length;
      const leave = memberAttendance.filter((a) => a.status === "leave").length;

      return {
        ...member,
        attendance: {
          total: memberAttendance.length,
          present,
          absent,
          halfShift,
          leave,
          attendanceRate: memberAttendance.length > 0
            ? ((present + halfShift * 0.5) / memberAttendance.length * 100).toFixed(1)
            : 0,
        },
      };
    });

    return {
      staff: staffStats,
      totalStaff: staff.length,
      period: { startDate, endDate },
    };
  } catch (error) {
    console.error("Get staff report error:", error);
    throw error;
  }
};

// Helper: Get week number
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};
