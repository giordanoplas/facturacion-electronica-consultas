const express = require('express');
const routes = express.Router();
const jwt = require('jsonwebtoken');

routes.post('/auth', (req, res) => {
    const { username, password } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA').toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            SELECT u.*, c.id_compania, c.descripcion AS 'compania'
            FROM usuarios u 
            LEFT JOIN compania c ON c.id_compania=u.id_compania
            WHERE u.usuario='${username}' AND u.contrasena='${password}'
            LIMIT 1
        `;

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            if (data != null && data.length > 0) {
                const user = { username: username };
                const accessToken = generateAccessToken(user);

                res.status(200).header('authorization', accessToken).json({
                    status: 'OK',
                    username: username,
                    token: accessToken,
                    data: data[0]
                });
            } else {
                res.status(400).send({
                    status: 'error',
                    message: 'Los datos de acceso son incorrectos'
                });
            }
        })
    })
    /*
    const { username, password } = req.body;

    //Consultar BD y validar que existe el usuario y el password
    const user = { username: username };
    const accessToken = generateAccessToken(user);

    res.status(200).header('authorization', accessToken).json({
        status: 'OK',
        message: 'Usuario autenticado',
        token: accessToken
    });*/
})

routes.get('/documentoelectronico_detalle', validateToken, (req, res) => {
    const query = 'SELECT * FROM documentoelectronico_detalle';

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/mediation_electronica', validateToken, (req, res) => {
    const query = 'SELECT * FROM mediation_electronica';

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/table_list_data/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT DISTINCT de.idGeneradoHead, DATE_FORMAT(de.FechaEmision, '%d/%m/%Y') AS 'FechaEmisionFormat', de.FechaEmision, de.TotalDocumento, 
            de.TotalImpuesto, de.NCF, de.NCF_NC, de.NumeroFacturaInterna, de.RazonSocialComprador, de.RNCComprador, de.RNCEmisor, de.TipoTransaccion AS 'TipoTransaccionID', 
            de.Descripcion_TipoTransaccion, tsr.estado, GROUP_CONCAT(DISTINCT msn.codigo SEPARATOR '$--') AS 'errorMsnID', GROUP_CONCAT(DISTINCT msn.valor SEPARATOR '$--') AS 'errorMsn', 
            build.procesado_sap AS 'procesado_sap_build', tsr.procesado_sap, tsr.id AS 'trackingID', de.AnularSecuencia, (case when mediation.status='B' then case when build.status='P' then case when publish.status='D' then 'DGII' 
                when publish.status='E' then 'Publish Error' else 'Publish' end when build.status='E' then 'Build Error' else 'Build' end when mediation.status='E' then
                'Mediation Error' else 'Mediation' end) as Etapas, COALESCE(tsr.qr_code_text, build.qr_code_text) AS 'qr_code_text', GROUP_CONCAT(DISTINCT mediation.status, '$--', mediation.mensaje_general) AS 'mediationMSN',
            GROUP_CONCAT(DISTINCT build.status, '$--', build.mensaje_general) AS 'buildMSN', GROUP_CONCAT(DISTINCT publish.status, '$--', publish.mensaje_general) AS 'publishMSN',
            tsr.procesado_directorio_facturador, tsr.comentario, build.ubicacion_archivo, ard.rnc_emisor, ard.rnc_comprador, ard.e_ncf, ard.fecha_hora_acuse_recibo,
            ard.ubicacion_archivo AS 'ubicacion_archivo_acuse', de.TotalMontoGravado, CONCAT(de.TotalDocumento, '$--', de.TotalImpuesto, '$--', de.TotalMontoGravado, '$--', de.TotalBruto, 
            '$--', de.TotalDescuento, '$--', de.TotalRecargo) AS 'totales', tsr.permitido_enviar_receptor, ard.id AS 'acuseID', ard.estado_descripcion, ard.codigo_motivo_no_recibido_descripcion, 
            de.TotalITBISRetencion, de.TotalISRRetencion, de.TotalBruto, de.TotalDescuento, de.TotalRecargo, de.Cancelado, ac.Estado AS 'EstadoAprobacionComercialID', 
            ac.EstadoDescripcion AS 'EstadoAprobacionComercial', ac.DetalleMotivoRechazo AS 'DetalleMotivoRechazoAprobacionComercial', tsr.es_facturador_electronico, tsr.comentario_procesado_directorio_facturador
        FROM documentoelectronico de
        LEFT JOIN mediation_electronica mediation ON de.idGeneradoHead=mediation.idGeneradoHead
        LEFT JOIN build_electronica build ON build.id_mediation=mediation.id_mediation AND build.idGeneradoHead=de.idGeneradoHead
        LEFT JOIN publish_electronica publish ON publish.id_build=build.id_build AND publish.idGeneradoHead=de.idGeneradoHead
        LEFT JOIN tracking_status_response tsr ON tsr.id_publish_tracking=publish.id_publish
        LEFT JOIN mensajes msn ON msn.id_tracking_status=tsr.id
        LEFT JOIN acuse_de_recibo_documento ard ON ard.idGeneradoHead=de.idGeneradoHead
        LEFT JOIN aprobacion_comercial ac ON ac.idGeneradoHead=de.idGeneradoHead
        WHERE de.id_compania=${companyID} AND de.IdentificadorOrigen='E' AND DATE(de.fecha_hora_creacion_at)=CURDATE()
        GROUP BY 1, ard.rnc_emisor, ard.rnc_comprador, ard.e_ncf, ard.fecha_hora_acuse_recibo, ard.id, ard.ubicacion_archivo, estado_descripcion, codigo_motivo_no_recibido_descripcion,
            ac.Estado, ac.EstadoDescripcion, ac.DetalleMotivoRechazo
        ORDER BY de.idGeneradoHead DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/table_list_date_end_start/:dateStart/:dateEnd/:companyID/:tipoFecha', validateToken, (req, res) => {
    let start = req.params.dateStart;
    let end = req.params.dateEnd;
    const companyID = req.params.companyID;
    const tipoFecha = req.params.tipoFecha;
    var tipoFechaFilter = "";

    switch (tipoFecha) {
        case "Emision":
            tipoFechaFilter = "FechaEmision";
            break;
        case "Creacion":
            tipoFechaFilter = "fecha_hora_creacion_at";
            break;
        default:
            tipoFechaFilter = "fecha_hora_creacion_at";
            break;
    }

    const query = `
        SELECT DISTINCT de.idGeneradoHead, DATE_FORMAT(de.FechaEmision, '%d/%m/%Y') AS 'FechaEmisionFormat', de.FechaEmision, de.TotalDocumento, 
            de.TotalImpuesto, de.NCF, de.NCF_NC, de.NumeroFacturaInterna, de.RazonSocialComprador, de.RNCComprador, de.RNCEmisor, de.TipoTransaccion AS 'TipoTransaccionID', 
            de.Descripcion_TipoTransaccion, tsr.estado, GROUP_CONCAT(DISTINCT msn.codigo SEPARATOR '$--') AS 'errorMsnID', GROUP_CONCAT(DISTINCT msn.valor SEPARATOR '$--') AS 'errorMsn', 
            build.procesado_sap AS 'procesado_sap_build', tsr.procesado_sap, tsr.id AS 'trackingID', de.AnularSecuencia, (case when mediation.status='B' then case when build.status='P' then case when publish.status='D' then 'DGII' 
                when publish.status='E' then 'Publish Error' else 'Publish' end when build.status='E' then 'Build Error' else 'Build' end when mediation.status='E' then
                'Mediation Error' else 'Mediation' end) as Etapas, COALESCE(tsr.qr_code_text, build.qr_code_text) AS 'qr_code_text', GROUP_CONCAT(DISTINCT mediation.status, '$--', mediation.mensaje_general) AS 'mediationMSN',
            GROUP_CONCAT(DISTINCT build.status, '$--', build.mensaje_general) AS 'buildMSN', GROUP_CONCAT(DISTINCT publish.status, '$--', publish.mensaje_general) AS 'publishMSN',
            tsr.procesado_directorio_facturador, tsr.comentario, build.ubicacion_archivo, ard.rnc_emisor, ard.rnc_comprador, ard.e_ncf, ard.fecha_hora_acuse_recibo,
            ard.ubicacion_archivo AS 'ubicacion_archivo_acuse', de.TotalMontoGravado, CONCAT(de.TotalDocumento, '$--', de.TotalImpuesto, '$--', de.TotalMontoGravado, '$--', de.TotalBruto, 
            '$--', de.TotalDescuento, '$--', de.TotalRecargo) AS 'totales', tsr.permitido_enviar_receptor, ard.id AS 'acuseID', ard.estado_descripcion, ard.codigo_motivo_no_recibido_descripcion, 
            de.TotalITBISRetencion, de.TotalISRRetencion, de.TotalBruto, de.TotalDescuento, de.TotalRecargo, de.Cancelado, ac.Estado AS 'EstadoAprobacionComercialID', 
            ac.EstadoDescripcion AS 'EstadoAprobacionComercial', ac.DetalleMotivoRechazo AS 'DetalleMotivoRechazoAprobacionComercial', tsr.es_facturador_electronico, tsr.comentario_procesado_directorio_facturador
        FROM documentoelectronico de
        LEFT JOIN mediation_electronica mediation ON de.idGeneradoHead=mediation.idGeneradoHead
        LEFT JOIN  build_electronica build ON build.id_mediation=mediation.id_mediation AND build.idGeneradoHead=de.idGeneradoHead
        LEFT JOIN publish_electronica publish ON publish.id_build=build.id_build AND publish.idGeneradoHead=de.idGeneradoHead
        LEFT JOIN tracking_status_response tsr ON tsr.id_publish_tracking=publish.id_publish
        LEFT JOIN mensajes msn ON msn.id_tracking_status=tsr.id
        LEFT JOIN acuse_de_recibo_documento ard ON ard.idGeneradoHead=de.idGeneradoHead
        LEFT JOIN aprobacion_comercial ac ON ac.idGeneradoHead=de.idGeneradoHead
        WHERE de.id_compania=${companyID} AND de.IdentificadorOrigen='E' AND (DATE(de.${tipoFechaFilter}) BETWEEN '${start}' AND '${end}')
        GROUP BY 1, ard.rnc_emisor, ard.rnc_comprador, ard.e_ncf, ard.fecha_hora_acuse_recibo, ard.ubicacion_archivo, ard.id, estado_descripcion, codigo_motivo_no_recibido_descripcion,
            ac.Estado, ac.EstadoDescripcion, ac.DetalleMotivoRechazo
        ORDER BY de.idGeneradoHead DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/configuracion/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT * FROM configuracion
        WHERE id_compania=${companyID}  
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/configuracion/certificado/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT 
            CONCAT(
            TIMESTAMPDIFF(MONTH, CURDATE(), fecha_vencimiento_certificado), ' meses, ',
            MOD(TIMESTAMPDIFF(DAY, CURDATE(), fecha_vencimiento_certificado), 30), ' días, ',
            MOD(TIMESTAMPDIFF(HOUR, Now(), fecha_vencimiento_certificado), 24), ' horas'
        ) AS tiempo_restante_certificado
        FROM configuracion
        WHERE id_compania=${companyID}        
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/usuarios', validateToken, (req, res) => {
    const query = `
        SELECT u.id, u.nombre, u.apellido, u.usuario, u.contrasena, u.email, u.direccion, u.ciudad, u.provincia, u.pais, u.codigo_postal, u.telefono, c.id_compania, 
            c.descripcion AS 'compania', DATE_FORMAT(u.fecha_hora_ultima_sesion_at, '%d/%m/%Y %r') AS 'fecha_hora_ultima_sesion_at'
        FROM usuarios u
        LEFT JOIN compania c ON c.id_compania=u.id_compania
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.put('/administration/user/edit', validateToken, (req, res) => {
    const {
        id,
        nombre,
        apellido,
        email,
        usuario,
        password,
        direccion,
        ciudad,
        provincia,
        pais,
        codpos,
        telefono,
        companiaID
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `UPDATE usuarios SET ? WHERE id=${id}`;
        const values = {
            nombre: nombre,
            apellido: apellido,
            email: email,
            usuario: usuario,
            contrasena: password,
            direccion: direccion,
            ciudad: ciudad,
            provincia: provincia,
            pais: pais,
            codigo_postal: codpos,
            telefono: telefono,
            id_compania: companiaID
        };

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                message: 'Usuario actualizado exitosamente...'
            });
        })
    })
})

routes.post('/administration/user/add', validateToken, (req, res) => {
    const {
        nombre,
        apellido,
        email,
        usuario,
        password,
        direccion,
        ciudad,
        provincia,
        pais,
        codpos,
        telefono,
        idperfil,
        companiaID
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            INSERT INTO usuarios(id_compania,nombre,apellido,email,usuario,contrasena,direccion,ciudad,provincia,pais,codigo_postal,telefono,idperfil)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;
        const values = [companiaID, nombre, apellido, email, usuario, password, direccion, ciudad, provincia, pais, codpos, telefono, idperfil]

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                username: usuario,
                insertId: data.insertId,
                message: 'Usuario creado exitosamente...'
            });
        })
    })
})

routes.put('/administration/user/last-session-update', (req, res) => {
    const {
        id,
        fecha_hora_ultima_sesion_at
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `UPDATE usuarios SET ? WHERE id=${id}`;
        const values = {
            fecha_hora_ultima_sesion_at: fecha_hora_ultima_sesion_at
        };

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                message: 'Usuario actualizado exitosamente...'
            });
        })
    })
})

routes.get('/companies', (req, res) => {
    const query = `
        SELECT * FROM compania
        ORDER BY descripcion
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.put('/administration/company/edit', validateToken, (req, res) => {
    const {
        id_compania,
        descripcion,
        rnc_compania,
        actividad_economica,
        cancelado
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `UPDATE compania SET ? WHERE id_compania=${id_compania}`;
        const values = {
            id_compania: parseInt(rnc_compania),
            descripcion: descripcion,
            rnc_compania: rnc_compania,
            actividad_economica: actividad_economica,
            cancelado: cancelado
        };

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                message: 'Compañía actualizada exitosamente...'
            });
        })
    })
})

