console.log("main cargado");

const ubi_select =document.getElementById('ubicacion');
const mod_select = document.getElementById('modelo');
const est_select = document.getElementById('estado');
const cat_select = document.getElementById('categoria');

const ubi_select2 = document.getElementById('ubicacion_rec');
const mod_select2 = document.getElementById('modelo_rec');
const est_select2 = document.getElementById('estado_rec');
const cat_select2 = document.getElementById('categoria_rec');

const renyas_tabla = document.getElementById("lista_resenyas");
const reservas_tabla = document.getElementById("lista_reservas");

var recurso_actual_id = null;
var token = null;

function conToken(url){
    if(url.indexOf("?") == -1){
        return url + "?token=" + token;
    }
    return url + "&token=" + token;
}

var conexionWS = null;
var nombre_gestor_ws = null;
var id_gestor_ws = null;

function conectarWS(id, nombre) {
    id_gestor_ws = id;
    nombre_gestor_ws = nombre;

    conexionWS = new WebSocket("ws://localhost:4444", "avisos");

    conexionWS.addEventListener("open", function() {
        console.log("Ya estoy conectado con el servidor");
        conexionWS.send(JSON.stringify({
            operacion: "identificar",
            tipo: "gestor",
            id: id,
            nombre: nombre
        }));
    });

    conexionWS.addEventListener("message", function(msg) {
        var datos = JSON.parse(msg.data);
        if (datos.operacion === "aviso") {
            anyadirAviso(datos);
        }
    });
}

function desconectarWS() {
    if (conexionWS) {
        conexionWS.close();
        conexionWS = null;
    }
}

function anyadirAviso(datos) {
    var tabla = document.getElementById("lista_avisos");
    var fila = document.createElement("tr");

    if (datos.color === "verde") fila.style.backgroundColor = "#90ee90";
    else if (datos.color === "rojo") fila.style.backgroundColor = "#ff9999";
    else if (datos.color === "azul") fila.style.backgroundColor = "#9999ff";

    var tdFecha = document.createElement("td");
    tdFecha.textContent = datos.fecha;
    var tdOrigen = document.createElement("td");
    tdOrigen.textContent = datos.origen;
    var tdTexto = document.createElement("td");
    tdTexto.textContent = datos.texto;

    fila.appendChild(tdFecha);
    fila.appendChild(tdOrigen);
    fila.appendChild(tdTexto);
    tabla.appendChild(fila);
}

function wsAvisoNuevoRecurso(nombreCategoria, nombreModelo, codigoRecurso) {
    if (!conexionWS) return;
    conexionWS.send(JSON.stringify({
        operacion: "avisoNuevoRecurso",
        nombreCategoria: nombreCategoria,
        nombreModelo: nombreModelo,
        codigoRecurso: codigoRecurso,
        quien: nombre_gestor_ws
    }));
}
function wsAvisoDevolucion(){
    if(!conexionWS) return;
    conexionWS.send(JSON.stringify({
        operacion: "avisoDevolucion",
        quien: nombre_gestor_ws
    }))
}
document.addEventListener("DOMContentLoaded", function(){

    cargarEstados();
    cat_select.addEventListener("change", function(){
            actualizarModelos();
        });
    cat_select2.addEventListener("change", function(){
            actualizarModelos();
        });

});

