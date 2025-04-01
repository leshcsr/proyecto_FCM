const { collection, getDocs } = require("firebase/firestore");
const { db } = require("../firebase");

async function testFirestore() {
    try {
        const newsRef = collection(db, "news");
        const snapshot = await getDocs(newsRef);

        if (snapshot.empty) {
            console.log("❌ No hay documentos en la colección 'news'.");
        } else {
            console.log("✅ Documentos encontrados:");
            snapshot.forEach(doc => console.log(doc.id, "=>", doc.data()));
        }
    } catch (error) {
        console.error("Error accediendo a Firestore:", error);
    }
}

testFirestore();
