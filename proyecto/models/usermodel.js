// models/user.model.js
import { db } from '../firebase.js';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

const collectionName = 'users'; // Nombre de la colección en Firestore

export const createUser = async (userData) => {
  try {
    const userRef = doc(collection(db, collectionName));
    await setDoc(userRef, {
      id: userRef.id, // Incluye el ID generado por Firestore
      ...userData,
    });
    return { id: userRef.id, ...userData };
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const userRef = doc(db, collectionName, id);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const userRef = doc(db, collectionName, id);
    await updateDoc(userRef, userData);
    return { id, ...userData };
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const userRef = doc(db, collectionName, id);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    throw error;
  }
};