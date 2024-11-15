const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
  const url = 'https://tinkererway.dev/web_skill_trees/electronics_skill_tree';
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  let competencias = [];

  $('.svg-wrapper').each((index, element) => {
    const id = $(element).attr('data-id');
    const texto = $(element).find('.tspan').text().trim();
    const iconoRelativo = $(element).find('image').attr('href');

 const icono = iconoRelativo ? new URL(iconoRelativo, url).href : null;

    competencias.push({
      id: parseInt(id, 10),
      text: texto,
      icon: icono,
      description: 'Descripción de la competencia',
    });
  });


  fs.writeFileSync('competencias.json', JSON.stringify(competencias, null, 2));
  console.log('Datos de las competencias guardados en competencias.json');
}

scrape().catch(console.error);
