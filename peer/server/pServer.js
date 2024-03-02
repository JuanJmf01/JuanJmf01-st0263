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
const servicesProto = grpc.loadPackageDefinition(packageDefinition);


function register(call, callback) {
    const { name, password } = call.request;
    const userData = {
        name: name,
        password: password
    }

    axios.post(`${url}/register`, userData)
        .then(response => {
            callback(null, { exitoso: true, mensaje: response.data.message });
        })
        .catch(error => {
            console.error('Error:', error);
            callback(null, { exitoso: false, mensaje: 'Ups, hubo un error :(' });

        });
}

function login(call, callback) {
    const { name, password } = call.request;

    const userData = {
        name: name,
        password: password
    }

    axios.post(`${url}/login`, userData)
        .then(response => {
            callback(null, { exitoso: true, mensaje: response.data.message, user: response.data.user});
        })
        .catch(error => {
            console.error('Error:', error);
            callback(null, { exitoso: false, mensaje: 'Ups. Ha ocurrido un error :(' });
        });
}

function logOut(call, callback) {
    const { id } = call.request;
    axios.post(`${url}/log_out/${id}`)
        .then(response => {
            callback(null, { exitoso: true, mensaje: response.data.message });
        })
        .catch(error => {
            console.error('Error:', error);
            callback(null, { exitoso: false, mensaje: 'Credenciales inválidas' });
        });
}


const server = new grpc.Server();

server.addService(servicesProto.RegisterService.service, { Register: register });
server.addService(servicesProto.LoginService.service, { Login: login });
server.addService(servicesProto.LogOutService.service, { LogOut: logOut });

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Servidor gRPC escuchando en el puerto 50051');
    server.start();
});



