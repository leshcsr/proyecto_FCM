const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://github.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/wiki#listado-de-rangos';
const BADGES_DIR = path.join(__dirname, '../public/badges');

// Crear la carpeta badges/ si no existe
//if (!fs.existsSync(BADGES_DIR)) {
//  fs.mkdirSync(BADGES_DIR);
//}

(async () => {
  try {
    // Descargar contenido de la página
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);

    // Crear el array de medallas
    let badges = [];
    $('.markdown-body ul li').each((index, element) => {
      const text = $(element).text().trim();
      const png = $(element).find('img').attr('src');

      // Parsear rango y bitpoints
      const match = text.match(/(.+?):\s+(\d+)-(\d+)/);
      if (match) {
        const rango = match[1].trim();
        const bitpoints_min = parseInt(match[2], 10);
        const bitpoints_max = parseInt(match[3], 10);
        const badgeData = {
          rango,
          bitpoints_min,
          bitpoints_max,
          png: png ? png.replace('large', 'min') : null, // Usar la versión pequeña
        };
        badges.push(badgeData);
      }
    });

    // Guardar las medallas en un archivo JSON
    const badgesPath = path.join(__dirname, '../badges.json');
    fs.writeFileSync(badgesPath, JSON.stringify(badges, null, 2));
    console.log('Medallas extraídas y guardadas en badges.json');

    // Descargar las imágenes de las medallas
    for (const badge of badges) {
      if (badge.png) {
        const imagePath = path.join(BADGES_DIR, path.basename(badge.png));
        const imageResponse = await axios({
          url: badge.png,
          method: 'GET',
          responseType: 'stream',
        });

        imageResponse.data.pipe(fs.createWriteStream(imagePath));
        console.log(`Imagen descargada: ${badge.png}`);
      }
    }
    console.log('Todas las imágenes han sido descargadas.');
  } catch (error) {
    console.error('Error al procesar las medallas:', error);
  }
})();
