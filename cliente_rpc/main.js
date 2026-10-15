var app = rpc("localhost", "gestion_sanitarios");

var cancelarReserva = app.procedure("cancelarReserva");
var obtenerCategorias = app.procedure("obtenerCategorias");
var obtenerModelos = app.procedure("obtenerModelos");
var loginSanitario = app.procedure("loginSanitario");
var crearSanitario = app.procedure("crearSanitario");
var obtenerReservas = app.procedure("obtenerReservas");
var obtenerResenyas = app.procedure("obtenerResenyas");
var crearResenya = app.procedure("crearResenya");
var actualizarSanitario = app.procedure("actualizarSanitario");
var obtenerSanitario = app.procedure("obtenerSanitario");
var obtenerRecursos = app.procedure("obtenerRecursos");
var finalizarReserva = app.procedure("finalizarReserva");
var iniciarReserva = app.procedure("iniciarReserva");
var reservarRecurso = app.procedure("reservarRecurso");
var tiempoPendiente = app.procedure("tiempoPendiente");
var obtenerRecurso = app.procedure("obtenerRecurso");
var obtenerUbicaciones = app.procedure("obtenerUbicaciones");

var categorias_cargadas = null;
var ubicaciones_cargadas = null;
var modelos_cargados = null;
var reservas_cargadas = null;
var resenyas_cargadas = null;
var recursos_cargados = null;

var seccionActual = "login";
var id_sanitario = null;

