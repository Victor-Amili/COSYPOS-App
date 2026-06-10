// src/services/authService.js
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

/**
 * Login existing user
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Safely look up the Firestore document
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;

    if (!userData) {
      throw new Error("User data profile not found in database.");
    }

    // Get fresh token with custom claims
    const idTokenResult = await user.getIdTokenResult(true);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        ...userData,
        role: idTokenResult.claims.role || userData.role || "staff",
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
};

/**
 * Get current user with role safely
 */
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const idTokenResult = await user.getIdTokenResult(true);
    const userData = userDoc.exists() ? userDoc.data() : null;

    return {
      uid: user.uid,
      email: user.email,
      ...userData,
      role: idTokenResult.claims.role || userData?.role || "staff",
    };
  } catch (error) {
    console.error("Error inside getCurrentUser:", error);
    return null;
  }
};

/**
 * Listen to auth state changes safely
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const idTokenResult = await user.getIdTokenResult(true);
        const userData = userDoc.exists() ? userDoc.data() : null;

        callback({
          uid: user.uid,
          email: user.email,
          ...userData,
          role: idTokenResult.claims.role || userData?.role || "staff",
        });
      } catch (error) {
        console.error("Error processing auth state change profile:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

/**
 * Update user permissions
 */
export const updateUserPermissions = async (uid, permissions) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      permissions,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Update permissions error:", error);
    throw error;
  }
};
