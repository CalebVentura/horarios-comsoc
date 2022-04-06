const fs = require('fs');

const posiblesCursos = ['BMA22', 'EE418', 'EE420', 'EE428', 'EE522', 'EE647']
const seccionesGenerales = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']


const cursosHorario = JSON.parse(fs.readFileSync('./horarioCursos.json', 'utf8'))

let cursos = []
for (codigo of posiblesCursos) {
    cursos.push(cursosHorario.filter((curso) => curso.CODIGO === codigo))
}

// fs.writeFile('./cursosPrueba.json',JSON.stringify(cursos), (err) => {
//     if (err) throw err;
// });

let horarioTotales = []

for (const sec of seccionesGenerales) {

    let horarios = []

    for (const curso of cursos[0]) {
        if (curso.SECCION === 'M') horarios.push(curso)
    }

    let texto = [
        { codigo: 'EE712', seccion: 'M' },
    ]

    for (let i = 1; i < 3; i++) {
        const secc = cursos[i].filter(cur => cur.SECCION === sec)
        if (typeof secc[0] !== 'undefined') {
            let interseccion = [0]
            secc.forEach(elem => {
                horarios.forEach(dh => {
                    // console.log(elem.DIAHORA)
                    inter = dh.DIAHORA.filter(b => {
                        // console.log(b);
                        return elem.DIAHORA.includes(b)
                    })
                    interseccion.push(inter.length)
                })
            })
            const suma = interseccion.reduce((summa, elem) => summa + elem)
            if (suma === 0) {
                texto.push({ codigo: secc[0].CODIGO, seccion: secc[0].SECCION })
                secc.forEach(elem => horarios.push(elem))
                // horarioTotales = [...horarioTotales, horarios]
                // console.log(texto)
            }
            // console.log(interseccion)
            // console.log(suma)
            // console.log(horarios.length + '\n\n')
        }
    }
    console.log(texto)
}