function anyadir(){
    recurso_actual_id = null;
    cambiarSeccion("recurso");

    document.getElementById("num_serie_rec").value = "";
    document.getElementById("modelo_rec").selectedIndex = 0;
    document.getElementById("categoria_rec").selectedIndex = 0;
    document.getElementById("ubicacion_rec").selectedIndex = 0;
    document.getElementById("estado_rec").selectedIndex = 0;
    document.getElementById("lista_reservas").innerHTML = "";
    document.getElementById("lista_resenyas").innerHTML = "";

    inicializarSelectsRecurso();
}
function inicializarSelectsRecurso() {
    cat_select2.innerHTML = '<option value="">Seleccione categoría</option>';
    categorias_lista.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.nombre;
        cat_select2.appendChild(opt);
    });

    ubi_select2.innerHTML = '<option value="">Seleccione ubicación</option>';
    ubis_lista.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.nombre;
        ubi_select2.appendChild(opt);
    });

    const estados = [
        { id: 0, nombre: "Operativo" },
        { id: 1, nombre: "De baja/defectuoso" },
        { id: 2, nombre: "En mantenimiento" },
    ];

    est_select2.innerHTML = '<option value="">Seleccione estado</option>';
    estados.forEach(e => {
        const option = document.createElement("option");
        option.value = e.id;
        option.textContent = e.nombre;
        est_select2.appendChild(option);
    });

    mod_select2.innerHTML = '<option value="">Primero seleccione categoría</option>';
}
function cargarCategorias(){
    rest.get(conToken("/api/categorias"), function(estado,respuesta){
        if(estado == 200){
            categorias_lista = respuesta;
            rellenarCategorias();
        }
    });
}

function cargarModelos(){
    rest.get(conToken("/api/modelos"), function(estado,respuesta){
        if(estado == 200){
            modelos_lista = respuesta;
        }
    });
}

function cargarUbis(){
    rest.get(conToken("/api/ubicaciones"), function(estado,respuesta){
        if(estado == 200){
            ubis_lista = respuesta;
            rellenarUbicaciones();
        }
    });
}
function cargarEstados() {

    const estados = [
        { id: 0, nombre: "Operativo" },
        { id: 1, nombre: "De baja/defectuoso" },
        { id: 2, nombre: "En mantenimiento" },

    ];

    est_select.innerHTML = '<option value="">Seleccione estado</option>';

    estados.forEach(e => {
        const option = document.createElement("option");
        option.value = e.id;
        option.textContent = e.nombre;
        est_select.appendChild(option);

    });
    const todos = document.createElement("option");
    todos.textContent = "Todos";
    todos.value = "Todos";
    est_select.appendChild(todos);
}

function rellenarCategorias(){
    cat_select.innerHTML = '<option value="">Seleccione categoría</option>';
    categorias_lista.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.nombre;
        cat_select.appendChild(opt);

    });
    const todos = document.createElement("option");
    todos.textContent = "Todos";
    todos.value = "Todos";
    cat_select.appendChild(todos);
}
function rellenarUbicaciones(){
    ubi_select.innerHTML = '<option value="">Seleccione ubicación</option>';
    ubis_lista.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.nombre;
        ubi_select.appendChild(opt);

    });
    const todos = document.createElement("option");
    todos.textContent = "Todos";
    todos.value = "Todos";
    ubi_select.appendChild(todos);
}
function actualizarModelos(){

    var categoriaSeleccionada = document.getElementById("categoria").value;
    var categoriaSeleccionada2 = document.getElementById("categoria_rec").value;
    mod_select.innerHTML = '<option value="">Seleccione modelo</option>';
    mod_select2.innerHTML = '<option value="">Seleccione modelo</option>';
    modelos_lista.forEach(m => {
        if(m.categoria == categoriaSeleccionada){
            var opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.nombre;
            mod_select.appendChild(opt);
        }
    });
    modelos_lista.forEach(m => {
        if(m.categoria == categoriaSeleccionada2){
            var opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.nombre;
            mod_select2.appendChild(opt);
        }
    })
    const todos = document.createElement("option");
    todos.textContent = "Todos";
    todos.value = "Todos";
    mod_select.appendChild(todos);
}

