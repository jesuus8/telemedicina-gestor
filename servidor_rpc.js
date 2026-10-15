var rpc = require("./rpc.js");
var conexion = require("./conexion_mysql.js");
var servidor = rpc.server(3501, function() {
    console.log("Servidor RPC escuchando en http://localhost:3501");
});

function obtenerCategorias(callback){
    conexion.query("SELECT * FROM categorias", function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        return callback(resultados);
    });
}

function obtenerModelos(callback){
    conexion.query("SELECT * FROM modelos", function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        return callback(resultados);
    });
}

function loginSanitario(usuario, password, callback){
    if(!usuario || !password){
        return callback(null);
    }
    conexion.query("SELECT id FROM sanitarios WHERE usuario = ? AND password = ?", [usuario, password], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        if(resultados.length == 0){
            return callback(null);
        }
        return callback(resultados[0].id);
    });
}

function crearSanitario(datosSanitario, callback){
    var nombre = datosSanitario.nombre;
    var apellidos = datosSanitario.apellidos;
    var usuario = datosSanitario.usuario;
    var password = datosSanitario.password;

    if(!nombre || !apellidos || !usuario || !password){
        return callback(null);
    }
    conexion.query("SELECT id FROM sanitarios WHERE usuario = ?", [usuario], function(err, existentes){
        if(err){
            console.error(err);
            return callback(null);
        }
        if(existentes.length > 0){
            return callback(null);
        }
        conexion.query("INSERT INTO sanitarios (nombre, apellidos, usuario, password) VALUES (?, ?, ?, ?)", [nombre, apellidos, usuario, password], function(err2, resultados){
            if(err2){
                console.error(err2);
                return callback(null);
            }
            return callback(resultados.insertId);
        });
    });
}

function obtenerReservas(idSanitario, callback){
    conexion.query("SELECT * FROM reservas WHERE sanitario = ?", [idSanitario], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        return callback(resultados);
    });
}

function obtenerResenyas(idRecurso, callback){
    conexion.query("SELECT * FROM resenyas WHERE recurso = ?", [idRecurso], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        return callback(resultados);
    });
}

function crearResenya(idRecurso, idSanitario, valoracion, descripcion, callback){
    if(valoracion < 1 || valoracion > 5){
        return callback(null);
    }
    conexion.query("INSERT INTO resenyas (recurso, sanitario, fecha, valor, descripcion) VALUES (?, ?, ?, ?, ?)", [idRecurso, idSanitario, new Date(), valoracion, descripcion], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        return callback(resultados.insertId);
    });
}

function actualizarSanitario(idSanitario, datosSanitario, callback){
    var login = datosSanitario.usuario;
    conexion.query("SELECT id FROM sanitarios WHERE id = ?", [idSanitario], function(err, encontrado){
        if(err){
            console.error(err);
            return callback("Usuario repetido u otro problema");
        }
        if(encontrado.length == 0){
            return callback("Sanitario no encontrado");
        }
        conexion.query("SELECT id FROM sanitarios WHERE usuario = ? AND id != ?", [login, idSanitario], function(err2, repetidos){
            if(err2){
                console.error(err2);
                return callback("Usuario repetido u otro problema");
            }
            if(repetidos.length > 0){
                return callback("Usuario repetido u otro problema");
            }
            conexion.query("UPDATE sanitarios SET nombre = ?, apellidos = ?, usuario = ?, password = ? WHERE id = ?", [datosSanitario.nombre, datosSanitario.apellidos, login, datosSanitario.password, idSanitario], function(err3){
                if(err3){
                    console.error(err3);
                    return callback("Usuario repetido u otro problema");
                }
                return callback("Sanitario actualizado");
            });
        });
    });
}

function obtenerSanitario(idSanitario, callback){
    conexion.query("SELECT id, nombre, apellidos, usuario FROM sanitarios WHERE id = ?", [idSanitario], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        if(resultados.length == 0){
            return callback(null);
        }
        return callback(resultados[0]);
    });
}

function obtenerRecursos(idModelo, callback){
    conexion.query("SELECT * FROM recursos WHERE modelo = ? AND estado = 0", [idModelo], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        if(resultados.length == 0){
            return callback(null);
        }
        return callback(resultados);
    });
}

function cancelarReserva(idReserva, callback){
    conexion.query("DELETE FROM reservas WHERE id = ?", [idReserva], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        if(resultados.affectedRows == 0){
            return callback(null);
        }
        return callback("Reserva eliminada");
    });
}