routes.post('/administration/company/add', validateToken, (req, res) => {
    const {
        descripcion,
        rnc_compania,
        actividad_economica,
        cancelado
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            INSERT INTO compania(id_compania,descripcion,rnc_compania,actividad_economica,cancelado)
            VALUES(?,?,?,?,?)
        `;
        const values = [rnc_compania, descripcion, rnc_compania, actividad_economica, cancelado]

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                company: descripcion,
                insertId: data.insertId,
                message: 'Compañía creada exitosamente...'
            });
        })
    })
})

routes.get('/administration/unidades', validateToken, (req, res) => {
    const query = `
        SELECT * FROM unidades               
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/administration/entorno-trabajo', validateToken, (req, res) => {
    const query = `
        SELECT et.*, c.descripcion AS 'compania'  
        FROM entorno_de_trabajo et
        LEFT JOIN compania c ON c.id_compania=et.id_compania                    
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.post('/administration/add-entorno', validateToken, (req, res) => {
    const {
        companyID,
        entorno_trabajo,
        descripcion,
        base_de_datos,
        usuario_base_de_datos,
        contrasena_base_de_datos
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            INSERT INTO entorno_de_trabajo(id_compania,entorno_trabajo,descripcion,base_de_datos,usuario_base_de_datos,contrasena_base_de_datos)
            VALUES(?,?,?,?,?,?)
        `;

        const values = [companyID, entorno_trabajo, descripcion, base_de_datos, usuario_base_de_datos, contrasena_base_de_datos]

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                insertId: data.insertId,
                message: 'Entorno creado exitosamente...'
            });
        })
    })
})

