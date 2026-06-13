// scripts/seedData.js
// Run this to populate your Firestore with initial data

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Seed Categories
const seedCategories = async () => {
  const categories = [
    { name: "All", icon: "⊞", description: "All menu items", menuType: "normal", itemCount: 0 },
    { name: "Pizza", icon: "🍕", description: "Italian pizzas", menuType: "normal", itemCount: 20 },
    { name: "Burger", icon: "🍔", description: "Gourmet burgers", menuType: "normal", itemCount: 15 },
    { name: "Chicken", icon: "🍗", description: "Chicken dishes", menuType: "normal", itemCount: 10 },
    { name: "Bakery", icon: "🧁", description: "Fresh baked goods", menuType: "normal", itemCount: 18 },
    { name: "Beverage", icon: "🥤", description: "Drinks & beverages", menuType: "normal", itemCount: 12 },
    { name: "Seafood", icon: "🦐", description: "Fresh seafood", menuType: "normal", itemCount: 16 },
  ];

  for (const cat of categories) {
    await addDoc(collection(db, "categories"), {
      ...cat,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  console.log("✅ Categories seeded");
};

// Seed Products
const seedProducts = async () => {
  const products = [
    {
      name: "Chicken Parmesan",
      description: "Breaded chicken breast topped with marinara sauce and melted cheese",
      itemId: "#22314644",
      price: 55.00,
      costPrice: 30.00,
      categoryId: "chicken_cat_id", // Replace with actual ID after seeding
      categoryName: "Chicken",
      image: "",
      stock: 19,
      stockStatus: "in-stock",
      status: "active",
      isPerishable: true,
      availability: "In Stock",
    },
    {
      name: "Roasted Chicken",
      description: "Herb-roasted whole chicken with seasonal vegetables",
      itemId: "#22314645",
      price: 35.00,
      costPrice: 20.00,
      categoryId: "chicken_cat_id",
      categoryName: "Chicken",
      image: "",
      stock: 15,
      stockStatus: "in-stock",
      status: "active",
      isPerishable: true,
      availability: "In Stock",
    },
    {
      name: "Scrambled eggs with toast",
      description: "Fluffy scrambled eggs served with buttered toast",
      itemId: "#22314646",
      price: 199.00,
      costPrice: 100.00,
      categoryId: "bakery_cat_id",
      categoryName: "Bakery",
      image: "",
      stock: 25,
      stockStatus: "in-stock",
      status: "active",
      isPerishable: true,
      availability: "In Stock",
    },
    {
      name: "Smoked Salmon Bagel",
      description: "Fresh bagel with smoked salmon and cream cheese",
      itemId: "#22314647",
      price: 120.00,
      costPrice: 60.00,
      categoryId: "bakery_cat_id",
      categoryName: "Bakery",
      image: "",
      stock: 12,
      stockStatus: "in-stock",
      status: "active",
      isPerishable: true,
      availability: "In Stock",
    },
    {
      name: "Belgian Waffles",
      description: "Crispy Belgian waffles with maple syrup",
      itemId: "#22314648",
      price: 220.00,
      costPrice: 110.00,
      categoryId: "bakery_cat_id",
      categoryName: "Bakery",
      image: "",
      stock: 8,
      stockStatus: "low-stock",
      status: "active",
      isPerishable: true,
      availability: "In Stock",
    },
    {
      name: "Classic Lemonade",
      description: "Freshly squeezed lemonade with mint",
      itemId: "#22314649",
      price: 50.00,
      costPrice: 15.00,
      categoryId: "beverage_cat_id",
      categoryName: "Beverage",
      image: "",
      stock: 50,
      stockStatus: "in-stock",
      status: "active",
      isPerishable: false,
      availability: "In Stock",
    },
  ];

  for (const product of products) {
    await addDoc(collection(db, "products"), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  console.log("✅ Products seeded");
};

// Seed Tables
const seedTables = async () => {
  const floors = ["1st", "2nd", "3rd"];
  const tableNumbers = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];

  for (const floor of floors) {
    for (const num of tableNumbers) {
      await addDoc(collection(db, "tables"), {
        tableNumber: num,
        floor,
        capacity: Math.floor(Math.random() * 6) + 2,
        status: "available",
        currentOrderId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }
  console.log("✅ Tables seeded");
};

// Seed Admin User
const seedAdminUser = async () => {
  try {
    const email = "admin@cosypos.com";
    const password = "admin123";

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    await addDoc(collection(db, "users"), {
      uid: user.uid,
      fullName: "Admin User",
      email,
      role: "admin",
      phone: "+1 (000) 000-0000",
      avatar: "",
      salary: 0,
      dateOfBirth: "1990-01-01",
      shiftStart: "9am",
      shiftEnd: "6pm",
      address: "Admin Office",
      additionalDetails: "System Administrator",
      permissions: {
        dashboard: true,
        reports: true,
        inventory: true,
        orders: true,
        customers: true,
        settings: true,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Admin user seeded");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error("Admin seed error:", error);
  }
};

// Seed Notifications
const seedNotifications = async () => {
  const notifications = [
    {
      title: "Low Stock Alert",
      message: "Belgian Waffles is running low (8 left)",
      type: "inventory",
      read: false,
      userId: null,
      date: "2024-03-28",
    },
    {
      title: "New Order Received",
      message: "Table 01 - Watson Joyce - $117.50",
      type: "order",
      read: false,
      userId: null,
      date: "2024-03-28",
    },
    {
      title: "Reservation Confirmed",
      message: "Table 01 - John Doe - 28.03.2024",
      type: "reservation",
      read: true,
      userId: null,
      date: "2024-03-27",
    },
  ];

  for (const notification of notifications) {
    await addDoc(collection(db, "notifications"), {
      ...notification,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  console.log("✅ Notifications seeded");
};

// Run all seeds
const runSeed = async () => {
  console.log("🌱 Starting COSYPOS data seed...\n");

  try {
    await seedCategories();
    await seedProducts();
    await seedTables();
    await seedAdminUser();
    await seedNotifications();

    console.log("\n✅ All data seeded successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Update category IDs in products after seeding");
    console.log("   2. Deploy Firestore rules: firebase deploy --only firestore:rules");
    console.log("   3. Deploy Cloud Functions: firebase deploy --only functions");
    console.log("   4. Set up custom claims for admin via Cloud Function");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
};

runSeed();
