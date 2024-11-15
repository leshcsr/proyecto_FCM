const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
  const url = 'https://tinkererway.dev/web_skill_trees/electronics_skill_tree'; // URL donde se encuentran las competencias
  const response = await axios.get(url);
  const $ = cheerio.load(response.data); // Cargar HTML

  // Crear un array para almacenar las competencias
  let competencias = [];

  // Buscar cada competencia
  $('.svg-wrapper').each((index, element) => {
    const id = $(element).attr('data-id'); // Usamos el índice para el id
    const texto = $(element).find('.tspan').text().trim(); // Suponiendo que el texto tiene esta clase
    const iconoRelativo = $(element).find('image').attr('href'); // Suponiendo que los iconos están en una etiqueta <img>

 // Asegurar que la URL del icono sea completa si es relativa
 const icono = iconoRelativo ? new URL(iconoRelativo, url).href : null;


    // Agregar a la lista de competencias
    competencias.push({
      id: parseInt(id, 10),
      text: texto,
      icon: icono,
      description: 'Descripción de la competencia', // Puedes agregar más lógica para obtener descripciones si es necesario
    });
  });

  // Escribir los datos a un archivo JSON
  fs.writeFileSync('competencias.json', JSON.stringify(competencias, null, 2));
  console.log('Datos de las competencias guardados en competencias.json');
}

scrape().catch(console.error);
