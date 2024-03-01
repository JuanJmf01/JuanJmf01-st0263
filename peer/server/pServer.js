const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "../services.proto";
var protoLoader = require("@grpc/proto-loader");

const axios = require('axios');


//Url del servidor en python
const url = 'http://127.0.0.1:3000';


const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const loginProto = grpc.loadPackageDefinition(packageDefinition);




function register(call, callback) {
    const { nombre, password } = call.request;
    console.log(call.request)

    const userData = {
        name: nombre,
        password: password
    }

    axios.post(`${url}/users`, userData)
        .then(response => {
            console.log(response.data); // Respuesta del server
            callback(null, { exitoso: true, mensaje: '¡Te has registrado exitosamente!' });

        })
        .catch(error => {
            console.error('Error:', error);
            callback(null, { exitoso: false, mensaje: 'Ups, hubo un error :(' });

        });

}


const server = new grpc.Server();
// server.addService(loginProto.LoginService.service, { Login: login });

server.addService(loginProto.RegisterService.service, { Register: register });

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Servidor gRPC escuchando en el puerto 50051');
    server.start();
});


// function login(call, callback) {
//     const { nombre, password } = call.request;

//     const usuario = usuarios.find(user => user.nombre === nombre && user.password === password);
//     if (usuario) {
//         callback(null, { exitoso: true, mensaje: '¡Inicio de sesión exitoso!' });
//     } else {
//         callback(null, { exitoso: false, mensaje: 'Credenciales inválidas' });
//     }
// }
