var http = require("http");
var httpServer = http.createServer();

var datos = require("./datos.js");
var sanitarios = datos.san;
var gestores = datos.ges;
var ubicaciones = datos.ubi;
var categorias = datos.cat;
var modelos = datos.mod;
var recursos = datos.rec;
var reservas = datos.res;
var resenyas = datos.resn;
var WebSocketServer = require("websocket").server;
var wsServer = new WebSocketServer({
	httpServer: httpServer
});

var puerto = 4444;
httpServer.listen(puerto, function () {
	console.log("Servidor de WebSocket iniciado en puerto:", puerto);
});

var clientes = [];

function iniciarWSAvisos(httpServer) {

    wsServer.on("request", function(request) {
        var connection = request.accept("avisos", request.origin);
        var cliente = { connection: connection, tipo: null, id: null, nombre: null };
        clientes.push(cliente);

        connection.on("message", function(message) {
            if (message.type !== "utf8") return;
            var msg = JSON.parse(message.utf8Data);
            switch (msg.operacion) {

                case "identificar":
                    cliente.tipo = msg.tipo;
                    cliente.id = msg.id;
                    cliente.nombre = msg.nombre;
                    break;

                case "avisoReserva":
                        let afectados = [];
                        for(var i = 0 ; i < reservas.length; i++){
                            if(reservas[i].recurso == msg.idRecurso && reservas[i].fecha_fin == null){
                                afectados.push(reservas[i].sanitario);
                            }
                        }
                        var aviso = {
                            operacion: "aviso",
                            color: "rojo",
                            fecha: new Date().toLocaleString(),
                            origen: msg.quien,
                            texto: "SE HA " + msg.accion + " LA RESERVA DEL " +
                                msg.nombreCategoria.toUpperCase() + " MODELO " +
                                msg.nombreModelo.toUpperCase() + " CON CÓDIGO " + msg.codigoRecurso
                        };

                        for (var i = 0; i < clientes.length; i++) {
                            if (clientes[i].tipo === "sanitario"){
                                for (var k = 0; k < afectados.length; k++) {
                                    if(String(afectados[k]) === String(clientes[i].id)) {
                                        clientes[i].connection.sendUTF(JSON.stringify(aviso));
                                        break;
                                    }
                                }
                            }
                        }
                    break;

                case "avisoNuevoRecurso":
                    var aviso = {
                        operacion: "aviso",
                        color: "azul",
                        fecha: new Date().toLocaleString(),
                        origen: msg.quien,
                        texto: "SE HA CREADO UN NUEVO RECURSO " +
                        msg.nombreCategoria.toUpperCase() + " MODELO " +
                        msg.nombreModelo.toUpperCase() + " CON CÓDIGO " + msg.codigoRecurso
                    };
                    for (var i = 0; i < clientes.length; i++) {
                        if (clientes[i].tipo === "sanitario") {
                            clientes[i].connection.sendUTF(JSON.stringify(aviso));
                        }
                    }
                    break;

                case "avisoResenya":
                    console.log(msg.puntuacion);
                    var aviso = {
                        operacion: "aviso",
                        color: "verde",
                        fecha: new Date().toLocaleString(),
                        origen: msg.quien,
                        texto: "SE HA CREADO UNA RESEÑA PARA EL " +
                        msg.nombreCategoria.toUpperCase() + " MODELO " +
                        msg.nombreModelo.toUpperCase() + " CON CÓDIGO " +
                        msg.codigoRecurso + " Y PUNTUACIÓN " + msg.puntuacion
                    };
                    for (var i = 0; i < clientes.length; i++) {
                        if (clientes[i].tipo === "gestor") {
                            clientes[i].connection.sendUTF(JSON.stringify(aviso));
                        }
                    }
                    if(msg.puntuacion <= 2){
                        console.log("Entramos mala");
                        var aviso2 = {
                            operacion: "aviso",
                            color: "orange",
                            fecha: new Date().toLocaleString(),
                            origen: msg.quien,
                            texto: "Se ha evaluado con mala puntuación el dispositivo con categoria "+
                            msg.nombreCategoria+ ", modelo "+ msg.nombreModelo + " y con codigo " + msg.codigoRecurso
                        }
                        for(var j = 0; j < clientes.length; j++){
                            if(clientes[j].tipo == "sanitario"){
                                clientes[j].connection.sendUTF(JSON.stringify(aviso2));
                            }
                        }
                    }
                    break;
                case "avisoDevolucion":
                    for(var i = 0 ; i < clientes.length; i++){
                        if(clientes[i].tipo === "sanitario"){
                            var sanitario_aux = clientes[i]
                            var id_sanitario = sanitario_aux.id
                            var numero = 0;
                            for(var j = 0 ; j < reservas.length; j++){
                                if(reservas[j].sanitario == id_sanitario && reservas[j].fecha_inicio != null && reservas[j].fecha_fin == null){
                                    numero++;
                                }
                            }
                            if(numero > 0){
                                var aviso = {
                                    operacion: "aviso",
                                    color: "pink",
                                    fecha: new Date().toLocaleString(),
                                    origen : msg.quien,
                                    texto: "Le recordamos que tiene "+numero+ " recurso(s) por devolver. Intente ser puntual."
                                }
                                sanitario_aux.connection.sendUTF(JSON.stringify(aviso))

                            }

                        }
                    }
                    break;
            }
        });

        connection.on("close", function() {
            for (var i = 0; i < clientes.length; i++) {
                if (clientes[i].connection === connection) {
                    clientes.splice(i, 1);
                    break;
                }
            }
        });
    });

    console.log("Servidor WebSocket de avisos iniciado");
}

module.exports = iniciarWSAvisos;
