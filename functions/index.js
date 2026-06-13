// functions/index.js
const { onDocumentUpdated, onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const db = getFirestore();
const auth = getAuth();

// ==================== CUSTOM CLAIMS ====================

/**
 * Set custom claims for a user (admin only)
 */
exports.setCustomClaims = onCall(async (request) => {
  const { uid, role } = request.data;

  // Verify caller is admin
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const callerDoc = await db.collection("users").doc(request.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can set custom claims");
  }

  try {
    await auth.setCustomUserClaims(uid, { role });
    return { success: true };
  } catch (error) {
    console.error("Set custom claims error:", error);
    throw new HttpsError("internal", "Failed to set custom claims");
  }
});

/**
 * Sync user role to custom claims on user document update
 */
exports.syncUserRole = onDocumentUpdated("users/{userId}", async (event) => {
  const { userId } = event.params;
  const after = event.data.after.data();
  const before = event.data.before.data();

  if (after.role !== before.role) {
    try {
      await auth.setCustomUserClaims(userId, { role: after.role });
      console.log(`Updated custom claims for user ${userId}: ${after.role}`);
    } catch (error) {
      console.error("Sync user role error:", error);
    }
  }
});

// ==================== INVENTORY AUTO-UPDATE ====================

/**
 * Auto-update inventory when order is marked as completed
 */
exports.updateInventoryOnOrderComplete = onDocumentUpdated("orders/{orderId}", async (event) => {
  const { orderId } = event.params;
  const after = event.data.after.data();
  const before = event.data.before.data();

  // Only process when status changes to completed
  if (after.status === "completed" && before.status !== "completed") {
    const batch = db.batch();
    const notifications = [];

    for (const item of after.items || []) {
      if (!item.productId) continue;

      const productRef = db.collection("products").doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) continue;

      const currentStock = productDoc.data().stock || 0;
      const newStock = Math.max(0, currentStock - item.qty);
      const stockStatus = newStock === 0 ? "out-of-stock" : newStock <= 5 ? "low-stock" : "in-stock";
      const availability = newStock > 0 ? "In Stock" : "Out of Stock";

      batch.update(productRef, {
        stock: newStock,
        stockStatus,
        availability,
        updatedAt: new Date(),
      });

      // Create low stock notification
      if (newStock <= 5 && currentStock > 5) {
        notifications.push({
          title: "Low Stock Alert",
          message: `${productDoc.data().name} is running low (${newStock} left)`,
          type: "inventory",
          read: false,
          createdAt: new Date(),
        });
      }

      // Create out of stock notification
      if (newStock === 0 && currentStock > 0) {
        notifications.push({
          title: "Out of Stock",
          message: `${productDoc.data().name} is now out of stock`,
          type: "inventory",
          read: false,
          createdAt: new Date(),
        });
      }
    }

    await batch.commit();

    // Send notifications
    for (const notification of notifications) {
      await db.collection("notifications").add(notification);
    }

    console.log(`Inventory updated for completed order ${orderId}`);
  }
});

// ==================== ORDER NOTIFICATIONS ====================

/**
 * Create notification when new order is placed
 */
exports.notifyNewOrder = onDocumentCreated("orders/{orderId}", async (event) => {
  const order = event.data.data();

  try {
    await db.collection("notifications").add({
      title: "New Order Received",
      message: `Table ${order.tableNumber} - ${order.customerName} - $${order.total?.toFixed(2)}`,
      type: "order",
      read: false,
      orderId: event.params.orderId,
      createdAt: new Date(),
    });

    console.log(`Notification created for new order ${event.params.orderId}`);
  } catch (error) {
    console.error("Notify new order error:", error);
  }
});

/**
 * Create notification when order status changes
 */
exports.notifyOrderStatusChange = onDocumentUpdated("orders/{orderId}", async (event) => {
  const { orderId } = event.params;
  const after = event.data.after.data();
  const before = event.data.before.data();

  if (after.status !== before.status) {
    const statusMessages = {
      ready: "Order is ready to serve",
      completed: "Order has been completed",
      cancelled: "Order has been cancelled",
    };

    if (statusMessages[after.status]) {
      try {
        await db.collection("notifications").add({
          title: `Order ${after.status.charAt(0).toUpperCase() + after.status.slice(1)}`,
          message: `Table ${after.tableNumber} - ${statusMessages[after.status]}`,
          type: "order",
          read: false,
          orderId,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error("Notify status change error:", error);
      }
    }
  }
});

// ==================== RESERVATION NOTIFICATIONS ====================

/**
 * Create notification for new reservation
 */
exports.notifyNewReservation = onDocumentCreated("reservations/{reservationId}", async (event) => {
  const reservation = event.data.data();

  try {
    await db.collection("notifications").add({
      title: "New Reservation",
      message: `Table ${reservation.tableNumber} - ${reservation.customer?.firstName} ${reservation.customer?.lastName} - ${reservation.reservationDate}`,
      type: "reservation",
      read: false,
      reservationId: event.params.reservationId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Notify new reservation error:", error);
  }
});

// ==================== DELETE USER ====================

/**
 * Delete user auth account (admin only)
 */
exports.deleteUser = onCall(async (request) => {
  const { uid } = request.data;

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const callerDoc = await db.collection("users").doc(request.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can delete users");
  }

  try {
    await auth.deleteUser(uid);
    await db.collection("users").doc(uid).delete();
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    throw new HttpsError("internal", "Failed to delete user");
  }
});
