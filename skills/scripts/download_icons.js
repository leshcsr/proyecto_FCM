const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadIcons() {
  const competencias = JSON.parse(fs.readFileSync('competencias.json', 'utf8')); 
  let count = 0;

  for (const competencia of competencias) {
    const iconUrl = competencia.icon;
    const iconName = `icon${competencia.id}.svg`; 

    try {
      const response = await axios.get(iconUrl, { responseType: 'arraybuffer' });
      const iconPath = path.join(__dirname, '../public/icons', iconName);
      fs.writeFileSync(iconPath, response.data);

      console.log(`Éxito al descargar ${iconName}`);
      count++;
    } catch (error) {
      console.log(`Error al descargar ${iconName}: ${error.message}`);
    }
  }

  console.log(`Se han descargado ${count} iconos.`);
}

downloadIcons().catch(console.error);
