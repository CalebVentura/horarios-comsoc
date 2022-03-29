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

const generarObjCursos = (dataText) => {
    const regExCodCurso = /[BCE][A-Z]{1,2}\d{2,3}/g
    const arrayCodCursos = dataText.match(regExCodCurso)
    let arrayContenidoCursos = []
    for (let i = 0; i<arrayCodCursos.length; i++) {
        arrayContenidoCursos.push(arrayCodCursos[i] + ' ' + dataText.split(arrayCodCursos[i])[1].split(arrayCodCursos[i + 1])[0].trim())
    }
    console.log(arrayContenidoCursos)
    // Aquí abajo recorremos cada uno de esos elementos del  arrayContenidoCursos para generar el objeto de cada curso

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

    // Generar el objeto de cursos
    generarObjCursos(dataText)
})()