routes.put('/administration/edit-entorno', validateToken, (req, res) => {
    const {
        id_entorno,
        companyID,
        entorno_trabajo,
        descripcion,
        base_de_datos,
        usuario_base_de_datos,
        contrasena_base_de_datos
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `UPDATE entorno_de_trabajo SET ? WHERE id_entorno=${id_entorno}`;
        const values = {
            entorno_trabajo: entorno_trabajo,
            id_compania: companyID,
            descripcion: descripcion,
            base_de_datos: base_de_datos,
            usuario_base_de_datos: usuario_base_de_datos,
            contrasena_base_de_datos: contrasena_base_de_datos
        };

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                message: 'Entorno actualizado exitosamente...'
            });
        })
    })
})

routes.put('/administration/configuracion', validateToken, (req, res) => {
    const {
        companyID,
        entornoID,
        urlDGII,
        urlSAP,
        ipXMLServer,
        ubicacionXML,
        ubicacionXMLRecep,
        ubicacionXMLRecepPro,
        rnc,
        company,
        certificado,
        nombre,
        password,
        fechaVencimiento,
        dgiiTime,
        sapTime
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `UPDATE configuracion SET ? WHERE id_compania=${companyID}`;
        var values = null;

        if (certificado != null) {
            var buffer = Buffer.from(certificado, 'base64');
            values = {
                id_entorno_trabajo: entornoID,
                urlDGII: urlDGII,
                urlSAPEndPoint: urlSAP,
                ip_xml_server: ipXMLServer,
                ubicacion_xml_server: ubicacionXML,
                ubicacion_xml_server_recepcion: ubicacionXMLRecep,
                ubicacion_xml_server_recepcion_procesado: ubicacionXMLRecepPro,
                rnc_emisor: rnc,
                compania: company,
                certificado: buffer,
                nombre_certificado: nombre,
                contrasena: password,
                fecha_vencimiento_certificado: fechaVencimiento ? fechaVencimiento.split('T')[0] : null,
                tiempo_minuto_procesamiento_dgii: dgiiTime,
                tiempo_minuto_procesamiento_sap: sapTime
            }
        } else {
            values = {
                id_entorno_trabajo: entornoID,
                urlDGII: urlDGII,
                urlSAPEndPoint: urlSAP,
                ip_xml_server: ipXMLServer,
                ubicacion_xml_server: ubicacionXML,
                ubicacion_xml_server_recepcion: ubicacionXMLRecep,
                ubicacion_xml_server_recepcion_procesado: ubicacionXMLRecepPro,
                rnc_emisor: rnc,
                compania: company,
                contrasena: password,
                fecha_vencimiento_certificado: fechaVencimiento ? fechaVencimiento.split('T')[0] : null,
                tiempo_minuto_procesamiento_dgii: dgiiTime,
                tiempo_minuto_procesamiento_sap: sapTime
            }
        }

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                message: 'Configuración actualizada exitosamente...'
            });
        })
    })
})

