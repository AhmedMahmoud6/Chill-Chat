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
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

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

// EXPORTS
export { auth };

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
export { where, orderBy, limit };

export async function signUpWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User signed up:", userCredential.user);
    return { success: true, message: "Sign-up successful!" };
  } catch (error) {
    console.error("Sign-up error:", error.message);
    return { success: false, message: error.message };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User signed in:", userCredential.user);
    return { success: true, message: "Sign-in successful!" };
  } catch (error) {
    console.error("Sign-in error:", error.message);
    return { success: false, message: error.message };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    console.log("User signed out");
    return { success: true, message: "Logout Successful" };
  } catch (error) {
    console.error("Logout Error: ", error.message);
    return { success: false, message: error.message };
  }
}

export function observeAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in:", user.email);
      callback(user); // You can update UI or state here
    } else {
      console.log("User is signed out");
      callback(null);
    }
  });
}
