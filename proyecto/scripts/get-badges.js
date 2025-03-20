const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://github.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/wiki#listado-de-rangos';
const BADGES_DIR = path.join(__dirname, '../public/badges');

//if (!fs.existsSync(BADGES_DIR)) {
//  fs.mkdirSync(BADGES_DIR);
//}

(async () => {
  try {
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);
    let badges = [];

    $('.markdown-body tbody tr').each((index, element) => {
        const columns = $(element).find('td');
  
        const rango = $(columns[2]).text().trim();
        const bitpoints = parseInt($(columns[3]).text().trim(), 10);
        const png = $(columns[1]).find('img').attr('src');
  
        if (rango && !isNaN(bitpoints) && png) {
          badges.push({
            rango,
            bitpoints_min: badges.length > 0 ? badges[badges.length - 1].bitpoints_max + 1 : 0, // Rango inferior
            bitpoints_max: bitpoints,
            png,
          });
        }
    });

    const badgesPath = path.join(__dirname, '../badges.json');
    fs.writeFileSync(badgesPath, JSON.stringify(badges, null, 2));
    console.log('Medallas extraídas y guardadas en badges.json');

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