routes.put('/documento-electronico/cancelar-documento', validateToken, (req, res) => {
    const {
        companyID,
        idGeneradoHead,
        factura,
        cancelado
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            UPDATE documentoelectronico SET ? WHERE idGeneradoHead='${idGeneradoHead}' AND id_compania=${companyID}
        `;
        const values = {
            Cancelado: cancelado
        }

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                factura: factura,
                message: 'Este documento fue CANCELADO exitosamente...'
            });
        })
    })
})

routes.put('/documento-electronico/actualizar-documento', validateToken, (req, res) => {
    const {
        companyID,
        idGeneradoHead,
        factura,
        actualizar
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            UPDATE documentoelectronico SET ? WHERE idGeneradoHead='${idGeneradoHead}' AND id_compania=${companyID}
        `;
        const values = {
            Actualizar: actualizar
        }

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                factura: factura,
                message: 'Este documento fue ACTUALIZADO exitosamente...'
            });
        })
    })
})

routes.put('/mediation-electronica/mediation', validateToken, (req, res) => {
    const {
        companyID,
        id,
        factura,
        status
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            UPDATE mediation_electronica SET ? WHERE idGeneradoHead='${id}' AND id_compania=${companyID}
        `;
        const values = {
            status: status
        }

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                factura: factura,
                message: 'Este documento fue devuelto a MEDIATION exitosamente...'
            });
        })
    })
})

routes.put('/documento-electronico/anular-secuencia', validateToken, (req, res) => {
    const {
        factura,
        idGeneradoHead,
        anularSecuencia
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            UPDATE documentoelectronico SET ? WHERE idGeneradoHead='${idGeneradoHead}'
        `;
        const values = {
            AnularSecuencia: anularSecuencia
        }

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                factura: factura,
                message: 'Esta secuencia fue anulada exitosamente...'
            });
        })
    })
})

