const NewsModel = require('../models/newsmodel.js');

exports.createNews = async (req, res) => {
    try {
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).json({ success: false, error: "Usuario no autenticado" });
        }

        const result = await NewsModel.createNews(req.body, req.files, userId);

        if (result.success) {
            return res.redirect('/news');
        } else {
            return res.status(500).render('news/create', { error: "Error al crear la noticia." });
        }
    } catch (error) {
        console.error("Error en createNews:", error);
        return res.status(500).render('news/create', { error: "Error inesperado." });
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
