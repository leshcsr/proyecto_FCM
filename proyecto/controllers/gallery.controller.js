const galleryModel = require("../models/gallery.model");

exports.getGallery = async (req, res) => {
    try {
        const images = await galleryModel.getAllPhotos();
        res.render("gallery", { images, currentView: "gallery" });
    } catch (error) {
        console.error("Error al obtener la galería:", error);
        res.status(500).send("Error al cargar la galería.");
    }
};
exports.getNews = async (req, res) => {
    try {
        const news = await NewsModel.getAllNews();
        res.render('news', { news, currentView: 'news' });
    } catch (error) {
        console.error("Error obteniendo noticias:", error);
        res.status(500).send("Error al cargar las noticias.");
    }
};