routes.post('/anulacion-sec/insert', validateToken, (req, res) => {
    const {
        companyID,
        origen,
        Version,
        RncEmisor,
        TipoeCF,
        CantidadeNCFAnulados,
        SecuenciaeNCFDesde,
        SecuenciaeNCFHasta
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            INSERT INTO anulacion_secuencia(id_compania,origen,Version,RncEmisor,TipoeCF,CantidadeNCFAnulados,SecuenciaeNCFDesde,SecuenciaeNCFHasta)
            VALUES(?,?,?,?,?,?,?,?)
        `;

        const values = [companyID, origen, Version, RncEmisor, TipoeCF, CantidadeNCFAnulados, SecuenciaeNCFDesde, SecuenciaeNCFHasta]

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                secuenciaID: data.insertId,
                message: 'Secuencia anulada exitosamente...'
            });
        })
    })
})

routes.get('/anulacion-sec/table_list/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT s.*, DATE_FORMAT(s.FechaHoraAnulacioneNCF, '%d/%m/%Y %h:%i %p') AS 'FechaHoraAnulacioneNCFFormat', asr.*, tc.tipo_ecf, tc.descripcion,
            (CASE WHEN s.cancelado='N' then  
                case when s.status='A' then 'Pendiente'
                    when s.status='P' then 'Procesado'
                    when s.status='D' then 'DGII'
                    when s.status='E' then 'Error de procesamiento'
                    else 'Estado no definido' end
                    else
                    'Cancelado'
            END) as Estado
        FROM anulacion_secuencia s
        LEFT JOIN anulacion_secuencia_response asr ON asr.id_anulacion=s.id
        LEFT JOIN tipo_de_comprobantes tc ON tc.tipo_ecf = s.TipoeCF
        WHERE s.id_compania=${companyID}
        ORDER BY s.FechaHoraAnulacioneNCF DESC        
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/anulacion-sec/table_list_date_end_start/:dateStart/:dateEnd/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;
    let start = req.params.dateStart;
    let end = req.params.dateEnd;

    const query = `
        SELECT s.*, DATE_FORMAT(s.FechaHoraAnulacioneNCF, '%d/%m/%Y %h:%i %p') AS 'FechaHoraAnulacioneNCFFormat', asr.*, tc.tipo_ecf, tc.descripcion,
            (CASE WHEN s.cancelado='N' then  
                case when s.status='A' then 'Pendiente'
                    when s.status='P' then 'Procesado'
                    when s.status='D' then 'DGII'
                    when s.status='E' then 'Error de procesamiento'
                    else 'Estado no definido' end
                    else
                    'Cancelado'
        END) as Estado
        FROM anulacion_secuencia s
        LEFT JOIN anulacion_secuencia_response asr ON asr.id_anulacion=s.id
        LEFT JOIN tipo_de_comprobantes tc ON tc.tipo_ecf = s.TipoeCF
        WHERE s.id_compania=${companyID} AND s.FechaHoraAnulacioneNCF BETWEEN '${start}' AND '${end}'
        ORDER BY s.FechaHoraAnulacioneNCF
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/tipo_comprobante/table_list', validateToken, (req, res) => {
    const query = `
        SELECT * FROM tipo_de_comprobantes
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/token_info/:accessToken?', validateToken, (req, res) => {
    res.status(200).send({
        status: 'OK',
        username: req.user
    });
})

routes.get('/recepcion/table_list/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT de.idGeneradoHead, de.NumeroFacturaInterna, de.IdentificadorOrigen, de.NCF, de.NCF_NC, de.RazonSocialComprador, de.RNCComprador, de.RNCEmisor, de.FechaEmision AS 'FechaEmisionA', 
            DATE_FORMAT(de.FechaEmision, '%d/%m/%Y') AS 'FechaEmision', de.RazonSocialEmisor, crde.ubicacion_archivo_procesado AS 'ubicacion_archivo_xml',
            (SELECT fecha_hora_acuse_recibo FROM acuse_de_recibo_documento WHERE IdentificadorOrigen='R' AND de.RNCEmisor=rnc_emisor AND de.NCF=e_ncf OR de.NCF_NC=e_ncf LIMIT 1) AS "fecha_hora_acuse_recibo",
            (SELECT ubicacion_archivo FROM acuse_de_recibo_documento WHERE IdentificadorOrigen='R' AND de.RNCEmisor=rnc_emisor AND de.NCF=e_ncf OR de.NCF_NC=e_ncf LIMIT 1) AS "ubicacion_archivo_acuse",
            ac.codigo_dgii, ac.codigo_descripcion_dgii, ac.mensajes_dgii, de.TipoTransaccion AS 'TipoTransaccionID', de.Descripcion_TipoTransaccion AS 'TipoTransaccion', de.TotalMontoGravado, de.TotalITBISRetencion, 
            de.TotalISRRetencion, de.TotalBruto, de.TotalDescuento, de.TotalRecargo, de.TotalImpuesto, de.TotalDocumento, ac.EstadoDescripcion AS 'EstadoAprobacionComercial', 
            ac.DetalleMotivoRechazo AS 'DetalleMotivoRechazoAprobacionComercial'
        FROM documentoelectronico de
        LEFT JOIN control_recepcion_documento_electronico crde ON crde.id=de.id_control_recepcion
        LEFT JOIN aprobacion_comercial ac ON ac.idGeneradoHead=de.idGeneradoHead
        WHERE de.id_compania=${companyID} AND de.IdentificadorOrigen='R' AND de.Cancelado='N' AND DATE(de.fecha_hora_creacion_at)=CURDATE()
        ORDER BY de.idGeneradoHead DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/recepcion/table_list_date_end_start/:dateStart/:dateEnd/:companyID/:tipoFecha', validateToken, (req, res) => {
    let start = req.params.dateStart;
    let end = req.params.dateEnd;
    const companyID = req.params.companyID;
    const tipoFecha = req.params.tipoFecha;
    var tipoFechaFilter = "";

    switch (tipoFecha) {
        case "Emision":
            tipoFechaFilter = "FechaEmision";
            break;
        case "Creacion":
            tipoFechaFilter = "fecha_hora_creacion_at";
            break;
        default:
            tipoFechaFilter = "FechaEmision";
            break;
    }

    const query = `
        SELECT de.idGeneradoHead, de.NumeroFacturaInterna, de.IdentificadorOrigen, de.NCF, de.NCF_NC, de.RazonSocialComprador, de.RNCComprador, de.RNCEmisor, de.FechaEmision AS 'FechaEmisionA', 
            DATE_FORMAT(de.FechaEmision, '%d/%m/%Y') AS 'FechaEmision', de.RazonSocialEmisor, crde.ubicacion_archivo_procesado AS 'ubicacion_archivo_xml',
            (SELECT fecha_hora_acuse_recibo FROM acuse_de_recibo_documento WHERE IdentificadorOrigen='R' AND de.RNCEmisor=rnc_emisor AND de.NCF=e_ncf OR de.NCF_NC=e_ncf LIMIT 1) AS "fecha_hora_acuse_recibo",
            (SELECT ubicacion_archivo FROM acuse_de_recibo_documento WHERE IdentificadorOrigen='R' AND de.RNCEmisor=rnc_emisor AND de.NCF=e_ncf OR de.NCF_NC=e_ncf LIMIT 1) AS "ubicacion_archivo_acuse",
            ac.codigo_dgii, ac.codigo_descripcion_dgii, ac.mensajes_dgii, de.TipoTransaccion AS 'TipoTransaccionID', de.Descripcion_TipoTransaccion AS 'TipoTransaccion', de.TotalMontoGravado, de.TotalITBISRetencion, 
            de.TotalISRRetencion, de.TotalBruto, de.TotalDescuento, de.TotalRecargo, de.TotalImpuesto, de.TotalDocumento, ac.EstadoDescripcion AS 'EstadoAprobacionComercial', 
            ac.DetalleMotivoRechazo AS 'DetalleMotivoRechazoAprobacionComercial'
        FROM documentoelectronico de
        LEFT JOIN control_recepcion_documento_electronico crde ON crde.id=de.id_control_recepcion
        LEFT JOIN aprobacion_comercial ac ON ac.idGeneradoHead=de.idGeneradoHead
        WHERE de.id_compania=${companyID} AND de.IdentificadorOrigen='R' AND de.Cancelado='N' AND (DATE(de.${tipoFechaFilter}) BETWEEN '${start}' AND '${end}')
        ORDER BY de.idGeneradoHead DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.post('/recepcion/aprobacion-comercial', validateToken, (req, res) => {
    const {
        id_compania,
        idGeneradoHead,
        IdentificadorOrigen,
        status,
        status_dgii,
        RNCEmisor,
        eNCF,
        FechaEmision,
        MontoTotal,
        RNCComprador,
        Estado,
        EstadoDescripcion,
        DetalleMotivoRechazo,
        FechaHoraAprobacionComercial,
        errorCode
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            INSERT INTO aprobacion_comercial(id_compania,idGeneradoHead,IdentificadorOrigen,status,status_dgii,RNCEmisor,eNCF,FechaEmision,MontoTotal,RNCComprador,Estado,EstadoDescripcion,DetalleMotivoRechazo,FechaHoraAprobacionComercial,error_code)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const values = [
            id_compania,
            idGeneradoHead,
            IdentificadorOrigen,
            status,
            status_dgii,
            RNCEmisor,
            eNCF,
            FechaEmision,
            MontoTotal,
            RNCComprador,
            Estado,
            EstadoDescripcion,
            DetalleMotivoRechazo,
            FechaHoraAprobacionComercial,
            errorCode
        ]

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                secuenciaID: data.insertId,
                message: 'Aprobación comercial enviada exitosamente...'
            });
        })
    })
})