var seccionActual = "login";
var gestor_identificador = "";

    var modelos_lista =  [];
    var ubis_lista = [];
    var categorias_lista = [];
    var recurso = [];
    function login(){
    gestor = {
        usuario : document.getElementById("usuario").value,
        password : document.getElementById("password").value
    };
    rest.post("/api/gestores/login", gestor, function(estado, respuesta){
        if(estado == 200){
            token = respuesta.token;
            gestor_identificador = respuesta.id;
            rest.get(conToken("/api/gestores/" + gestor_identificador), function(estado, respuesta) {
                if(estado == 200) {

                    var nombreCompleto = respuesta.nombre + " " + (respuesta.apellidos || "");
                    window.nombreGestorCompleto = nombreCompleto;
                    conectarWS(gestor_identificador, nombreCompleto);
                    cambiarSeccion("inicio");

                    cargarModelos();
                    cargarUbis();
                    cargarCategorias();
                    cargarRanking();
                    document.getElementById("nombre_gestor").textContent = nombreCompleto;
                } else {

                    window.nombreGestorCompleto = document.getElementById("usuario").value;
                    cambiarSeccion("inicio");
                    cargarModelos();
                    cargarUbis();
                    cargarCategorias();
                    cargarRanking();
                    document.getElementById("nombre_gestor").textContent = window.nombreGestorCompleto;
                }
            });
        } else {
            alert("Error en login: " + (respuesta.error || "Credenciales incorrectas"));
        }
    });
}
    function registro(){
    var gestor = {
        nombre: document.getElementById("nombre_reg").value,
        apellidos: document.getElementById("apellidos_reg").value,
        usuario: document.getElementById("usuario_reg").value,
        password: document.getElementById("contrasenya_reg").value,
    };
    if(gestor.nombre!="" && gestor.apellidos!="" && gestor.usuario!="" && gestor.password!=""){
    if(gestor_identificador === ""){

        rest.post("/api/gestores", gestor, function (estado, respuesta) {
            console.log(respuesta)
            if (estado == 201) {
                cambiarSeccion("login");
            } else {
                alert("Error introduciendo nuevo gestor");
            }
        });
    } else {
        rest.get(conToken("/api/gestores/" + gestor_identificador), function(estado, respuesta) {
            if (estado == 200) {
                var gestorActual = respuesta;
                var usuarioCambiado = (gestorActual.usuario !== gestor.usuario);
                var passwordCambiado = (gestorActual.password !== gestor.password);

                rest.put(conToken("/api/gestores/" + gestor_identificador), gestor, function (estado, respuesta) {
                    if (estado == 201) {

                        if (usuarioCambiado || passwordCambiado) {
                            alert("Usuario o contraseña modificados. Por favor, inicie sesión nuevamente.");
                            gestor_identificador = "";
                            cambiarSeccion("login");
                        } else {
                            cambiarSeccion("inicio");
                        }
                    } else {
                        alert("Error editando gestor");
                    }
                });
            } else {
                alert("Error obteniendo datos del gestor");
            }
        });
    }
}
else{
    alert("Rellene todos los campos.");
    cambiarSeccion("datos_gestor");
}
}
    function cancelar(){
        if(gestor_identificador != ""){
            cambiarSeccion("inicio")
        }else{
            cambiarSeccion("login");
        }
    }
    function editar(){
        cambiarSeccion("datos_gestor");
    }

    function buscar(){
        console.log("entro a buscar");
        var num_serie = "";
        var categoria = document.getElementById("categoria").value;
        console.log(categoria);
        var modelo = document.getElementById("modelo").value;
        var ubicacion = document.getElementById("ubicacion").value;
        var estado = document.getElementById("estado").value
        console.log("numero serie")
        console.log("Entro en la función.")
        rest.get(conToken("/api/recursos?categoria="+categoria+"&modelo="+modelo+"&ubicacion="+ubicacion+"&estado="+estado),function(estado,respuesta){
            var recursos_mostrar = respuesta;
            console.log("RECURSOS RECIBIDOS:", recursos_mostrar);
            console.log("Primer recurso:", recursos_mostrar[0]);
            var lista = document.getElementById("lista_recursos");
            lista.innerHTML="";
            for(var i = 0;i < recursos_mostrar.length;i++){
                var tr = document.createElement("tr");
                var td_numserie = document.createElement("td");
                td_numserie.textContent = recursos_mostrar[i].numero_serie;
                tr.appendChild(td_numserie);
                var td_modelo = document.createElement("td");
                var td_categoria = document.createElement("td");
                var modelo_id = recursos_mostrar[i].modelo;
                var modelo_obj = null;

                for(var j = 0; j < modelos_lista.length; j++){
                    if(modelos_lista[j].id == modelo_id){
                        modelo_obj = modelos_lista[j];
                }
            }
            if(modelo_obj != null){
                td_modelo.textContent = modelo_obj.nombre;

                for(var k = 0; k < categorias_lista.length; k++){
                    if(categorias_lista[k].id == modelo_obj.categoria){
                        td_categoria.textContent = categorias_lista[k].nombre;
                    }
                }
            }
            tr.appendChild(td_categoria);
            tr.appendChild(td_modelo);
                var td_ubi = document.createElement("td");
                var ubi_id = recursos_mostrar[i].ubicacion;
                for(var j = 0; j < ubis_lista.length;j++){
                    if(ubi_id == ubis_lista[j].id){
                        td_ubi.textContent = ubis_lista[j].nombre;
                        console.log("entra en ubi");
                    }
                }
                tr.appendChild(td_ubi);
                var td_estado = document.createElement("td")
                var estado_id = recursos_mostrar[i].estado;
                if(estado_id == 0){
                    td_estado.textContent = "Operativo"
                }else if(estado_id == 1){
                    td_estado.textContent = "De baja/defectuoso."
                }else{
                    td_estado.textContent = "En mantenimiento"
                }
                tr.appendChild(td_estado);
                var boton_abrir = document.createElement("button")
                let identificador_recurso = recursos_mostrar[i].id;
                boton_abrir.addEventListener("click",function(){
                    abrir(identificador_recurso);
                })
                boton_abrir.textContent = "Abrir";
                tr.appendChild(boton_abrir);
                var boton_eliminar = document.createElement("button")
                boton_eliminar.textContent = "X"
                boton_eliminar.addEventListener("click",function(){
                    eliminarRecurso(identificador_recurso);
                })
                tr.appendChild(boton_eliminar);
                lista.appendChild(tr);
            }
        })

    }
    function eliminarRecurso(id){
        rest.delete(conToken("/api/recursos/"+id),function(estado,respuesta){
            if(estado == 200){
                alert("Recurso eliminado");
                buscar();
            }else{
                console.log("ERrro")
            }
        })

    }

    function cambiarSeccion(seccion){
    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;
    if (seccion === "inicio" && window.nombreGestorCompleto) {
        var nombreElement = document.getElementById("nombre_gestor");
        if (nombreElement) {
            nombreElement.textContent = window.nombreGestorCompleto;
        }
    }
    }
    function iniciar_registro(){
        gestor_identificador = "";
        cambiarSeccion("datos_gestor");
        document.getElementById("nombre_reg").value = "";
        document.getElementById("apellidos_reg").value = "";
        document.getElementById("usuario_reg").value = "";
        document.getElementById("contrasenya_reg").value = "";
    }
    function salir(){
        gestor_identificador = "";
        token = null;

        document.getElementById("usuario").value = "";
        document.getElementById("password").value = "";
        desconectarWS();
        lista_avisos.innerHTML = "";
        cambiarSeccion("login");
    }
 function abrir(id){
    var id_recurso = id;
    recurso_actual_id = id;
    cambiarSeccion("recurso");
    rest.get(conToken("/api/recursos/"+id), function(estado, respuesta){
        if(estado == 200){
            console.log(respuesta.numero_serie);

            ubi_select2.innerHTML = "";
            cat_select2.innerHTML = "";
            mod_select2.innerHTML = "";
            est_select2.innerHTML = "";
            document.getElementById("num_serie_rec").value = respuesta.numero_serie;

            var categoria_actual = null;
            for(var i = 0; i < modelos_lista.length; i++){
                if(modelos_lista[i].id == respuesta.modelo){
                    categoria_actual = modelos_lista[i].categoria;
                    break;
                }
            }
            for(var i = 0; i < categorias_lista.length; i++){
                var opt = document.createElement("option");
                opt.value = categorias_lista[i].id;
                opt.textContent = categorias_lista[i].nombre;
                if(categorias_lista[i].id == categoria_actual){
                    opt.selected = true;
                }
                cat_select2.appendChild(opt);
            }

            for(var i = 0; i < modelos_lista.length; i++){
                if(modelos_lista[i].categoria == categoria_actual){
                    var opt = document.createElement("option");
                    opt.value = modelos_lista[i].id;
                    opt.textContent = modelos_lista[i].nombre;
                    if(modelos_lista[i].id == respuesta.modelo){
                        opt.selected = true;
                    }
                    mod_select2.appendChild(opt);
                }
            }

            for(var i = 0; i < ubis_lista.length; i++){
                var opt = document.createElement("option");
                opt.value = ubis_lista[i].id;
                opt.textContent = ubis_lista[i].nombre;
                if(ubis_lista[i].id == respuesta.ubicacion){
                    opt.selected = true;
                }
                ubi_select2.appendChild(opt);
            }

            var estados_aux = [
                {id: 0, nombre: "Operativo"},
                {id: 1, nombre: "De baja/defectuoso"},
                {id: 2, nombre: "En mantenimiento"}
            ];
            for(var i = 0; i < estados_aux.length; i++){
                var opt = document.createElement("option");
                opt.value = estados_aux[i].id;
                opt.textContent = estados_aux[i].nombre;
                if(estados_aux[i].id == respuesta.estado){
                    opt.selected = true;
                }
                est_select2.appendChild(opt);
            }

            rellenarReservas(id_recurso);
            rellenarResenyas(id_recurso);
        }
    });
}
    function rellenarReservas(id){
        var lista_reservas = [];
        rest.get(conToken("/api/recursos/"+id+"/reservas"),function(estado,respuesta){
            if(estado == 200){
                lista_reservas = respuesta;
                reservas_tabla.innerHTML = "";
                console.log("lista reservas" +lista_reservas);
                for(var i = 0 ; i < lista_reservas.length; i++){
                    var fila = document.createElement("tr")
                    var sanitario = document.createElement("td");
                    sanitario.textContent = lista_reservas[i].sanitario;
                    fila.appendChild(sanitario);
                    var horas = document.createElement("td");
                    horas.textContent = lista_reservas[i].horas_estimadas;
                    fila.appendChild(horas);
                    var fecha_pet = document.createElement("td");
                    fecha_pet.textContent = lista_reservas[i].fecha_peticion;
                    fila.appendChild(fecha_pet);
                    var fecha_ini = document.createElement("td");
                    fecha_ini.textContent = lista_reservas[i].fecha_inicio;
                    fila.appendChild(fecha_ini);
                    var fecha_end = document.createElement("td");
                    fecha_end.textContent = lista_reservas[i].fecha_fin;
                    fila.appendChild(fecha_end);
                    if(lista_reservas[i].fecha_fin == null && lista_reservas[i].fecha_inicio == null){
                        fila.style.backgroundColor = "green";
                    }else if(lista_reservas[i].fecha_fin == null){
                        fila.style.backgroundColor = "blue";
                    }
                    reservas_tabla.appendChild(fila);
                }
            }
        })
    }
    function rellenarResenyas(id){
        var lista_resenyas = []
        rest.get(conToken("/api/recursos/"+id+"/resenyas"),function(estado,respuesta){
            if(estado == 200){
                lista_resenyas = respuesta;
                renyas_tabla.innerHTML = "";
                console.log("lista resenyas" + lista_resenyas);
                for(var i = 0; i < lista_resenyas.length; i++){
                var fila = document.createElement("tr");
                var fecha = document.createElement("td");
                fecha.textContent = lista_resenyas[i].fecha;
                fila.appendChild(fecha);

                var sanitario = document.createElement("td");
                sanitario.textContent = lista_resenyas[i].sanitario;
                fila.appendChild(sanitario);

                var valoracion = document.createElement("td");
                valoracion.textContent = lista_resenyas[i].valor + "/5";
                fila.appendChild(valoracion);

                var comentario = document.createElement("td");
                comentario.textContent = lista_resenyas[i].descripcion;
                fila.appendChild(comentario);

                renyas_tabla.appendChild(fila);
            }

            }
    })
}

    function guardar_recurso(){
        var inputNumSerie = document.getElementById("num_serie_rec");
    console.log("INPUT NUMERO SERIE:", inputNumSerie);
    console.log("VALOR DEL INPUT:", inputNumSerie.value);
    var recurso = {
        numero_serie : document.getElementById("num_serie_rec").value,
        modelo : document.getElementById("modelo_rec").value,
        ubicacion : document.getElementById("ubicacion_rec").value,
        estado : document.getElementById("estado_rec").value
    };
    console.log(recurso);

    if(recurso_actual_id != null){

        rest.put(conToken("/api/recursos/" + recurso_actual_id), recurso, function(estado,respuesta){
            if(estado == 200){
                alert("Recurso actualizado");
            }
        });
    } else {
        rest.post(conToken("/api/recursos"), recurso, function(estado,respuesta){
            if(estado == 201){
                alert("Recurso creado");
                var modeloObj = modelos_lista.find(m => m.id == recurso.modelo);
                var categoriaObj = categorias_lista.find(c => c.id == modeloObj.categoria);
                wsAvisoNuevoRecurso(categoriaObj.nombre, modeloObj.nombre, recurso.numero_serie);
            }
        });
    }
}
function volver(){
    cambiarSeccion("inicio");
    document.getElementById("categoria").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("ubicacion").value = "";
    document.getElementById("estado").value = "";
    buscar();
}

