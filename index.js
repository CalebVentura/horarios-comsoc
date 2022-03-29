// Librerías nativas
const fs = require('fs')

// Librería de terceros
const reader = require('any-text');

// Funcion de extraer texto del pdf
const extraerTexto = async (pathFile) => {
    // Inicializamos una variable dataText sin contenido
    let dataText = ''

    // Extraemos el texto del pdf
    await reader.getText(pathFile).then(function (data) {

        // A la variable dataText le añadimos todo el texto que resulta del pdf
        // Vamos a reemplazar todo caracter de espacios de más, saltos de linea, tabulaciones, etc por un solo espacio
        dataText += data.replace(/(\n|\r|\t|\s{2,})/g, ' ')
    });
    return dataText
}

const generarObjCursos = (dataText) => {
    // Expresion regular para codigos de cursos
    const regExCodCurso = /[BCE][A-Z]{1,2}\d{2,3}/g

    // Buscamos todos los códigos de cursos que hay en el texto extraido
    const arrayCodCursos = dataText.match(regExCodCurso)

    // console.log(arrayCodCursos)

    // Inicializamos un arreglo vacio donde estarán los objetos de cada curso
    let arrayCursos = []

    // Recorremos cada código de curso
    for (let i = 0; i<arrayCodCursos.length; i++) {

        // Para visualizar el contenido de cada curso (linea)
        const contenidoCurso = dataText.split(arrayCodCursos[i])[1].split(arrayCodCursos[i + 1])[0].trim()

        // Al arreglo arrayCursos le añadimos objetos que contengan los datos de cada curso
        const cod = arrayCodCursos[i]
        const horario = (() => {
            // const hor = contenidoCurso.match(/\d{2}[.:]\d{2}\s?[-]\s?\d{2}[.:]\d{1,2}/g)
            const hor = contenidoCurso.match(/\d{2}[:]/g)
            if (hor !== null) return hor.map(h => h.slice(0,-1))
            else {
                // console.log(contenidoCurso)
                return ''
            }
        })()
        // console.log(horario)

        // En caso de que no encuentre horarios
        //if(typeof horario !== 'object') console.log(cod + ' : ' + horario)

        arrayCursos.push({
            cod,
            horario,
            contenidoCurso,
        })

        dataText = dataText.replace(arrayCodCursos[i], '').replace(contenidoCurso, '')

        //...Por mejorar
    }
    return arrayCursos
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
    const arrayCursos = generarObjCursos(dataText)
    // console.log(arrayCursos)

    // Guardar el objeto de cursos en un .json
    fs.writeFile('./objetoCursos.json', JSON.stringify(arrayCursos), (err) => {
        if (err) throw err;
    });
})()
