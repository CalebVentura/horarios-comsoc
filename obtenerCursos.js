const csvtojson = require('csvtojson');
const fs = require('fs');
const _ = require('lodash');

(async () => {
    const planes = fs.readdirSync('./files/planes')

    let cursosPorEspecialidad = {}
    let cursosTotalesFacultad = []

    for (let i = 0; i < planes.length; i++) {
        const cursosEspecialidad = await csvtojson().fromFile(`./files/planes/planL${i+1}.csv`)
        const cursosEspecialidadArreglados = cursosEspecialidad.map((curso) => {
            cursosTotalesFacultad.push({
                codigo: curso.COD,
                nombre: curso.CURSO
            })
            for (let [key, value] of Object.entries(curso)) {
                if(value === '') {
                    curso[key] = '-'
                }
            }
            return curso
        })
        cursosPorEspecialidad[`L${i+1}`] = cursosEspecialidadArreglados
    }
    cursosTotalesFacultad = _.uniqBy(cursosTotalesFacultad, 'codigo')

    // Crear archivo de cursos por especialidad
    fs.writeFile('./files/cursos/cursosPorEspecialidad.json',JSON.stringify(cursosPorEspecialidad), (err) => {
        if (err) throw err;
    });

    // Crear archivo de cursos totales en la facultad
    fs.writeFile('./files/cursos/cursosTotalesFacultad.json',JSON.stringify(cursosTotalesFacultad), (err) => {
        if (err) throw err;
    });
})()