var ID_AREA = 6;
var URL_MINISTERIO = "https://undefined.ua.es/telemedicina/api/datos";

function fechaMinisterio(fecha){
    if(fecha == null){
        return null;
    }
    var d = new Date(fecha);
    var mes = d.getMonth() + 1;
    var dia = d.getDate();
    if(mes < 10){
        mes = "0" + mes;
    }
    if(dia < 10){
        dia = "0" + dia;
    }
    return d.getFullYear() + "-" + mes + "-" + dia;
}

function nombreYApellidos(sanitario){
    var espacio = sanitario.indexOf(" ");
    if(espacio == -1){
        return { nombre: sanitario, apellidos: "" };
    }
    return {
        nombre: sanitario.substring(0, espacio),
        apellidos: sanitario.substring(espacio + 1)
    };
}

function enviarMinisterio(){
    rest.get(conToken("/api/categorias"), function(estado, categorias){
        if(estado != 200){
            alert("Error al obtener las categorías");
            return;
        }
        rest.get(conToken("/api/modelos"), function(estado, modelos){
            if(estado != 200){
                alert("Error al obtener los modelos");
                return;
            }
            rest.get(conToken("/api/recursos?categoria=Todos&modelo=Todos&ubicacion=Todos&estado=Todos"), function(estado, recursos){
                if(estado != 200){
                    alert("Error al obtener los recursos");
                    return;
                }
                if(recursos.length == 0){
                    alert("No hay recursos");
                    return;
                }
                var datos = [];
                var contador = 0;
                var error = false;
                for(var i = 0; i < recursos.length; i++){
                    let recurso = recursos[i];
                    rest.get(conToken("/api/recursos/" + recurso.id + "/reservas"), function(estado, reservas){
                        if(estado != 200){
                            error = true;
                        } else {
                            var modelo = modelos.find(m => m.id == recurso.modelo);
                            var categoria = categorias.find(c => c.id == modelo.categoria);
                            for(var j = 0; j < reservas.length; j++){
                                var persona = nombreYApellidos(reservas[j].sanitario);
                                datos.push({
                                    nombre: persona.nombre,
                                    apellidos: persona.apellidos,
                                    "categoría": categoria.nombre,
                                    horas_estimadas: reservas[j].horas_estimadas,
                                    fec_pet: fechaMinisterio(reservas[j].fecha_peticion),
                                    fec_ini: fechaMinisterio(reservas[j].fecha_inicio),
                                    fecha_fin: fechaMinisterio(reservas[j].fecha_fin)
                                });
                            }
                        }
                        contador++;
                        if(contador == recursos.length){
                            if(error){
                                alert("Error al obtener las reservas de algún recurso");
                                return;
                            }
                            subirMinisterio(datos);
                        }
                    });
                }
            });
        });
    });
}

