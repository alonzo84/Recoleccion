const fs = require('fs'); //filesystem
const cheerio = require('cheerio');
const axios = require('axios');
const csvParser = require('csv-parser');
const path = require('path');

const folderName = 'mensajes';
const rutaCarpeta = path.join(__dirname, folderName);

// Función para descargar el contenido de una URL
async function downloadUrlContent(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error al descargar ${url}:`, error.message);
    return null;
  }
}

// Función para extraer el texto del elemento con la clase "atributoClaseDelElemento"
function extractElementText(html) {
    const $ = cheerio.load(html);
    const content = $(".docs-title-input");
        return content[0].attribs.value;
}

// Función para guardar el texto en un archivo de texto con un nombre adecuado
function saveTextToFile(fileName, text) {
    const rutaArchivo = path.join(rutaCarpeta, fileName);
    if (!fs.existsSync(rutaCarpeta)) {
        fs.mkdirSync(rutaCarpeta);
      }
  fs.writeFile(rutaArchivo, text, (err) => {
    if (err) {
      console.error(`Error al guardar ${fileName}:`, err);
    } else {
      console.log(`Archivo ${fileName} guardado exitosamente.`);
    }
  });
}

// Función principal para procesar el archivo CSV
function processCsvFile(csvFilePath) {
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on('data', async (col) => {
      const url = col['vinculo'];
      const fileName = `archivo_${Date.now()}.txt`; // Nombre del archivo con marca de tiempo actual

      console.log(`Procesando ${url}...`);
      const html = await downloadUrlContent(url);
      
      if (html) {
        const extractedText = extractElementText(html);
        saveTextToFile(fileName, extractedText);
      }
    })
    .on('end', () => {
      console.log('Procesamiento finalizado.');
    });
}

// Llamada a la función principal con el archivo CSV especificado
const csvFilePath = 'vinculos.csv'; // Cambia esto con la ruta de tu archivo CSV
processCsvFile(csvFilePath);``
