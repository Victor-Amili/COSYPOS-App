import { db } from "./firebase/config";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function seedAllData() {
  console.log("🌱 Seeding database...");

  try {
    // 1. CATEGORIES
    const categories = [
      { id: "cat_all", name: "All", icon: "⊞", description: "All menu items", menuType: "normal", itemCount: 0 },
      { id: "cat_pizza", name: "Pizza", icon: "🍕", description: "Italian pizzas", menuType: "normal", itemCount: 20 },
      { id: "cat_burger", name: "Burger", icon: "🍔", description: "Gourmet burgers", menuType: "normal", itemCount: 15 },
      { id: "cat_chicken", name: "Chicken", icon: "🍗", description: "Chicken dishes", menuType: "normal", itemCount: 10 },
      { id: "cat_bakery", name: "Bakery", icon: "🧁", description: "Fresh baked goods", menuType: "normal", itemCount: 18 },
      { id: "cat_beverage", name: "Beverage", icon: "🥤", description: "Drinks & beverages", menuType: "normal", itemCount: 12 },
      { id: "cat_seafood", name: "Seafood", icon: "🦐", description: "Fresh seafood", menuType: "normal", itemCount: 16 },
    ];

    for (const cat of categories) {
      await setDoc(doc(db, "categories", cat.id), {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        menuType: cat.menuType,
        itemCount: cat.itemCount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("✅ Categories seeded");

    // 2. PRODUCTS
    const products = [
      {
        id: "prod_chicken_parm",
        name: "Chicken Parmesan",
        description: "Crispy chicken breast topped with marinara and melted cheese",
        itemId: "#22314644",
        price: 55.00,
        costPrice: 30.00,
        categoryId: "cat_chicken",
        categoryName: "Chicken",
        image: "",
        stock: 19,
        stockStatus: "in-stock",
        status: "active",
        isPerishable: true,
        availability: "In Stock",
      },
      {
        id: "prod_roasted_chicken",
        name: "Roasted Chicken",
        description: "Herb-roasted whole chicken with seasonal vegetables",
        itemId: "#22314645",
        price: 35.00,
        costPrice: 20.00,
        categoryId: "cat_chicken",
        categoryName: "Chicken",
        image: "",
        stock: 15,
        stockStatus: "in-stock",
        status: "active",
        isPerishable: true,
        availability: "In Stock",
      },
      {
        id: "prod_scrambled_eggs",
        name: "Scrambled eggs with toast",
        description: "Fluffy scrambled eggs served with buttered toast",
        itemId: "#22314646",
        price: 199.00,
        costPrice: 100.00,
        categoryId: "cat_bakery",
        categoryName: "Bakery",
        image: "",
        stock: 25,
        stockStatus: "in-stock",
        status: "active",
        isPerishable: true,
        availability: "In Stock",
      },
      {
        id: "prod_salmon_bagel",
        name: "Smoked Salmon Bagel",
        description: "Fresh bagel with smoked salmon and cream cheese",
        itemId: "#22314647",
        price: 120.00,
        costPrice: 60.00,
        categoryId: "cat_bakery",
        categoryName: "Bakery",
        image: "",
        stock: 12,
        stockStatus: "in-stock",
        status: "active",
        isPerishable: true,
        availability: "In Stock",
      },
      {
        id: "prod_belgian_waffles",
        name: "Belgian Waffles",
        description: "Crispy Belgian waffles with maple syrup",
        itemId: "#22314648",
        price: 220.00,
        costPrice: 110.00,
        categoryId: "cat_bakery",
        categoryName: "Bakery",
        image: "",
        stock: 8,
        stockStatus: "low-stock",
        status: "active",
        isPerishable: true,
        availability: "In Stock",
      },
      {
        id: "prod_lemonade",
        name: "Classic Lemonade",
        description: "Freshly squeezed lemonade with mint",
        itemId: "#22314649",
        price: 50.00,
        costPrice: 15.00,
        categoryId: "cat_beverage",
        categoryName: "Beverage",
        image: "",
        stock: 50,
        stockStatus: "in-stock",
        status: "active",
        isPerishable: false,
        availability: "In Stock",
      },
    ];

    for (const prod of products) {
      await setDoc(doc(db, "products", prod.id), {
        name: prod.name,
        description: prod.description,
        itemId: prod.itemId,
        price: prod.price,
        costPrice: prod.costPrice,
        categoryId: prod.categoryId,
        categoryName: prod.categoryName,
        image: prod.image,
        stock: prod.stock,
        stockStatus: prod.stockStatus,
        status: prod.status,
        isPerishable: prod.isPerishable,
        availability: prod.availability,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("✅ Products seeded");

    // 3. TABLES (3 floors, 10 tables each)
    const floors = ["1st", "2nd", "3rd"];
    const tableNumbers = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
    
    for (const floor of floors) {
      for (const num of tableNumbers) {
        await setDoc(doc(db, "tables", `table_${floor}_${num}`), {
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
    console.log("✅ Tables seeded (30 tables)");

    // 4. ORDERS
    await setDoc(doc(db, "orders", "order_980"), {
      orderNumber: "980",
      tableNumber: "01",
      tableId: "table_1st_01",
      customerName: "Watson Joyce",
      customerPhone: "+1 (123) 123 4654",
      customerEmail: "watsonjoyce12@gmail.com",
      status: "ready",
      statusText: "Ready to serve",
      items: [
        { name: "Scrambled eggs with toast", qty: 1, price: 199, productId: "prod_scrambled_eggs" },
        { name: "Smoked Salmon Bagel", qty: 1, price: 120, productId: "prod_salmon_bagel" },
        { name: "Belgian Waffles", qty: 2, price: 220, productId: "prod_belgian_waffles" },
        { name: "Classic Lemonade", qty: 1, price: 50, productId: "prod_lemonade" },
      ],
      subtotal: 809.00,
      tax: 40.45,
      tip: 0,
      total: 849.45,
      paymentMethod: "cash",
      paymentStatus: "pending",
      date: "2024-03-28",
      time: "4:48 PM",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Orders seeded");

    // 5. RESERVATIONS
    await setDoc(doc(db, "reservations", "res_12354564"), {
      reservationId: "#12354564",
      tableNumber: "01",
      tableId: "table_1st_01",
      floor: "1st",
      paxNumber: 5,
      reservationDate: "2024-03-28",
      reservationTime: "13:18",
      checkIn: "13:18 PM",
      checkOut: "15:00 PM",
      depositFee: 60.00,
      status: "confirmed",
      customer: {
        title: "Mr",
        firstName: "Watson",
        lastName: "Joyce",
        phone: "+1 (123) 123 4654",
        email: "watsonjoyce12@gmail.com",
      },
      customerId: "#12354564",
      paymentMethod: "Visa Card",
      cardNumber: "**** **** 4545 4545",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Reservations seeded");

    // 6. ATTENDANCE
    await addDoc(collection(db, "attendance"), {
      userId: "REPLACE_WITH_REAL_UID",
      staffName: "Watson Joyce",
      staffRole: "Manager",
      date: "2024-04-18",
      timings: "9am to 6pm",
      status: "present",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Attendance seeded");

    // 7. NOTIFICATIONS
    await addDoc(collection(db, "notifications"), {
      title: "Low Stock Alert",
      message: "Belgian Waffles is running low (8 left)",
      type: "inventory",
      read: false,
      userId: null,
      date: "2024-03-28",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Notifications seeded");

    // 8. SETTINGS
    await setDoc(doc(db, "settings", "appConfig"), {
      taxRate: 0.05,
      currency: "USD",
      businessName: "COSYPOS",
      businessAddress: "123 Main Street, Chicago",
      theme: "dark",
    });
    console.log("✅ Settings seeded");

    console.log("\n🎉 ALL DATA SEEDED SUCCESSFULLY!");
    return { success: true };

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}