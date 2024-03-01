const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = "../services.proto";

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const loginProto = grpc.loadPackageDefinition(packageDefinition);

const client = new loginProto.RegisterService('localhost:50051', grpc.credentials.createInsecure());


const solicitud = { nombre: 'usuario1', password: 'password1' };


client.Register(solicitud, (error, respuesta) => {
    if (!error) {
        console.log(respuesta.mensaje);
    } else {
        console.error('Error:', error);
    }
});



// client.Login(solicitud, (error, respuesta) => {
//     if (!error) {
//         console.log(respuesta.mensaje);
//     } else {
//         console.error('Error:', error);
//     }
// });



// const express = require('express');
// const bodyParser = require('body-parser');
// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');

// const app = express();
// const port = 3000;

// //body-parser para analizar el cuerpo de las solicitudes como JSON
// app.use(bodyParser.json());

// // Cargar el archivo .proto
// const PROTO_PATH = "../services.proto";
// const options = {
//     keepCase: true,
//     longs: String,
//     enums: String,
//     defaults: true,
//     oneofs: true,
// };
// const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
// const loginProto = grpc.loadPackageDefinition(packageDefinition);

// // Crear clientes gRPC para los servicios
// const registerClient = new loginProto.RegisterService('localhost:50051', grpc.credentials.createInsecure());
// const loginClient = new loginProto.LoginService('localhost:50051', grpc.credentials.createInsecure());

// // Ruta para el servicio de registro
// app.post('/register', (req, res) => {
//     const solicitud = req.body;
//     registerClient.Register(solicitud, (error, respuesta) => {
//         if (!error) {
//             res.status(200).json({ mensaje: respuesta.mensaje });
//         } else {
//             res.status(500).json({ error: 'Error de servidor' });
//         }
//     });
// });

// // Ruta para el servicio de inicio de sesión
// app.post('/login', (req, res) => {
//     const solicitud = req.body;
//     loginClient.Login(solicitud, (error, respuesta) => {
//         if (!error) {
//             res.status(200).json({ mensaje: respuesta.mensaje });
//         } else {
//             res.status(500).json({ error: 'Error de servidor' });
//         }
//     });
// });

// // Iniciar el servidor HTTP
// app.listen(port, () => {
//     console.log(`Servidor HTTP escuchando en el puerto ${port}`);
// });

