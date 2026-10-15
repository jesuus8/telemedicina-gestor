var express = require("express");
var jwt = require("jwt-simple");
var clave = process.env.CLAVE_JWT;
var app = express();
app.listen(process.env.PORT || 3000);
var conexion = require("./conexion_pg.js");
app.use("/gestor", express.static("cliente_rest"));
app.use("/sanitario", express.static("cliente_rpc"));
app.use(express.json());

app.get("/", function(req,res){
    res.redirect("/gestor");
})

app.post("/api/gestores", function(req,res){
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var usuario = req.body.usuario;
    var password = req.body.password;

    conexion.query("SELECT id FROM gestores WHERE usuario = $1", [usuario], function(err, existentes){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        if(existentes.rows.length > 0){
            return res.status(404).json("Usuario no valido");
        }
        conexion.query("INSERT INTO gestores (nombre, apellidos, usuario, password) VALUES ($1, $2, $3, $4)", [nombre, apellidos, usuario, password], function(err2, resultados){
            if(err2){
                return res.status(500).json("Error en la base de datos");
            }
            res.status(201).json("Gestor creado");
        });
    });
})

app.post("/api/gestores/login", function(req,res){
    var usuario = req.body.usuario;
    var password = req.body.password;

    conexion.query("SELECT id, password FROM gestores WHERE usuario = $1", [usuario], function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        if(resultados.rows.length == 0){
            return res.status(403).json({ error: "No existe este usuario."});
        }
        if(resultados.rows[0].password !== password){
            return res.status(403).json({ error: "Credenciales inválidas"});
        }
        var contenido = {
            usuario: resultados.rows[0].id,
            expira: Date.now() + 60 * 60 * 1000
        };
        var token = jwt.encode(contenido, clave);
        res.status(200).json({ token: token, id: resultados.rows[0].id });
    });
})

app.use("/api", function(req, res, next){
    var token = req.query.token;
    if(!token){
        return res.status(401).json("No se ha encontrado token");
    }
    try {
        var contenido = jwt.decode(token, clave);
    } catch(error){
        return res.status(401).json("El token es incorrecto");
    }
    if(!contenido || !contenido.usuario || !contenido.expira){
        return res.status(401).json("El formato del token no es adecuado");
    }
    if(contenido.expira < Date.now()){
        return res.status(401).json("El token ha expirado");
    }
    next();
});

app.get("/api/ubicaciones",function(req,res){
    conexion.query("SELECT * FROM ubicaciones", function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        res.status(200).json(resultados.rows);
    });
})

app.get("/api/categorias",function(req,res){
    conexion.query("SELECT * FROM categorias", function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        res.status(200).json(resultados.rows);
    });
})

app.get("/api/modelos",function(req,res){
    conexion.query("SELECT * FROM modelos", function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        res.status(200).json(resultados.rows);
    });
})

app.get("/api/reservas",function(req,res){
    var sql = "SELECT s.nombre, s.apellidos, c.nombre AS categoria, r.horas_estimadas, r.fecha_peticion AS fec_pet, r.fecha_inicio AS fec_ini, r.fecha_fin " +
              "FROM reservas r " +
              "JOIN sanitarios s ON s.id = r.sanitario " +
              "JOIN recursos rc ON rc.id = r.recurso " +
              "JOIN modelos m ON m.id = rc.modelo " +
              "JOIN categorias c ON c.id = m.categoria";
    conexion.query(sql, function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        res.status(200).json(resultados.rows);
    });
})

app.get("/api/gestores/:id",function(req,res){
    var id = req.params.id;
    conexion.query("SELECT id, nombre, apellidos, usuario FROM gestores WHERE id = $1", [id], function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        if(resultados.rows.length == 0){
            return res.status(404).json("No encontrado el usuario gestor.");
        }
        res.status(200).json(resultados.rows[0]);
    });
})

app.get("/api/sanitarios/:id",function(req,res){
    var id = req.params.id;
    conexion.query("SELECT id, nombre, apellidos, usuario FROM sanitarios WHERE id = $1", [id], function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        if(resultados.rows.length == 0){
            return res.status(404).json("No encontrado el usuario gestor.");
        }
        res.status(200).json(resultados.rows[0]);
    });
})

app.get("/api/recursos/:id",function(req,res){
    var id = req.params.id;
    conexion.query("SELECT * FROM recursos WHERE id = $1", [id], function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        if(resultados.rows.length == 0){
            return res.status(404).json("No se ha encontrado el recurso.");
        }
        res.status(200).json(resultados.rows[0]);
    });
})

app.get("/api/recursos/:id/reservas",function(req,res){
    var id = req.params.id;
    var sql = "SELECT r.id, CONCAT(s.nombre, ' ', s.apellidos) AS sanitario, " +
              "r.horas_estimadas, r.fecha_peticion, r.fecha_inicio, r.fecha_fin " +
              "FROM reservas r JOIN sanitarios s ON s.id = r.sanitario " +
              "WHERE r.recurso = $1";
    conexion.query(sql, [id], function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        res.status(200).json(resultados.rows);
    });
})