function subirMinisterio(datos){
    var envio = {
        id_area: ID_AREA,
        fecha: fechaMinisterio(new Date()),
        datos: datos
    };
    console.log(envio);
    if(!confirm("¿Enviar " + datos.length + " reservas al Ministerio?")){
        return;
    }
    rest.post(URL_MINISTERIO, envio, function(estado, respuesta){
        if(estado == 200 || estado == 201){
            alert("Reservas enviadas al Ministerio");
        } else {
            alert("Error al enviar las reservas: " + estado);
        }
    });
}

var AREAS = ["", "Alergología", "Anestesiología", "Cardiología", "Cirugía General", "Dermatología",
             "Aparato Digestivo", "Endocrinología", "Ginecología", "Hematología", "Medicina Interna",
             "Neumología", "Neurología", "Oftalmología", "Oncología", "Pediatría", "Psiquiatría",
             "Traumatología", "Urología"];

function fechaValida(fecha){
    return typeof fecha == "string" && !isNaN(new Date(fecha).getTime());
}

function reservaValida(r){
    if(r == null || typeof r != "object"){
        return false;
    }
    if(!r.nombre || !r.apellidos){
        return false;
    }
    if(!r.categoria && !r["categoría"]){
        return false;
    }
    if(isNaN(Number(r.horas_estimadas)) || Number(r.horas_estimadas) <= 0){
        return false;
    }
    if(!fechaValida(r.fec_pet)){
        return false;
    }
    if(r.fec_ini != null && (!fechaValida(r.fec_ini) || new Date(r.fec_ini) < new Date(r.fec_pet))){
        return false;
    }
    if(r.fecha_fin != null && (r.fec_ini == null || !fechaValida(r.fecha_fin) || new Date(r.fecha_fin) < new Date(r.fec_ini))){
        return false;
    }
    return true;
}

