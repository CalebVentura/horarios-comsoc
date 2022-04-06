// Librerías nativas
const fs = require('fs') // Este modulo me permite administrar los archivos locales.  Leer, escribir, etc.
const csvtojson = require('csvtojson');
const _ = require('lodash')

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
    const cursosFacultad = JSON.parse(fs.readFileSync('./cursosFacultad.json', 'utf8'))
    // Expresion regular para codigos de cursos
    const regExpCodCurso = /[BCE][A-Z]{1,2}\d{2,3}/g
    const regExpNomCurso = /^[A-Z]\D+(\((L1|L2|L3)?[,]?(L1|L2|L3)\))?\s?[NMPOQRST](T|P|P\/L|L)\D+/
    const regExpHorarioCurso = /\d{2}[:]/g
    const regExpDocenteCurso = /0([A-Z].+[,].+)/g

    // Buscamos todos los códigos de cursos que hay en el texto extraido
    const arrayCodCursos = dataText.match(regExpCodCurso)
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
            let cursoHallado = ''
            for (const value of Object.values(cursosFacultad)) {
                cursoHallado = value.map((cur) => {
                    if(contenidoCurso.includes(cur.CURSO)){
                        return cur.CURSO
                    } else{
                        return '-'
                    }
                })
            }
            if (cursoHallado !== null) return cursoHallado[5]
            else return '-'
        })()
        const creditos = 3
        const seccion = 'M'
        const tipo = 'T'
        const dia = 'LU'
        const horario = (() => {
            // const hor = contenidoCurso.match(/\d{2}[.:]\d{2}\s?[-]\s?\d{2}[.:]\d{1,2}/g)
            const hor = contenidoCurso.match(regExpHorarioCurso)
            if (hor !== null) return hor.map(h => h.slice(0, -1))
            else {
                // console.log(contenidoCurso)
                return '-'
            }
        })()
        const docente = (() => {
            const doc = contenidoCurso.match(regExpDocenteCurso)
            if (doc !== null) return doc[0].slice(1)
            else {
                // console.log(contenidoCurso)
                return '-'
            }
        })()
        // console.log(horario)

        // En caso de que no encuentre horarios
        //if(typeof horario !== 'object') console.log(cod + ' : ' + horario)

        arrayCursos.push({
            cod,
            nombreCurso,
            creditos,
            seccion,
            tipo,
            dia,
            horario,
            docente,
            // contenidoCurso,
        })

        // dataText = dataText.replace(arrayCodCursos[i], '').replace(contenidoCurso, '')

        //...Por mejorar
    }
    return arrayCursos
}

const agruparCursos = (arrayCursos) => {
    const cursosAgrupados = _.chain(arrayCursos).groupBy("CODIGO").map((value, key) => ({ CODIGO: key, SECCIONES: value })).value()
    for (const curso of cursosAgrupados) {
        curso.SECCIONES = _.chain(curso.SECCIONES).groupBy("SECCION").map((value, key) => ({ SECCION: key, HORARIOS: value })).value()
    }
    return cursosAgrupados
}

const agregaarDiaHora = (horarioCursos) => {
    for (const curso of horarioCursos) {
        const horasx = curso.HORA.match(/[0-9]{2}[:.;]/g).map(hora => parseInt(hora.slice(0, -1)))
        curso.DIAHORA = []
        for ( let i = horasx[0]; i < horasx[1]; i++ ) {
            curso.DIAHORA.push(curso.DIA + i)
        }
    }
    return horarioCursos
}
// Ejecución secuencial de funciones
(async () => {
    // // const pathFile = './files/horarios.pdf'

    // Extrae el contenido del pdf
    // // const dataText = await extraerTexto(pathFile)

    // Generar el objeto de cursos
    // // const arrayCursos = generarObjCursos(dataText)
    // console.log(arrayCursos[45])

    // Guardar el objeto de cursos en un .json
    // // fs.writeFile('./objetoCursos.json', JSON.stringify(arrayCursos), (err) => {
    // //     if (err) throw err;
    // // });

    const horarioCursos = await csvtojson().fromFile(`./files/HORARIO221.csv`)
    const horarioCursosModificado = agregaarDiaHora(horarioCursos)
    fs.writeFile('./horarioCursos.json', JSON.stringify(horarioCursosModificado), (err) => {
        if (err) throw err;
    });

    const cursosAgrupados = agruparCursos(horarioCursos)
    // fs.writeFile('./horarioCursosAgrupados.json', JSON.stringify(cursosAgrupados), (err) => {
    //     if (err) throw err;
    // });
})()
