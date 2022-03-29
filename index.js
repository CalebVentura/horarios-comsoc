// Librerías nativas
const fs = require('fs')

// Librería de terceros
const reader = require('any-text');

// Funcion de extraer texto del pdf
const extraerTexto = async (pathFile) => {
    let dataText = ''
    await reader.getText(pathFile).then(function (data) {
        dataText += data.replace(/(\n|\r|\t|\s{2,})/g, ' ')
    });
    return dataText
}

// Ejecución secuencial de funciones
(async () => {
    const pathFile = './horarios.pdf'

    // Extrae el contenido del pdf
    const dataText = await extraerTexto(pathFile)

    // Guardar el texto extraido en un .txt
    fs.writeFile('./texto.txt', dataText, (err) => {
        if (err) throw err;
    });
})()
