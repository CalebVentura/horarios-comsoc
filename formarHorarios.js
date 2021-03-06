// NATIVOS
const fs = require('fs');

// TERCEROS
const _ = require('lodash')

// cursos que el usuario puede o quiere llevar
const posiblesCursos = ['EE467', 'EE530', 'EE590', 'BEG06']

// Funcion para agrupar cursos por CODIGO
const cantidadDeCursosDistintos = (arrayCursos) => {
    const cursosAgrupados = _.chain(arrayCursos)
        .groupBy("CODIGO")
        .map((value, key) => (key)).value()
    return cursosAgrupados.length
}

// Funcion para obtener las secciones distintas de un solo curso
const obtenerSeccionesDistintas = (arrayCursos) => {
    const cursosAgrupados = _.chain(arrayCursos)
        .groupBy("SECCION")
        .map((value, key) => (key)).value()
    return cursosAgrupados
}

// curso-seccion
const cursoSeccionArbolHorarios = (arrayCursos) => {
    const cursosAgrupados = _.chain(arrayCursos)
        .groupBy("CODIGO")
        .map((value, key) => ({ CODIGO: key, SECCION: value.SECCION })).value()
    return cursosAgrupados.length
}

// Obtener los cursos-seccion de los horarios generales
const cursosHorario = JSON.parse(fs.readFileSync('./horarioCursos.json', 'utf8'))

// Arreglo de todos los cursos-seccion que coinciden con lo ingresado por el usuario
let cursos = []
for (codigo of posiblesCursos) {
    cursos.push(cursosHorario.filter((curso) => curso.CODIGO === codigo))
}

// Arbol de horarios
let horariosTotales = [[]]

// El arbol empieza con curso 0 seccion M
for (const curso of cursos[0]) {
    if (curso.SECCION === 'M') horariosTotales[0].push(curso)
}

// bucle por cursos
for (let i = 1; i < cursos.length; i++) {

    const seccionesDelCurso = obtenerSeccionesDistintas(cursos[i])

    // bucle por secciones de cada curso
    for (const sec of seccionesDelCurso) {
        // Obtener un array de horarios con el curso y sección especificada
        // cursos[i] contiene los horarios del curso específico con todas las secciones
        const cursoSecc = cursos[i].filter(cur => cur.SECCION === sec)

        if (typeof cursoSecc[0] !== 'undefined') {

            // Buscar intersecciones
            // El curso i se coompara con los arreglos dentro de horarioTotales donde la cantida dde cursos sea i

            // Obtenemos los arreglos de horarioTotales de donde la cantidad de cursos sea i
            const horariosDeLongitudi = horariosTotales.filter(hor => {
                const cursosDistintos = cantidadDeCursosDistintos(hor)
                return cursosDistintos === i
            })

            // recorremos cada arreglo donde la cantidad de cursos sea i
            for (const horarioDeLongitudi of horariosDeLongitudi) {
                // variable que me indicará la cantidad de cruces
                let interseccion = [0]

                //  Buscando cruuces.El curso-dia-hora que añadiré no se cruza con otros ya existentes en el arreglo de cantidad de cursos i
                cursoSecc.forEach(horarioCursoSecc => {
                    horarioDeLongitudi.forEach(objHorarioDeLongitudi => {
                        const inter = objHorarioDeLongitudi.DIAHORA.filter(b => horarioCursoSecc.DIAHORA.includes(b))
                        interseccion.push(inter.length)
                    })
                })

                const suma = interseccion.reduce((summa, elem) => summa + elem)
                if (suma === 0) horariosTotales.push([...cursoSecc, ...horarioDeLongitudi])
            }
        }
    }
}

const textoMostrar = []
horariosTotales.forEach(hor => {
    let curseccc = hor.map(cur => {
        return { CODIGO: cur.CODIGO, SECCION: cur.SECCION }
    })
    let hash = {}
    curseccc = curseccc.filter(o => hash[o.CODIGO] ? false : hash[o.CODIGO] = true)

    if(curseccc.length === posiblesCursos.length) {
        textoMostrar.push(curseccc)
    }
})

console.log(textoMostrar)