app.get("/api/recursos/:id/resenyas",function(req,res){
    var id = req.params.id;
    var sql = "SELECT r.fecha, CONCAT(s.nombre, ' ', s.apellidos) AS sanitario, " +
              "r.valor, r.descripcion " +
              "FROM resenyas r JOIN sanitarios s ON s.id = r.sanitario " +
              "WHERE r.recurso = $1";
    conexion.query(sql, [id], function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        res.status(200).json(resultados.rows);
    });
})

app.get("/api/recursos",function(req,res){
    var categoria = req.query.categoria;
    var modelo = req.query.modelo;
    var ubicacion = req.query.ubicacion;
    var estado = req.query.estado;

    var sql = "SELECT r.* FROM recursos r JOIN modelos m ON m.id = r.modelo WHERE 1=1";
    var valores = [];

    if(categoria && categoria != "Todos"){
        valores.push(categoria);
        sql += " AND m.categoria = $" + valores.length;
    }
    if(modelo && modelo != "Todos"){
        valores.push(modelo);
        sql += " AND r.modelo = $" + valores.length;
    }
    if(ubicacion && ubicacion != "Todos"){
        valores.push(ubicacion);
        sql += " AND r.ubicacion = $" + valores.length;
    }
    if(estado && estado != "Todos"){
        valores.push(estado);
        sql += " AND r.estado = $" + valores.length;
    }

    conexion.query(sql, valores, function(err, resultados){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        res.status(200).json(resultados.rows);
    });
})

app.post("/api/recursos", function(req,res){
    var estado = req.body.estado;
    if(estado != 0 && estado != 1 && estado != 2){
        return res.status(400).json("Estado inválido");
    }
    var sql = "INSERT INTO recursos (modelo, ubicacion, numero_serie, estado) VALUES ($1, $2, $3, $4)";
    var valores = [parseInt(req.body.modelo), parseInt(req.body.ubicacion), req.body.numero_serie, parseInt(estado)];
    conexion.query(sql, valores, function(err, resultados){
        if(err){
            if(err.code == "23503"){
                return res.status(400).json("Modelo o ubicación no válidos");
            }
            return res.status(500).json("Error en la base de datos");
        }
        res.status(201).json("Recurso creado");
    });
})

app.delete("/api/recursos/:id",function(req,res){
    var id_recurso = req.params.id;
    conexion.query("DELETE FROM recursos WHERE id = $1", [id_recurso], function(err, resultados){
        if(err){
            if(err.code == "23503"){
                return res.status(409).json("No se puede eliminar el recurso "+id_recurso+" porque tiene reservas o reseñas asociadas.");
            }
            return res.status(500).json("Error en la base de datos");
        }
        if(resultados.rowCount == 0){
            return res.status(404).json("No se ha encontrado el recurso con id: "+id_recurso);
        }
        res.status(200).json("El recurso con identificador: "+id_recurso + " ha sido eliminado");
    });
})

app.put("/api/gestores/:id", function(req,res){
    var id_gestor = req.params.id;
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var usuario = req.body.usuario;
    var password = req.body.password;

    conexion.query("SELECT id FROM gestores WHERE usuario = $1 AND id != $2", [usuario, id_gestor], function(err, repetidos){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        if(repetidos.rows.length > 0){
            return res.status(400).json({error:"Usuario ya existe"});
        }
        conexion.query("UPDATE gestores SET nombre = $1, apellidos = $2, usuario = $3, password = $4 WHERE id = $5", [nombre, apellidos, usuario, password, id_gestor], function(err2, resultados){
            if(err2){
                return res.status(500).json("Error en la base de datos");
            }
            if(resultados.rowCount == 0){
                return res.status(404).json("No se ha actualizado la información.");
            }
            res.status(201).json("Se han actualizado los datos.");
        });
    });
})

app.put("/api/recursos/:id", function(req,res){
    var id_recurso = req.params.id;
    var numero_serie = req.body.numero_serie;
    var modelo = req.body.modelo;
    var ubicacion = req.body.ubicacion;
    var estado = req.body.estado;

    conexion.query("SELECT id FROM recursos WHERE numero_serie = $1 AND id != $2", [numero_serie, id_recurso], function(err, repetidos){
        if(err){
            return res.status(500).json("Error en la base de datos");
        }
        if(repetidos.rows.length > 0){
            return res.status(400).json({error:"Número de serie ya existe."});
        }
        conexion.query("UPDATE recursos SET numero_serie = $1, modelo = $2, ubicacion = $3, estado = $4 WHERE id = $5", [numero_serie, modelo, ubicacion, estado, id_recurso], function(err2, resultados){
            if(err2){
                if(err2.code == "23503"){
                    return res.status(400).json({error:"Modelo o ubicación no válidos"});
                }
                return res.status(500).json("Error en la base de datos");
            }
            if(resultados.rowCount == 0){
                return res.status(404).json("No se ha encontrado el recurso.");
            }
            res.status(201).json("Se han actualizado los datos.");
        });
    });
})
