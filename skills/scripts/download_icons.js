const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadIcons() {
  const competencias = JSON.parse(fs.readFileSync('competencias.json', 'utf8')); // Leer el archivo de competencias
  let count = 0;

  for (const competencia of competencias) {
    const iconUrl = competencia.icon;
    const iconName = `icon${competencia.id}.svg`; // Crear nombre para cada icono

    try {
      const response = await axios.get(iconUrl, { responseType: 'arraybuffer' });
      const iconPath = path.join(__dirname, '../public/icons', iconName);
      fs.writeFileSync(iconPath, response.data); // Guardar el icono

      console.log(`Éxito al descargar ${iconName}`);
      count++;
    } catch (error) {
      console.log(`Error al descargar ${iconName}: ${error.message}`);
    }
  }

  console.log(`Se han descargado ${count} iconos.`);
}

downloadIcons().catch(console.error);
