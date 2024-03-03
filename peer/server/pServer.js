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

let startingPort = 50051; // Puerto inicial, puede cambair si ya esta en uso

let userFiles = []


function register(call, callback) {
    const { name, password } = call.request;
    const userData = {
        name: name,
        password: password,
        port: startingPort
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
            console.log(response.data.message)
            callback(null, { exitoso: true, mensaje: response.data.message, user: response.data.user });
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
            console.log(response.data.message)
        })
        .catch(error => {
            console.error('Error:', error);
            callback(null, { exitoso: false, mensaje: 'Credenciales inválidas' });
        });
}


function saveFiles(call, callback) {
    const { files } = call.request;

    userFiles.push(...files)
    callback(null, { exitoso: true, mensaje: "Files inserted successfully" });
    console.log(`userFiles received   ${userFiles}`)
}


function getPorts(call, callback) {
    const { id } = call.request;

    axios.get(`${url}/search?id=${id}`) // Envía el ID como parte de la URL
        .then(response => {
            callback(null, { exitoso: true, mensaje: response.data.mensaje, ports: response.data.ports });
        })
        .catch(error => {
            console.error('Error:', error);
            callback(null, { exitoso: false, mensaje: 'Ups. Ha ocurrido un error :(' });
        });
}



function getFiles(call, callback) {
    console.log(`userFiles to send  ${userFiles}`)
    callback(null, { mensaje: "files received successfully", files: userFiles });
}

function startServer(port) {
    const server = new grpc.Server();
    server.addService(servicesProto.RegisterService.service, { Register: register });
    server.addService(servicesProto.LoginService.service, { Login: login });
    server.addService(servicesProto.LogOutService.service, { LogOut: logOut });
    server.addService(servicesProto.SaveFilesService.service, { SaveFiles: saveFiles });
    server.addService(servicesProto.GetPortsService.service, { GetPorts: getPorts });
    server.addService(servicesProto.GetFilesService.service, { GetFiles: getFiles });

    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(`Error al enlazar el servidor en el puerto ${port}: ${err}`);
            // Intentar con el siguiente puerto
            startingPort++;
            createNewServer();
            return;
        }
        console.log(`Servidor gRPC escuchando en el puerto ${port}`);

        server.start();
    });
}

function createNewServer() {
    startServer(startingPort);
}

// Iniciar el primer servidor
createNewServer();