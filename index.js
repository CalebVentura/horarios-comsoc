// Librerías nativas
const fs = require('fs') // Este modulo me permite administrar los archivos locales.  Leer, escribir, etc.

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
    for (let i = 0; i < arrayCodCursos.length; i++) {

        // Para visualizar el contenido de cada curso (linea)
        const contenidoCurso = dataText.split(arrayCodCursos[i])[1].split(arrayCodCursos[i + 1])[0].trim()

        // Al arreglo arrayCursos le añadimos objetos que contengan los datos de cada curso
        const cod = arrayCodCursos[i]
        const nombreCurso = (() => {
            const nom = contenidoCurso.match(/^[A-Z]\D+(\((L1|L2|L3)?[,]?(L1|L2|L3)\))?\s?[NMPOQRST](T|P|P\/L|L)\D+/)
            if (nom !== null) return nom[0].slice(0, -2)
            else {
                // console.log(contenidoCurso)
                return ''
            }
        })()
        const seccion = 'M'
        const tipo = 'T'
        const dia = 'LU'
        const horario = (() => {
            // const hor = contenidoCurso.match(/\d{2}[.:]\d{2}\s?[-]\s?\d{2}[.:]\d{1,2}/g)
            const hor = contenidoCurso.match(/\d{2}[:]/g)
            if (hor !== null) return hor.map(h => h.slice(0, -1))
            else {
                // console.log(contenidoCurso)
                return ''
            }
        })()
        const docente = (() => {
            const doc = contenidoCurso.match(/0([A-Z].+[,].+)/g)
            if (doc !== null) return doc[0].slice(1)
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
            nombreCurso,
            seccion,
            tipo,
            dia,
            horario,
            docente,
            // contenidoCurso,
        })

        dataText = dataText.replace(arrayCodCursos[i], '').replace(contenidoCurso, '')

        //...Por mejorar
    }
    return arrayCursos
}

const agruparCursos = (arrayCursos) => {
    let nuevoArray = []
    let arrayTemporal = []
    for (let i = 0; i < arrayCursos.length; i++) {
        arrayTemporal = nuevoArray.filter(resp => resp["Nombre"] === arrayCursos[i]["cod"])
        if (arrayTemporal.length > 0) {
            nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["secciones"].push(arrayCursos[i])
        } else {
            nuevoArray.push({ "Nombre": arrayCursos[i]["cod"], "secciones": [arrayCursos[i]] })
        }
    }

    return nuevoArray
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
    console.log(arrayCursos[45])

    // Guardar el objeto de cursos en un .json
    fs.writeFile('./objetoCursos.json', JSON.stringify(arrayCursos), (err) => {
        if (err) throw err;
    });

    const cursosAgrupados = agruparCursos(arrayCursos)
    fs.writeFile('./cursosAgrupados.json', JSON.stringify(cursosAgrupados), (err) => {
        if (err) throw err;
    });
})()
