import { db } from "./firebase/config";
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";



async function createTable(tableId) {
  await setDoc(doc(db, "tables", tableId), {
    tableNumber: "01",
    floor: "1st",
    capacity: 4,
    status: "available",
    currentOrderId: null, // Use native null type
    createdAt: serverTimestamp()
  });
}

// 2. ORDERS (Using custom Document ID or template)
async function createOrder(orderId) {
  await setDoc(doc(db, "orders", orderId), {
    orderNumber: "980",
    tableNumber: "01",
    tableId: "table_01",
    customerName: "Watson Joyce",
    customerPhone: "+1 (123) 123 4654",
    customerEmail: "watsonjoyce12@gmail.com",
    status: "in-process",
    statusText: "Ready to serve",
    items: [
      { 
        name: "Scrambled eggs with toast", 
        qty: 1, 
        price: 199, 
        productId: "prod_123" 
      }
    ],
    subtotal: 649.00,
    tax: 32.45,
    tip: 2.00,
    total: 683.45,
    paymentMethod: "cash",
    paymentStatus: "pending",
    date: "2024-03-28",
    time: "4:48 PM",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// 3. RESERVATIONS (Using custom Document ID)
async function createReservation(reservationId) {
  await setDoc(doc(db, "reservations", reservationId), {
    reservationId: "#12354564",
    tableNumber: "01",
    tableId: "table_01",
    floor: "1st",
    paxNumber: 5,
    reservationDate: "2024-03-28",
    reservationTime: "13:18",
    checkIn: "13:18 PM",
    checkOut: "15:00 PM",
    depositFee: 60.00,
    status: "confirmed",
    customer: { // Nested Map structure
      title: "Mr",
      firstName: "Watson",
      lastName: "Joyce",
      phone: "+1 (123) 123 4654",
      email: "watsonjoyce12@gmail.com"
    },
    customerId: "#12354564",
    paymentMethod: "Visa Card",
    cardNumber: "**** **** 4545 4545",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// 4. ATTENDANCE (Using Firestore Auto-Generated IDs)
async function logAttendance() {
  await addDoc(collection(db, "attendance"), {
    userId: "user_123",
    staffName: "Watson Joyce",
    staffRole: "Manager",
    date: "2024-04-18",
    timings: "9am to 6pm",
    status: "present",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// 5. NOTIFICATIONS (Using Firestore Auto-Generated IDs)
async function sendNotification() {
  await addDoc(collection(db, "notifications"), {
    title: "Low Stock Alert",
    message: "Chicken Parmesan is running low...",
    type: "inventory",
    read: false, // Boolean type
    userId: null, // Null value indicates system-wide broadcast
    date: "2024-03-28",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// 6. SETTINGS (Single Document Pattern)
async function saveSettings() {
  await setDoc(doc(db, "settings", "appConfig"), {
    taxRate: 0.05,
    currency: "USD",
    businessName: "COSYPOS",
    businessAddress: "House # 14 Street 123 USA, Chicago",
    theme: "dark"
  });
}

export async function initializeAllData() {
  console.log("🚀 Starting database initialization...");
  try {
    await createTable("table_01");
    await createOrder("order_980");
    await createReservation("res_12354564");
    await logAttendance();
    await sendNotification();
    await saveSettings();
    console.log("🎉 All remaining collections successfully built out in Firestore!");
  } catch (error) {
    console.error("❌ Failed to push collections to database:", error);
  }
}

