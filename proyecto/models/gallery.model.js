const { db } = require("../firebase");
const { collection, getDocs, orderBy, query } = require("firebase/firestore");

exports.getAllPhotos = async () => {
    try {
        const photosRef = collection(db, "photos");
        const q = query(photosRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener fotos:", error);
        throw error;
    }
};
