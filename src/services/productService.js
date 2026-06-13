// src/services/productService.js
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
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase/config";

const productsRef = collection(db, "products");
const categoriesRef = collection(db, "categories");

// ==================== CATEGORIES ====================

/**
 * Get all categories
 */
export const getAllCategories = async () => {
  try {
    const q = query(categoriesRef, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get categories error:", error);
    throw error;
  }
};

/**
 * Add new category
 */
export const addCategory = async (categoryData, iconFile = null) => {
  try {
    let iconUrl = categoryData.icon || "";

    if (iconFile) {
      const storageRef = ref(storage, `categories/${Date.now()}_${iconFile.name}`);
      await uploadBytes(storageRef, iconFile);
      iconUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(categoriesRef, {
      ...categoryData,
      icon: iconUrl,
      itemCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add category error:", error);
    throw error;
  }
};

/**
 * Update category
 */
export const updateCategory = async (categoryId, updates, iconFile = null) => {
  try {
    let iconUrl = updates.icon;

    if (iconFile) {
      const storageRef = ref(storage, `categories/${Date.now()}_${iconFile.name}`);
      await uploadBytes(storageRef, iconFile);
      iconUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, "categories", categoryId), {
      ...updates,
      icon: iconUrl || updates.icon,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Update category error:", error);
    throw error;
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId) => {
  try {
    // Check if products use this category
    const q = query(productsRef, where("categoryId", "==", categoryId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error("Cannot delete category with existing products");
    }

    await deleteDoc(doc(db, "categories", categoryId));
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    throw error;
  }
};

// ==================== PRODUCTS ====================

/**
 * Get all products
 */
export const getAllProducts = async () => {
  try {
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get products error:", error);
    throw error;
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId) => {
  try {
    const q = query(
      productsRef,
      where("categoryId", "==", categoryId),
      where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Get products by category error:", error);
    throw error;
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (productId) => {
  try {
    const docSnap = await getDoc(doc(db, "products", productId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Get product error:", error);
    throw error;
  }
};

/**
 * Add new product
 */
export const addProduct = async (productData, imageFile = null) => {
  try {
    let imageUrl = productData.image || "";

    if (imageFile) {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    // Determine stock status
    const stock = productData.stock || 0;
    const stockStatus = stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock";

    const docRef = await addDoc(productsRef, {
      ...productData,
      image: imageUrl,
      stockStatus,
      availability: stock > 0 ? "In Stock" : "Out of Stock",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update category item count
    await updateDoc(doc(db, "categories", productData.categoryId), {
      itemCount: increment(1),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add product error:", error);
    throw error;
  }
};

/**
 * Update product
 */
export const updateProduct = async (productId, updates, imageFile = null) => {
  try {
    let imageUrl = updates.image;

    if (imageFile) {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    // Recalculate stock status if stock changed
    let stockStatus = updates.stockStatus;
    let availability = updates.availability;
    if (updates.stock !== undefined) {
      const stock = updates.stock;
      stockStatus = stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock";
      availability = stock > 0 ? "In Stock" : "Out of Stock";
    }

    await updateDoc(doc(db, "products", productId), {
      ...updates,
      image: imageUrl || updates.image,
      stockStatus,
      availability,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (productId) => {
  try {
    const product = await getProductById(productId);
    if (product?.image) {
      const imageRef = ref(storage, product.image);
      await deleteObject(imageRef).catch(() => {});
    }

    await deleteDoc(doc(db, "products", productId));

    // Update category item count
    if (product?.categoryId) {
      await updateDoc(doc(db, "categories", product.categoryId), {
        itemCount: increment(-1),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};

/**
 * Filter products (for inventory page)
 */
export const filterProducts = async (filters = {}) => {
  try {
    let q = query(productsRef);

    if (filters.status && filters.status !== "all") {
      q = query(q, where("status", "==", filters.status));
    }
    if (filters.category && filters.category !== "all") {
      q = query(q, where("categoryId", "==", filters.category));
    }
    if (filters.stock && filters.stock !== "all") {
      q = query(q, where("stockStatus", "==", filters.stock));
    }
    if (filters.minPrice) {
      q = query(q, where("price", ">=", parseFloat(filters.minPrice)));
    }
    if (filters.maxPrice) {
      q = query(q, where("price", "<=", parseFloat(filters.maxPrice)));
    }

    const snapshot = await getDocs(q);
    let products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Client-side sorting
    if (filters.sortBy === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === "stock") {
      products.sort((a, b) => a.stock - b.stock);
    }

    return products;
  } catch (error) {
    console.error("Filter products error:", error);
    throw error;
  }
};

/**
 * Update stock (used by Cloud Function after order completion)
 */
export const updateStock = async (productId, quantityChange) => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) return;

    const currentStock = productSnap.data().stock || 0;
    const newStock = Math.max(0, currentStock + quantityChange);
    const stockStatus = newStock === 0 ? "out-of-stock" : newStock <= 5 ? "low-stock" : "in-stock";
    const availability = newStock > 0 ? "In Stock" : "Out of Stock";

    await updateDoc(productRef, {
      stock: newStock,
      stockStatus,
      availability,
      updatedAt: serverTimestamp(),
    });

    // Create low stock notification
    if (newStock <= 5 && currentStock > 5) {
      await addDoc(collection(db, "notifications"), {
        title: "Low Stock Alert",
        message: `${productSnap.data().name} is running low (${newStock} left)`,
        type: "inventory",
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Update stock error:", error);
    throw error;
  }
};

// Helper for increment (Firestore v9 modular)
const increment = (n) => ({ __op: "increment", __arg: n });
