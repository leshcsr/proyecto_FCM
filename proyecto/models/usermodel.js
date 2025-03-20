// models/user.model.js
const { db } = require('../firebase');
const { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');
const bcrypt = require('bcrypt');

const collectionName = 'users';

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

exports.createUser = async (userData) => {
  try {
    const hashedPassword = await hashPassword(userData.contraseña);
    const userRef = doc(collection(db, collectionName));
    await setDoc(userRef, {
      id: userRef.id,
      nombre: userData.nombre,
      apellidos: userData.apellidos,
      casa: userData.casa,
      carrera: userData.carrera,
      fecha_nac: userData.fecha_nac,
      telefono: userData.telefono,
      correo: userData.correo,
      contraseña: hashedPassword,
      intereses: userData.intereses,
      isAdmin: userData.isAdmin || false, // Default to false if not provided
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

exports.getUserByEmail = async (email) => {
  try {
    const usersRef = collection(db, collectionName);
    const q = query(usersRef, where('correo', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
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

exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};