function envioValido(envio){
    return envio != null && Number.isInteger(envio.id_area) && envio.id_area >= 1 && envio.id_area <= 18 && Array.isArray(envio.datos);
}

function cargarRanking(){
    rest.get(URL_MINISTERIO, function(estado, respuesta){
        if(estado != 200 || !Array.isArray(respuesta)){
            alert("Error al obtener los datos del Ministerio");
            return;
        }
        var totales = [];
        for(var a = 1; a <= 18; a++){
            totales[a] = 0;
        }
        for(var i = 0; i < respuesta.length; i++){
            var envio = respuesta[i];
            if(!envioValido(envio)){
                continue;
            }
            for(var j = 0; j < envio.datos.length; j++){
                if(reservaValida(envio.datos[j])){
                    totales[envio.id_area]++;
                }
            }
        }
        var ranking = [];
        for(var a = 1; a <= 18; a++){
            if(totales[a] > 0){
                ranking.push({ area: a, total: totales[a] });
            }
        }
        ranking.sort(function(x, y){
            return y.total - x.total;
        });
        var tabla = document.getElementById("lista_ranking");
        tabla.innerHTML = "";
        for(var k = 0; k < ranking.length; k++){
            var tr = document.createElement("tr");
            var pos_td = document.createElement("td");
            pos_td.textContent = k + 1;
            var area_td = document.createElement("td");
            area_td.textContent = AREAS[ranking[k].area];
            var total_td = document.createElement("td");
            total_td.textContent = ranking[k].total;
            tr.appendChild(pos_td);
            tr.appendChild(area_td);
            tr.appendChild(total_td);
            tabla.appendChild(tr);
        }
    });
}