var conexionWS = null;
var nombre_sanitario_ws = null;
var id_sanitario_ws = null;
function conectarWS(id, nombre) {
    id_sanitario_ws = id;
    nombre_sanitario_ws = nombre;

    conexionWS = new WebSocket("ws://localhost:4444", "avisos");

    conexionWS.addEventListener("open", function() {
        conexionWS.send(JSON.stringify({
            operacion: "identificar",
            tipo: "sanitario",
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
    if (!tabla) return;

    var fila = document.createElement("tr");

    if (datos.color === "rojo") fila.style.backgroundColor = "#ff9999";
    else if (datos.color === "azul") fila.style.backgroundColor = "#9999ff";
    else if (datos.color === "verde") fila.style.backgroundColor = "#90ee90";
    else if (datos.color === "orange") fila.style.backgroundColor = "orange";
    else if (datos.color === "pink") fila.style.backgroundColor = "pink";
    var tdFecha = document.createElement("td");
    tdFecha.textContent = datos.fecha || new Date().toLocaleTimeString();

    var tdOrigen = document.createElement("td");
    tdOrigen.textContent = datos.origen || "Sistema";

    var tdTexto = document.createElement("td");
    tdTexto.textContent = datos.texto || datos.mensaje;

    fila.appendChild(tdFecha);
    fila.appendChild(tdOrigen);
    fila.appendChild(tdTexto);
    tabla.insertBefore(fila, tabla.firstChild);
}

function wsAvisoReserva(accion, idRecurso, nombreCategoria, nombreModelo, codigoRecurso) {
    if (!conexionWS) return;
    conexionWS.send(JSON.stringify({
        operacion: "avisoReserva",
        accion: accion,
        idRecurso: idRecurso,
        nombreCategoria: nombreCategoria,
        nombreModelo: nombreModelo,
        codigoRecurso: codigoRecurso,
        quien: nombre_sanitario_ws
    }));
}

function wsAvisoResenya(nombreCategoria, nombreModelo, codigoRecurso, puntuacion) {
    if (!conexionWS) return;
    conexionWS.send(JSON.stringify({
        operacion: "avisoResenya",
        nombreCategoria: nombreCategoria,
        nombreModelo: nombreModelo,
        codigoRecurso: codigoRecurso,
        puntuacion: puntuacion,
        quien: nombre_sanitario_ws
    }));
}
function cargar(callback){
    var contador = 0;
    var total = 3;

    function verificarCompletado() {
        contador++;
        if (contador === total && callback) {
            callback();
        }
    }
    obtenerCategorias(function(datos){
        categorias_cargadas = datos;
        verificarCompletado();
    });
    obtenerUbicaciones(function(datos){
        ubicaciones_cargadas = datos;
        verificarCompletado();
    });
    obtenerModelos(function(datos){
        modelos_cargados = datos;
        verificarCompletado();
    });
}

function cancelar(){
    cambiarSeccion("login");
    document.getElementById("nombre_reg").innerHTML = "";
    document.getElementById("apellidos_reg").innerHTML ="";
    document.getElementById("usuario_reg").innerHTML = "";
    document.getElementById("contrasenya_reg").innerHTML = "";

}

function login(){
    var usuario = document.getElementById("usuario").value;
    var password = document.getElementById("password").value;

    loginSanitario(usuario, password, function(id){
        if(id != null){
            id_sanitario = id;

            obtenerSanitario(id, function(datos_sanitario){
                var nombreCompleto = datos_sanitario.nombre + " " + datos_sanitario.apellidos;
                document.getElementById("nombre_sanitario").textContent = nombreCompleto;

                conectarWS(id_sanitario, nombreCompleto);

                cargar(function(){
                    obtenerReservas(id_sanitario, function(datos){
                        reservas_cargadas = datos;
                        rellenarTablas(id_sanitario);
                        cambiarSeccion("inicio_sanitario");
                    });
                });
            });

        } else {
            alert("Credenciales inválidas.");
        }
        document.getElementById("usuario").value = "";
        document.getElementById("password").value = "";
    });
}

function crear(){
    id_sanitario = null;
    cambiarSeccion("datos_sanitario");
}

var sanitarios = [];
var id_sanitario = null;

function registro(){
    var nombre = document.getElementById("nombre_reg").value;
    var apellidos = document.getElementById("apellidos_reg").value;
    var usuario = document.getElementById("usuario_reg").value;
    var password = document.getElementById("contrasenya_reg").value;

    if(!nombre || !apellidos || !usuario || !password) {
        alert("Por favor, completa todos los campos");
        return;
    }

    var datosSanitario = {
        nombre: nombre,
        apellidos: apellidos,
        usuario: usuario,
        password: password
    };

    if(id_sanitario == null){
        crearSanitario(datosSanitario, function(id){
            if(id != null){
                alert("Se ha creado correctamente el sanitario");
                console.log(id);
                cambiarSeccion("login");
            }else{
                alert("Error creando el sanitario, inténtalo de nuevo.");
            }
        });
    } else {
        actualizarSanitario(id_sanitario, datosSanitario, function(aviso){
            console.log(aviso);
            if(aviso == "Sanitario actualizado"){
                document.getElementById("nombre_sanitario").textContent = datosSanitario.nombre + " " + datosSanitario.apellidos;
                cambiarSeccion("inicio_sanitario");
            }else{
                alert("Error al actualizar los datos");
            }

        });
    }

    document.getElementById("nombre_reg").value = "";
    document.getElementById("apellidos_reg").value = "";
    document.getElementById("usuario_reg").value = "";
    document.getElementById("contrasenya_reg").value = "";
}

function editar(){
    cambiarSeccion("datos_sanitario");
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
var sanitario_resenya = null;
var recurso_resenya = null;

function fechaCorta(fecha){
    var d = new Date(fecha);
    return d.getDate() + "/" + (d.getMonth() + 1) + " " + d.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}

function rellenarTablas(idSanitario){
    var reservas_sanitario_realizadas = [];
    var reservas_sanitario_pendientes = [];
    for(var i = 0; i < reservas_cargadas.length; i++){
        if(reservas_cargadas[i].sanitario == idSanitario && reservas_cargadas[i].fecha_inicio == null){
            reservas_sanitario_pendientes.push(reservas_cargadas[i]);
        } else if(reservas_cargadas[i].sanitario == idSanitario){
            reservas_sanitario_realizadas.push(reservas_cargadas[i]);
        }
    }
    console.log(reservas_sanitario_realizadas);

    var tabla_pendientes = document.getElementById("lista_reservas_pendientes");
    var tabla_realizadas = document.getElementById("lista_reservas");

    tabla_pendientes.innerHTML = "";
    tabla_realizadas.innerHTML = "";

    for(var i = 0; i < reservas_sanitario_pendientes.length; i++){
        let reserva = reservas_sanitario_pendientes[i];
        let tr = document.createElement("tr");
        let id_recurso = reserva.recurso;
        obtenerRecurso(id_recurso, function(recurso){
            var modelo_buscado = modelos_cargados.find(item => item.id == recurso.modelo);
            var categoria_buscada = categorias_cargadas.find(item => item.id == modelo_buscado.categoria);
            var ubi = ubicaciones_cargadas.find(item => item.id == recurso.ubicacion);

            var categoria_td = document.createElement("td");
            categoria_td.textContent = categoria_buscada.nombre;
            var modelo_td = document.createElement("td");
            modelo_td.textContent = modelo_buscado.nombre;
            var num_serie_td = document.createElement("td");
            num_serie_td.textContent = recurso.numero_serie;
            var ubicacion_td = document.createElement("td");
            ubicacion_td.textContent = ubi.nombre;
            var fecha_pet_td = document.createElement("td");
            fecha_pet_td.textContent = new Date(reserva.fecha_peticion).toLocaleString();
            var horas_restantes_td = document.createElement("td");

            tiempoPendiente(id_recurso, reserva.id, function(horas){
                if(horas > 0){
                    horas_restantes_td.textContent = "Espera " + horas + " h";
                } else if(horas === 0){
                    horas_restantes_td.textContent = "Libre";
                } else {
                    horas_restantes_td.textContent = reserva.horas_estimadas + " h";
                }
            });

            var iniciar_td = document.createElement("td");

            tiempoPendiente(id_recurso, reserva.id, function(horas_restantes){
                if(horas_restantes <= 0){
                    var btnIniciar = document.createElement("button");
                    btnIniciar.textContent = "Retirar";
                    btnIniciar.onclick = function() {
                        iniciarReserva(reserva.id, function(resultado){
                            alert(resultado);
                            wsAvisoReserva("INICIADO", id_recurso, categoria_buscada.nombre,
                                            modelo_buscado.nombre, recurso.numero_serie);
                            obtenerReservas(id_sanitario, function(datos){
                                reservas_cargadas = datos;
                                rellenarTablas(id_sanitario);
                            });
                        });
                    };
                    iniciar_td.appendChild(btnIniciar);
                }
            });

            var cancelar_td = document.createElement("td");
            var btnCancelar = document.createElement("button");
            btnCancelar.textContent = "Cancelar";
            btnCancelar.onclick = function(){
                cancelarReserva(reserva.id, function(resultado){
                    alert(resultado);
                    obtenerReservas(id_sanitario, function(datos){
                        reservas_cargadas = datos;
                        rellenarTablas(id_sanitario);
                    });
                });
            };
            cancelar_td.appendChild(btnCancelar);

            tr.appendChild(categoria_td);
            tr.appendChild(modelo_td);
            tr.appendChild(num_serie_td);
            tr.appendChild(ubicacion_td);
            tr.appendChild(fecha_pet_td);
            tr.appendChild(horas_restantes_td);
            tr.appendChild(iniciar_td);
            tr.appendChild(cancelar_td);
            tabla_pendientes.appendChild(tr);
        });
    }

    for(var i = 0; i < reservas_sanitario_realizadas.length; i++){
        let reserva = reservas_sanitario_realizadas[i];
        let tr = document.createElement("tr");
        let id_recurso = reserva.recurso;

        obtenerRecurso(id_recurso, function(recurso){
            var id_modelo = modelos_cargados.find(item => item.id == recurso.modelo);
            var id_categoria = categorias_cargadas.find(item => item.id == id_modelo.categoria);

            var categoria_td = document.createElement("td");
            categoria_td.textContent = id_categoria.nombre;
            var modelo_td = document.createElement("td");
            modelo_td.textContent = id_modelo.nombre;
            var num_serie_td = document.createElement("td");
            num_serie_td.textContent = recurso.numero_serie;
            var horas_est_td = document.createElement("td");
            horas_est_td.textContent = reserva.horas_estimadas + " h";
            var fecha_ini_td = document.createElement("td");
            fecha_ini_td.textContent = reserva.fecha_inicio ? fechaCorta(reserva.fecha_inicio) : "-";
            var fecha_fin_td = document.createElement("td");
            if(reserva.fecha_fin){
                var mismo_dia = new Date(reserva.fecha_inicio).toDateString() == new Date(reserva.fecha_fin).toDateString();
                fecha_fin_td.textContent = mismo_dia
                    ? new Date(reserva.fecha_fin).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
                    : fechaCorta(reserva.fecha_fin);
            } else {
                fecha_fin_td.textContent = "en uso";
            }

            var acciones_td = document.createElement("td");

            if(reserva.fecha_fin === null && reserva.fecha_inicio !== null) {
                var btnFinalizar = document.createElement("button");
                btnFinalizar.textContent = "Devolver";
                btnFinalizar.onclick = function() {
                    finalizarReserva(reserva.id, function(resultado){
                        alert(resultado);
                        var afectados = reservas_cargadas
                            .filter(r => r.recurso == id_recurso && r.fecha_fin == null)
                            .map(r => r.sanitario);
                        wsAvisoReserva("FINALIZADO", id_recurso, id_categoria.nombre,
                                    id_modelo.nombre, recurso.numero_serie);
                        obtenerReservas(id_sanitario, function(datos){
                            reservas_cargadas = datos;
                            rellenarTablas(id_sanitario);
                        });
                    });
                };
                acciones_td.appendChild(btnFinalizar);
            }

            if(reserva.fecha_fin !== null) {
                var btnResenyar = document.createElement("button");
                btnResenyar.textContent = "Resenya";
                btnResenyar.onclick = function() {
                    sanitario_resenya = id_sanitario;
                    recurso_resenya = id_recurso;
                    document.getElementById("numero_serie").textContent = recurso.numero_serie;
                    cambiarSeccion("nueva_resenya");
                };
                acciones_td.appendChild(btnResenyar);
            }

            tr.appendChild(categoria_td);
            tr.appendChild(modelo_td);
            tr.appendChild(num_serie_td);
            tr.appendChild(horas_est_td);
            tr.appendChild(fecha_ini_td);
            tr.appendChild(fecha_fin_td);
            tr.appendChild(acciones_td);
            tabla_realizadas.appendChild(tr);
        });
    }
}

function nueva_reserva(){

    var categoriaSelect = document.getElementById("categoria_rec");
    categoriaSelect.innerHTML = "<option value=''>--Selecciona--</option>";
    for(var i = 0 ; i < categorias_cargadas.length;i++){
        var option = document.createElement("option");
        option.value = categorias_cargadas[i].id;
        option.textContent = categorias_cargadas[i].nombre;
        categoriaSelect.appendChild(option);
    }
    document.getElementById("modelo_rec").innerHTML = "<option value=''>--Selecciona--</option>";
    document.getElementById("lista_reservas_nuevas").innerHTML = "";
    cambiarSeccion("nueva_reserva");

}
function RellenarModelos(){
    var categoria = document.getElementById("categoria_rec").value;
    var modeloSelect = document.getElementById("modelo_rec");
    modeloSelect.innerHTML = "<option value=''>--Selecciona--</option>";
    document.getElementById("lista_reservas_nuevas").innerHTML = "";
    for(var i = 0; i < modelos_cargados.length;i++){
        if(modelos_cargados[i].categoria == categoria){
            var option = document.createElement("option");
            option.value = modelos_cargados[i].id;
            option.textContent = modelos_cargados[i].nombre;
            modeloSelect.appendChild(option);
        }
    }
}
function buscar(){
    var modelo = document.getElementById("modelo_rec").value;
    var tbody = document.getElementById("lista_reservas_nuevas");
    tbody.innerHTML = "";

    obtenerRecursos(modelo, function(recursos){
        for(var i = 0; i < recursos.length; i++){
            let recurso = recursos[i];
            let tr = document.createElement("tr");

            let serie_td = document.createElement("td");
            serie_td.textContent = recurso.numero_serie;
            console.log(recurso.numero_serie);

            let ubi_td = document.createElement("td");
            let ubi = ubicaciones_cargadas.find(item => item.id == recurso.ubicacion);
            ubi_td.textContent = ubi ? ubi.nombre : "";

            let horas_res_td = document.createElement("td");
            let btn_td = document.createElement("td");
            let btn = document.createElement("button");

            tiempoPendiente(recurso.id, -1, function(horas){
                if(horas == 0){
                    horas_res_td.textContent = "Disponible";
                    btn.textContent = "Retirar";

                    btn.onclick = function(){
                        var horas_reserva = document.getElementById("tiempo_estimado").value;

                        if(!horas_reserva || horas_reserva <= 0) {
                            alert("Por favor, introduce un tiempo estimado válido");
                            return;
                        }

                        reservarRecurso(recurso.id, id_sanitario, parseInt(horas_reserva), function(id_reserva){
                            if(id_reserva) {
                                iniciarReserva(id_reserva, function(mensaje){
                                    console.log(mensaje);
                                    alert("Reserva iniciada correctamente");
                                    var modelo_obj = modelos_cargados.find(m => m.id == recurso.modelo);
                                    var cat_obj = categorias_cargadas.find(c => c.id == modelo_obj.categoria);
                                    buscar();
                                });
                            } else {
                                alert("Error al realizar la reserva");
                            }
                        });
                    };
                } else {
                    horas_res_td.textContent = "Espera " + horas + " h";
                    btn.textContent = "Reservar";

                    btn.onclick = function(){
                        var horas_reserva = document.getElementById("tiempo_estimado").value;

                        if(!horas_reserva || horas_reserva <= 0) {
                            alert("Por favor, introduce un tiempo estimado válido");
                            return;
                        }

                        reservarRecurso(recurso.id, id_sanitario, parseInt(horas_reserva), function(id_reserva){
                            if(id_reserva) {
                                console.log("Reserva con id: " + id_reserva + " realizada");
                                alert("Reserva realizada correctamente");
                                var modelo_obj = modelos_cargados.find(m => m.id == recurso.modelo);
                                var cat_obj = categorias_cargadas.find(c => c.id == modelo_obj.categoria);

                                buscar();
                            } else {
                                alert("Error al realizar la reserva");
                            }
                        });
                    };
                }
            });

            let valoracion_td = document.createElement("td");
            obtenerResenyas(recurso.id, function(resenyas){
                var valoracion_media = 0;
                if(resenyas.length > 0) {
                    for(var j = 0; j < resenyas.length; j++){
                        console.log(resenyas[j].valor);
                        valoracion_media += resenyas[j].valor;
                    }
                    valoracion_media /= resenyas.length;
                }
                valoracion_td.textContent = valoracion_media.toFixed(1);
            });

            tr.appendChild(serie_td);
            tr.appendChild(ubi_td);
            tr.appendChild(horas_res_td);
            tr.appendChild(valoracion_td);
            btn_td.appendChild(btn);
            tr.appendChild(btn_td);
            tbody.appendChild(tr);
        }
    });
}

function salir(){
    desconectarWS();
    id_sanitario = null;
    id_sanitario_ws = null;
    nombre_sanitario_ws = null;
    lista_avisos.innerHTML = "";
    cambiarSeccion("login");
}

function guardar_resenya(){
    crearResenya( recurso_resenya, sanitario_resenya, parseFloat(document.getElementById("valoracion").value), document.getElementById("texto_resenya").value, function(resultado){
        console.log(parseFloat(document.getElementById("valoracion").value));
        alert(resultado);
        obtenerRecurso(recurso_resenya, function(rec) {
            var modeloObj = modelos_cargados.find(m => m.id == rec.modelo);
            var catObj = categorias_cargadas.find(c => c.id == modeloObj.categoria);
            wsAvisoResenya(catObj.nombre, modeloObj.nombre, rec.numero_serie,
                        parseFloat(document.getElementById("valoracion").value));
        });
        cambiarSeccion("inicio_sanitario");
    });
}

function cancelar_resenya(){
    obtenerReservas(id_sanitario, function(datos){
        reservas_cargadas = datos;
        cambiarSeccion("inicio_sanitario");
        rellenarTablas(id_sanitario);
    });
}
function cancelar_reserva(){
    obtenerReservas(id_sanitario, function(datos){
        reservas_cargadas = datos;
        cambiarSeccion("inicio_sanitario");
        rellenarTablas(id_sanitario);
    });
}
