import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  deleteField,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  onDisconnect,
  set,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCt1vcjo9Eu_MxnZjh-0DvlyYeitWR4quQ",
  authDomain: "chill-chat-46b6a.firebaseapp.com",
  projectId: "chill-chat-46b6a",
  storageBucket: "chill-chat-46b6a.firebasestorage.app",
  messagingSenderId: "840687909862",
  appId: "1:840687909862:web:f2f8c339afad3fd0087427",
  measurementId: "G-ZPQT3L9QR2",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// EXPORTS
export { auth, updateProfile, updateDoc, rtdb, set, onDisconnect, ref };

// Collection and Document references
export const getCollectionRef = (colName) => collection(db, colName);
export const getDocRef = (colName, docId) => doc(db, colName, docId);

// CRUD operations
export const createDoc = (colName, data) =>
  addDoc(collection(db, colName), data);
export const setDocument = (colName, docId, data) =>
  setDoc(doc(db, colName, docId), data);
export const getDocument = (colName, docId) => getDoc(doc(db, colName, docId));
export const getAllDocuments = (colName) => getDocs(collection(db, colName));
export const updateDocument = (colName, docId, data) =>
  updateDoc(doc(db, colName, docId), data);
export const deleteDocument = (colName, docId) =>
  deleteDoc(doc(db, colName, docId));
export const removeField = (colName, docId, fieldName) =>
  updateDoc(doc(db, colName, docId), { [fieldName]: deleteField() });

// Real-time listener
export const subscribeToCollection = (colName, callback) =>
  onSnapshot(collection(db, colName), callback);

// Querying
export const runQuery = async (colName, conditions = []) => {
  let q = collection(db, colName);
  conditions.forEach((condition) => {
    q = query(q, condition);
  });
  return await getDocs(q);
};

// Helpers to build query filters
export {
  where,
  orderBy,
  limit,
  query,
  onSnapshot,
  db,
  doc,
  setDoc,
  getDocs,
  collection,
  getDoc,
  serverTimestamp,
};

export async function signUpWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    return { success: true, message: "Sign-up successful!" };
  } catch (error) {
    return { success: false, message: error.code };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return { success: true, message: "Sign-in successful!" };
  } catch (error) {
    return { success: false, message: error.code };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true, message: "Logout Successful" };
  } catch (error) {
    return { success: false, message: error.code };
  }
}

export function observeAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user); // You can update UI or state here
    } else {
      callback(null);
    }
  });
}

export async function subcollectionExists(colName, docId, subColName) {
  const subColRef = collection(db, colName, docId, subColName);
  const snapshot = await getDocs(subColRef);
  return !snapshot.empty;
}

export async function getAllUserNames() {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  const names = snapshot.docs.map((doc) => {
    return { name: doc.data().name, profilePic: doc.data().profilePic };
  });
  return names;
}

export function getFriendlyErrorMessage(error) {
  if (!error) return "Something went wrong. Please try again.";

  const map = {
    "auth/email-already-in-use": "This email is already in use.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/missing-password": "Please enter a password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/invalid-credential": "Incorrect Email or password. Please try again.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
  };

  return map[error] || "An unknown error occurred.";
}
