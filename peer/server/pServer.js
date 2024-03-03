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


/**
 * The function `register` takes a request object, sends a POST request to a specified URL with user
 * data, and returns a success or error message through a callback.
 * @param call - The `call` parameter seems to be an object containing the request data, specifically
 * the `name` and `password` properties. These properties are being extracted using destructuring
 * assignment in the function.
 * @param callback - The `callback` parameter in the `register` function is a function that will be
 * called once the asynchronous operation of making a POST request to the server is completed. It is
 * used to handle the response from the server and provide feedback to the caller of the `register`
 * function. The `callback`
 */
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


/**
 * The `login` function takes a request object with a name and password, sends a POST request to a
 * login endpoint with the user data, and returns a success message with user information or an error
 * message.
 * @param call - The `call` parameter seems to be an object containing the request data for the login
 * function. It likely has properties such as `name` and `password` which are being destructured in the
 * function as `call.request`.
 * @param callback - The `callback` parameter in the `login` function is a function that is used to
 * send a response back to the caller of the function. It is typically used in asynchronous operations
 * to handle the result of an operation. In this case, the `callback` function is called with either a
 * success response
 */
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


/**
 * The `logOut` function sends a POST request to log out a user and returns a success message or an
 * error message.
 * @param call - The `call` parameter seems to be an object containing a `request` property, from which
 * the `id` is being extracted using destructuring. This `id` is then used in the axios POST request
 * URL.
 * @param callback - The `callback` parameter in the `logOut` function is a function that is used to
 * send a response back to the caller of the function. It is typically used in asynchronous operations
 * to handle the result of the operation. In this case, the `callback` function is called with two
 * arguments:
 */
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


/**
 * The `saveFiles` function saves files received in a request to a userFiles array and logs the updated
 * array.
 * @param call - The `call` parameter seems to be an object containing a `request` property, which in
 * turn contains a `files` property. This function is likely designed to save the files provided in the
 * `call.request.files` array to some storage.
 * @param callback - The `callback` parameter in the `saveFiles` function is a function that is passed
 * as an argument and is used to handle the response or result of the function execution. In this case,
 * the `callback` function is called with two arguments: `null` (indicating no error) and
 */
function saveFiles(call, callback) {
    const { files } = call.request;

    userFiles.push(...files)
    callback(null, { exitoso: true, mensaje: "Files inserted successfully" });
    console.log(`userFiles received   ${userFiles}`)
}


/**
 * The function `getPorts` makes a GET request to a specified URL with an ID parameter, retrieves data
 * including a message and ports, and then calls a callback function with the response.
 * @param call - The `call` parameter seems to be an object containing a `request` property, which in
 * turn contains an `id` property. This `id` is used to make a GET request to a specific URL endpoint
 * to retrieve some data related to ports.
 * @param callback - The `callback` parameter in the `getPorts` function is a function that will be
 * called once the asynchronous operation (axios GET request) is completed. It is used to send the
 * result of the operation back to the caller. The callback function takes two arguments: an error
 * object (if an error
 */
function getPorts(call, callback) {
    const { id } = call.request;

    axios.get(`${url}/search?id=${id}`)
        .then(response => {
            callback(null, { exitoso: true, mensaje: response.data.mensaje, ports: response.data.ports });
        })
        .catch(error => {
            console.error('Error:', error);
            callback(null, { exitoso: false, mensaje: 'Ups. Ha ocurrido un error :(' });
        });
}



/**
 * The function `getFiles` logs the userFiles to be sent and then calls the callback function with a
 * success message and the userFiles.
 * @param call - The `call` parameter in the `getFiles` function is typically used to pass any
 * additional information or configuration settings that may be needed for the function to execute
 * properly. It could be an object containing details about the request being made or any other
 * relevant data needed for processing.
 * @param callback - The `callback` parameter in the `getFiles` function is a function that will be
 * called once the operation is completed. It is typically used to handle the result of the operation
 * or any errors that may occur during the process. In this case, the `callback` function is called
 * with two arguments
 */
function getFiles(call, callback) {
    console.log(`userFiles to send  ${userFiles}`)
    callback(null, { mensaje: "files received successfully", files: userFiles });
}

/**
 * The function `startServer` creates a gRPC server with multiple services bound to specific ports
 * asynchronously.
 * @param port - The `port` parameter in the `startServer` function is the port number on which the
 * gRPC server will listen for incoming connections. This port number is used to bind the server to a
 * specific network interface and port so that clients can communicate with the server over the
 * network.
 */
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

// Iniciar el servidor
createNewServer();