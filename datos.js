
var sanitarios = [
    {id:1,nombre:"maria",apellidos:"lopez",usuario:"m",password:"ml"},
    {id:2,nombre:"joan",apellidos:"moral lopez",usuario:"j",password:"jm"},
    {id:3,nombre:"luis",apellidos:"alvarez mira",usuario:"l",password:"la"}

];

var gestores = [
    {id:1,nombre:"joan",apellidos:"alvarez mira",usuario:"l",password:"ja"}

];

var ubicaciones = [
{ id: 1, nombre: "Planta 3 - Almacén" },
{ id: 2, nombre: "Urgencias - Sala 5" },
{ id: 3, nombre: "Laboratorio Central" }
];

var categorias = [
{ id: 1, nombre: "Termómetros" },
{ id: 2, nombre: "Estetoscopios" },
{ id: 3, nombre: "Sillas de ruedas" }
];

var modelos = [
{ id: 1, nombre: "Termómetro infrarrojo Omron", categoria: 1, horas_maximas: 48 },
{ id: 2, nombre: "Estetoscopio Littmann Classic III", categoria: 2, horas_maximas: 72 },
{ id: 3, nombre: "Silla de ruedas plegable Invacare", categoria: 3, horas_maximas: 120 }
];

var recursos = [
{ id: 1, modelo: 1, ubicacion: 1, numero_serie: "TIR-2025-001", estado: 0 },  { id: 2, modelo: 1, ubicacion: 2, numero_serie: "TIR-2025-002", estado: 2 },
{ id: 3, modelo: 2, ubicacion: 3, numero_serie: "LIT-9876-23", estado: 0 },
{ id: 4, modelo: 3, ubicacion: 1, numero_serie: "SILLA-45-B", estado: 0 },{id:5,modelo:2,ubicacion:2,numero_serie :"LIT-9878-25",estado:0},
{id:6,modelo:2,ubicacion:3,numero_serie :"LIT-9877-24",estado:0}
];

var reservas = [
    {
        id: 1,
        recurso: 1,
        sanitario: 1,
        horas_estimadas: 3,
        fecha_peticion: new Date("2026-03-23T16:00:00"),
        fecha_inicio: null,
        fecha_fin: null
    },
    {
        id: 2,
        recurso: 3,
        sanitario: 1,
        horas_estimadas: 2,
        fecha_peticion: new Date("2026-03-22T10:00:00"),
        fecha_inicio: new Date("2026-03-22T11:00:00"),
        fecha_fin: new Date("2026-03-22T13:00:00")
    },
    {
        id: 3,
        recurso: 2,
        sanitario: 1,
        horas_estimadas: 2,
        fecha_peticion: new Date("2026-03-25T17:30:00"),
        fecha_inicio: null,
        fecha_fin: null
    },
    {
        id: 4,
        recurso: 3,
        sanitario: 1,
        horas_estimadas: 4,
        fecha_peticion: new Date("2026-03-23T18:00:00"),
        fecha_inicio: new Date("2026-03-29T10:00:00"),
        fecha_fin: null
    },
    {
        id: 5,
        recurso: 1,
        sanitario: 2,
        horas_estimadas: 3,
        fecha_peticion: new Date("2026-03-20T09:00:00"),
        fecha_inicio: new Date("2026-03-20T10:00:00"),
        fecha_fin: new Date("2026-03-20T13:00:00")
    },
    {
        id: 21,
        recurso: 1,
        sanitario: 2,
        horas_estimadas: 4,
        fecha_peticion: new Date("2026-03-23T14:00:00"),
        fecha_inicio: new Date("2026-03-29T08:00:00"),
        fecha_fin: null
    },
    {
        id: 6,
        recurso: 4,
        sanitario: 3,
        horas_estimadas: 5,
        fecha_peticion: new Date("2026-03-21T08:00:00"),
        fecha_inicio: new Date("2026-03-21T09:00:00"),
        fecha_fin: new Date("2026-03-21T14:00:00")
    },
    {
        id: 7,
        recurso: 4,
        sanitario: 3,
        horas_estimadas: 2,
        fecha_peticion: new Date("2026-03-29T09:00:00"),
        fecha_inicio: null,
        fecha_fin: null
    }
];

var resenyas = [
    {
        id: 1,
        recurso: 1,
        sanitario: 1,
        fecha: new Date("2026-03-22T14:00:00"),
        valor: 4,
        descripcion: "Funciona bien, pero tarda unos segundos en estabilizar la lectura"
    },
    {
        id: 2,
        recurso: 1,
        sanitario: 2,
        fecha: new Date("2026-03-20T14:00:00"),
        valor: 5,
        descripcion: "Muy preciso y rápido, totalmente recomendable"
    },
    {
        id: 3,
        recurso: 3,
        sanitario: 1,
        fecha: new Date("2026-03-22T13:30:00"),
        valor: 3,
        descripcion: "Correcto pero el sonido podría ser más nítido"
    },
    {
        id: 4,
        recurso: 4,
        sanitario: 3,
        fecha: new Date("2026-03-21T15:00:00"),
        valor: 5,
        descripcion: "Muy cómoda y fácil de plegar, perfecta para urgencias"
    },
    {
        id: 5,
        recurso: 3,
        sanitario: 2,
        fecha: new Date("2026-03-18T10:00:00"),
        valor: 4,
        descripcion: "Buena calidad de sonido, bien mantenido"
    }
];
module.exports.san=sanitarios
module.exports.ges=gestores
module.exports.ubi=ubicaciones
module.exports.mod=modelos
module.exports.cat=categorias
module.exports.rec=recursos
module.exports.res=reservas
module.exports.resn=resenyas
