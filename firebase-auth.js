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
const db = getFirestore(app);

// EXPORTS

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