function iniciarReserva(idReserva, callback){
    conexion.query("UPDATE reservas SET fecha_inicio = ? WHERE id = ? AND fecha_inicio IS NULL", [new Date(), idReserva], function(err, resultados){
        if(err){
            console.error(err);
            return callback("Reserva no encontrada.");
        }
        if(resultados.affectedRows == 0){
            return callback("Reserva no encontrada.");
        }
        return callback("Reserva iniciada.");
    });
}

function finalizarReserva(idReserva, callback){
    conexion.query("SELECT id, fecha_fin FROM reservas WHERE id = ?", [idReserva], function(err, resultados){
        if(err){
            console.error(err);
            return callback("No se ha encontrado la reserva.");
        }
        if(resultados.length == 0){
            return callback("No se ha encontrado la reserva.");
        }
        if(resultados[0].fecha_fin != null){
            return callback("La reserva ya está finalizada");
        }
        conexion.query("UPDATE reservas SET fecha_fin = ? WHERE id = ?", [new Date(), idReserva], function(err2){
            if(err2){
                console.error(err2);
                return callback("No se ha encontrado la reserva.");
            }
            return callback("Se ha finalizado la reserva con id: "+idReserva);
        });
    });
}

function reservarRecurso(idRecurso, idSanitario, horas, callback){
    var sql = "SELECT r.estado, m.horas_maximas FROM recursos r JOIN modelos m ON m.id = r.modelo WHERE r.id = ?";
    conexion.query(sql, [idRecurso], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        if(resultados.length == 0){
            return callback("Recurso no encontrado.");
        }
        if(resultados[0].horas_maximas < horas){
            return callback("Has sobrepasado las horas máximas del modelo.");
        }
        if(resultados[0].estado != 0){
            return callback(null);
        }
        conexion.query("INSERT INTO reservas (recurso, sanitario, horas_estimadas, fecha_peticion) VALUES (?, ?, ?, ?)", [idRecurso, idSanitario, horas, new Date()], function(err2, insertado){
            if(err2){
                console.error(err2);
                return callback(null);
            }
            return callback(insertado.insertId);
        });
    });
}

function tiempoPendiente(idRecurso, idReserva, callback){
    conexion.query("SELECT * FROM reservas WHERE recurso = ? ORDER BY fecha_peticion, id", [idRecurso], function(err, reservas_recurso){
        if(err){
            console.error(err);
            return callback(null);
        }
        var ahora = new Date();
        if(reservas_recurso.length === 0){
            return callback(0);
        }

        var tiempoAcumulado = 0;

        for(var i = 0; i < reservas_recurso.length; i++){
            var reserva = reservas_recurso[i];

            if(reserva.id == idReserva){
                return callback(Math.round(tiempoAcumulado * 100) / 100);
            }

            if(reserva.fecha_inicio != null && reserva.fecha_fin == null){
                var horasTranscurridas = (ahora - new Date(reserva.fecha_inicio)) / (1000 * 60 * 60);
                var tiempoRestante = reserva.horas_estimadas - horasTranscurridas;
                if(tiempoRestante > 0){
                    tiempoAcumulado += tiempoRestante;
                }
            } else if(reserva.fecha_inicio == null){
                tiempoAcumulado += reserva.horas_estimadas;
            }
        }

        return callback(Math.round(tiempoAcumulado * 100) / 100);
    });
}

function obtenerRecurso(idRecurso, callback){
    conexion.query("SELECT * FROM recursos WHERE id = ?", [idRecurso], function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        if(resultados.length == 0){
            return callback(null);
        }
        return callback(resultados[0]);
    });
}

function obtenerUbicaciones(callback){
    conexion.query("SELECT * FROM ubicaciones", function(err, resultados){
        if(err){
            console.error(err);
            return callback(null);
        }
        return callback(resultados);
    });
}

var app = servidor.createApp("gestion_sanitarios");

app.registerAsync(cancelarReserva);
app.registerAsync(obtenerCategorias);
app.registerAsync(obtenerModelos);
app.registerAsync(loginSanitario);
app.registerAsync(crearSanitario);
app.registerAsync(obtenerReservas);
app.registerAsync(obtenerResenyas);
app.registerAsync(crearResenya);
app.registerAsync(actualizarSanitario);
app.registerAsync(obtenerSanitario);
app.registerAsync(obtenerRecursos);
app.registerAsync(finalizarReserva);
app.registerAsync(iniciarReserva);
app.registerAsync(reservarRecurso);
app.registerAsync(tiempoPendiente);
app.registerAsync(obtenerRecurso);
app.registerAsync(obtenerUbicaciones);
