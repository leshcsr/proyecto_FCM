const { db, storage } = require('../firebase');
const { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { v4: uuidv4 } = require('uuid');

/**
 * Sube imágenes a Firebase Storage y devuelve sus URLs
 * @param {Array} files - Archivos de imágenes recibidos de `multer`
 * @returns {Array} URLs de las imágenes subidas
 */
const uploadImages = async (files, postId) => {
    if (!storage) {
        throw new Error("Firebase Storage no está inicializado correctamente.");
    }

    const imageUrls = [];

    for (const file of files) {
        try {
            // Subir imagen a Storage
            const imageId = uuidv4();
            const storageRef = ref(storage, `news_images/${imageId}-${file.originalname}`);
            await uploadBytes(storageRef, file.buffer);
            const url = await getDownloadURL(storageRef);
            imageUrls.push(url);

            // Guardar la imagen en Firestore dentro de `photos`
            await addDoc(collection(db, "photos"), {
                postId,   // Referencia a la noticia
                imageUrl: url,    // URL de la imagen en Storage
                createdAt: new Date().toISOString(),
            });

        } catch (error) {
            console.error("Error subiendo imagen:", error);
        }
    }

    return imageUrls;
};

/**
 * Crea una noticia en Firestore, subiendo imágenes si existen
 * @param {Object} newsData - Datos del formulario de la noticia
 * @param {Array} files - Archivos de imágenes recibidos
 */
exports.createNews = async (newsData, files, userId) => {
    try {
        // Crear la noticia en Firestore
        const newPost = {
            title: newsData.title,
            recipient: newsData.recipient,
            createdAt: new Date().toISOString(),
            userId: userId.id,
            images: [],
        };

        const postRef = await addDoc(collection(db, "news"), newPost);
        const postId = postRef.id;

        let imageUrls = [];
        if (files && files.length > 0) {
            imageUrls = await uploadImages(files, postId);
        }

        // Actualizar la noticia con las imágenes
        await updateDoc(doc(db, "news", postId), {
            images: imageUrls
        });

        // Si la noticia tiene fecha y hora, guardarla en `calendar_events`
        if (newsData.eventDate && newsData.eventTime) {
            try {
                const event = {
                    postId,
                    title: newsData.title,
                    eventDateTime: `${newsData.eventDate}T${newsData.eventTime}:00Z`,
                    time: newsData.eventTime,
                    location: newsData.location || "", 
                    createdAt: new Date().toISOString(),
                };

                await addDoc(collection(db, "calendar_events"), event);
            } catch (error) {
                console.error("❌ Error guardando en calendar_events:", error);
            }
        } else {
            console.log("❌ NO se cumple la condición para guardar en calendar_events");
        }

        return { success: true, postId };
    } catch (error) {
        console.error("Error al crear la noticia:", error);
        return { success: false, error };
    }
};

