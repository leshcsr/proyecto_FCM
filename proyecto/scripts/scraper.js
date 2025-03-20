const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://tinkererway.dev/web_skill_trees/electronics_skill_tree';

async function scrape() {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let competencias = [];

    $('.svg-wrapper').each((index, element) => {
      const id = $(element).attr('data-id');
      const texto = $(element).find('svg tspan').text().trim();
      const iconoRelativo = $(element).find('image').attr('href');

      const icono = iconoRelativo ? new URL(iconoRelativo, url).href : null;

      competencias.push({
        id: parseInt(id, 10),
        text: texto,
        icon: icono,
      });
    });


    fs.writeFileSync('competencias.json', JSON.stringify(competencias, null, 2));
    console.log('Datos de las competencias guardados en competencias.json');
  } catch (error){
    console.log("Error al extraer los datos: ", error);
  }

}

scrape().catch(console.error);