routes.put('/aprobacion-comercial/update-status-dgii', validateToken, (req, res) => {
    const {
        id,
        status
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        const query = `
            UPDATE aprobacion_comercial SET ? WHERE id='${id}'
        `;
        const values = {
            status_dgii: status
        }

        conn.query(query, values, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                message: 'El estado DGII fue cambiado a Pendiente exitosamente...'
            });
        })
    })
})

routes.get('/emision-aprobacion-comercial/table_list/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT ac.*, DATE_FORMAT(ac.FechaEmision, '%d/%m/%Y') AS 'FechaEmisionF', de.RazonSocialComprador, de.RazonSocialEmisor
        FROM aprobacion_comercial ac
        LEFT OUTER JOIN documentoelectronico de ON de.idGeneradoHead=ac.idGeneradoHead AND de.IdentificadorOrigen='R'
        WHERE ac.id_compania=${companyID} AND ac.IdentificadorOrigen='E'
        ORDER BY ac.id DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/emision-aprobacion-comercial/table_list_date_end_start/:dateStart/:dateEnd/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;
    let start = req.params.dateStart;
    let end = req.params.dateEnd;

    const query = `
        SELECT ac.*, DATE_FORMAT(ac.FechaEmision, '%d/%m/%Y') AS 'FechaEmisionF', de.RazonSocialComprador, de.RazonSocialEmisor
        FROM aprobacion_comercial ac
        LEFT OUTER JOIN documentoelectronico de ON de.idGeneradoHead=ac.idGeneradoHead AND de.IdentificadorOrigen='R'
        WHERE ac.id_compania=${companyID} AND ac.IdentificadorOrigen='E' AND (ac.FechaEmision BETWEEN '${start}' AND '${end}')
        ORDER BY ac.id DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/recepcion-aprobacion-comercial/table_list/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT ac.*, DATE_FORMAT(ac.FechaEmision, '%d/%m/%Y') AS 'FechaEmisionF', de.RazonSocialComprador, de.RazonSocialEmisor
        FROM aprobacion_comercial ac
        LEFT OUTER JOIN documentoelectronico de ON de.idGeneradoHead=ac.idGeneradoHead AND de.IdentificadorOrigen='E'
        WHERE ac.id_compania=${companyID} AND ac.IdentificadorOrigen='R'
        ORDER BY ac.id DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/recepcion-aprobacion-comercial/table_list_date_end_start/:dateStart/:dateEnd/:companyID', validateToken, (req, res) => {
    let start = req.params.dateStart;
    let end = req.params.dateEnd;
    const companyID = req.params.companyID;

    const query = `
        SELECT ac.*, DATE_FORMAT(ac.FechaEmision, '%d/%m/%Y') AS 'FechaEmisionF', de.RazonSocialComprador, de.RazonSocialEmisor
        FROM aprobacion_comercial ac
        LEFT OUTER JOIN documentoelectronico de ON de.idGeneradoHead=ac.idGeneradoHead AND de.IdentificadorOrigen='E'
        WHERE ac.id_compania=${companyID} AND ac.IdentificadorOrigen='R' AND (ac.FechaEmision BETWEEN '${start}' AND '${end}')
        ORDER BY ac.id DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/carga-archivo/table_list/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT id, fecha_hora_creacion_at, tipo_documento_xml, descripcion_documento_xml, nombre_archivo, extension_archivo,
            (CASE WHEN status='A' then 'Archivo Cargado'
                WHEN status='P' then 'Procesado'                                    
                WHEN status='E' then 'Error procesamiento' else 'Status no definido' end) AS 'Estado',
            (CASE WHEN status='A' then  'Archivo Cargado'
                WHEN status='P' then 'Procesado'                                    
                WHEN status='E' then 'Error procesamiento' else 'Status no definido' end) AS 'Estado_Movimiento',
            CONCAT(CONCAT(mensaje_general, '\n'), mensaje_general_procesado) AS 'mensaje', DATE_FORMAT(fecha_hora_creacion_at, '%d/%m/%Y') AS 'fechaF'
        FROM control_recepcion_documento_electronico
        WHERE id_compania=${companyID}
        ORDER BY 1 DESC
        LIMIT 100
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/carga-archivo/table_list_date_end_start/:dateStart/:dateEnd/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;
    let start = req.params.dateStart;
    let end = req.params.dateEnd;

    const query = `
        SELECT id, fecha_hora_creacion_at, tipo_documento_xml, descripcion_documento_xml, nombre_archivo, extension_archivo,
            (CASE WHEN status='A' then 'Archivo Cargado'
                WHEN status='P' then 'Procesado'                                    
                WHEN status='E' then 'Error procesamiento' else 'Status no definido' end) AS 'Estado',
            (CASE WHEN status='A' then  'Archivo Cargado'
                WHEN status='P' then 'Procesado'                                    
                WHEN status='E' then 'Error procesamiento' else 'Status no definido' end) AS 'Estado_Movimiento',
            CONCAT(CONCAT(mensaje_general, '\n'), mensaje_general_procesado) AS 'mensaje', DATE_FORMAT(fecha_hora_creacion_at, '%d/%m/%Y') AS 'fechaF'
        FROM control_recepcion_documento_electronico 
        WHERE id_compania=${companyID} AND fecha_hora_creacion_at BETWEEN '${start}' AND '${end}'
        ORDER BY 1 DESC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/emision/chart1/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT de.idGeneradoHead, de.FechaEmision, de.fecha_hora_creacion_at AS 'FechaCreacion', COUNT(IF(tsr.estado='Aceptado', tsr.estado, NULL)) AS 'EA',
            COUNT(IF(tsr.estado='Aceptado Condicional', tsr.estado, NULL)) AS 'EAC', COUNT(IF(tsr.estado='Rechazado', tsr.estado, NULL)) AS 'ER'
        FROM documentoelectronico de
        LEFT JOIN publish_electronica publish ON publish.idGeneradoHead=de.idGeneradoHead
        LEFT JOIN tracking_status_response tsr ON tsr.id_publish_tracking=publish.id_publish
        WHERE de.id_compania=${companyID} AND de.IdentificadorOrigen='E' AND de.Cancelado='N' AND DATE(de.fecha_hora_creacion_at)=CURDATE()
        GROUP BY 1
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/emision/chart1/:dateStart/:dateEnd/:companyID/:tipoFecha', validateToken, (req, res) => {
    const companyID = req.params.companyID;
    let start = req.params.dateStart;
    let end = req.params.dateEnd;
    const tipoFecha = req.params.tipoFecha;
    var tipoFechaFilter = "";

    switch (tipoFecha) {
        case "Emision":
            tipoFechaFilter = "FechaEmision";
            break;
        case "Creacion":
            tipoFechaFilter = "fecha_hora_creacion_at";
            break;
        default:
            tipoFechaFilter = "fecha_hora_creacion_at";
            break;
    }

    const query = `
        SELECT de.idGeneradoHead, de.FechaEmision, de.fecha_hora_creacion_at AS 'FechaCreacion', COUNT(IF(tsr.estado='Aceptado', tsr.estado, NULL)) AS 'EA',
            COUNT(IF(tsr.estado='Aceptado Condicional', tsr.estado, NULL)) AS 'EAC', COUNT(IF(tsr.estado='Rechazado', tsr.estado, NULL)) AS 'ER'
        FROM documentoelectronico de
        LEFT JOIN publish_electronica publish ON publish.idGeneradoHead=de.idGeneradoHead
        LEFT JOIN tracking_status_response tsr ON tsr.id_publish_tracking=publish.id_publish
        WHERE de.id_compania=${companyID} AND de.IdentificadorOrigen='E' AND de.Cancelado='N' AND (DATE(de.${tipoFechaFilter}) BETWEEN '${start}' AND '${end}')
        GROUP BY 1  
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/emision/chart2/:companyID', validateToken, (req, res) => {
    const companyID = req.params.companyID;

    const query = `
        SELECT TipoTransaccion, Descripcion_TipoTransaccion, COUNT(*) AS 'Cantidad'
        FROM documentoelectronico
        WHERE id_compania=${companyID} AND IdentificadorOrigen='E' AND Cancelado='N' AND DATE(fecha_hora_creacion_at)=CURDATE()
        GROUP BY TipoTransaccion, Descripcion_TipoTransaccion
        ORDER BY TipoTransaccion ASC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/emision/chart2/:dateStart/:dateEnd/:companyID/:tipoFecha', validateToken, (req, res) => {
    const companyID = req.params.companyID;
    let start = req.params.dateStart;
    let end = req.params.dateEnd;
    const tipoFecha = req.params.tipoFecha;
    var tipoFechaFilter = "";

    switch (tipoFecha) {
        case "Emision":
            tipoFechaFilter = "FechaEmision";
            break;
        case "Creacion":
            tipoFechaFilter = "fecha_hora_creacion_at";
            break;
        default:
            tipoFechaFilter = "fecha_hora_creacion_at";
            break;
    }

    const query = `
        SELECT TipoTransaccion, Descripcion_TipoTransaccion, COUNT(*) AS 'Cantidad'
        FROM documentoelectronico
        WHERE id_compania=${companyID} AND IdentificadorOrigen='E' AND Cancelado='N' AND (DATE(${tipoFechaFilter}) BETWEEN '${start}' AND '${end}')
        GROUP BY TipoTransaccion, Descripcion_TipoTransaccion
        ORDER BY TipoTransaccion ASC
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data
            });
        })
    })
})

routes.get('/current-date-time', (req, res) => {
    const query = `
        SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS 'currentDateTime'
    `;

    req.getConnection((err, conn) => {
        if (err) {
            console.log(new Date().toLocaleString('en-CA'));
            console.log(err);
            return res.status(500).send({
                status: 'error',
                message: err
            })
        }

        conn.query(query, (err, data) => {
            if (err) {
                console.log(new Date().toLocaleString('en-CA'));
                console.log(err);
                return res.status(400).send({
                    status: 'error',
                    message: err
                })
            }

            res.status(200).send({
                status: 'OK',
                data: data[0]
            });
        })
    })
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.TOKEN_SECRET_WORD, { expiresIn: process.env.TOKEN_DURATION });
}

function validateToken(req, res, next) {
    const accessToken = req.headers['authorization'] || req.params.accessToken;
    if (!accessToken) res.status(400).send({
        status: 'error',
        message: 'Access denied'
    });

    jwt.verify(accessToken, process.env.TOKEN_SECRET_WORD, (err, user) => {
        if (err) {
            res.status(400).send({
                status: 'error',
                message: 'Access denied, token expired or incorrect'
            });
        } else {
            req.user = user;
            next();
        }
    })
}

module.exports = routes