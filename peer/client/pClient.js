const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');
const PROTO_PATH = "../services.proto";

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const servicesProto = grpc.loadPackageDefinition(packageDefinition);

const portC = process.argv[2]; // Obtener el puerto del argumento de línea de comandos
const serverAddress = `localhost:${portC}`;

/* The code snippet you provided is creating gRPC client instances for different services defined in your protocol buffer file (`services.proto`). Here's what each client is doing: */
const registerClient = new servicesProto.RegisterService(serverAddress, grpc.credentials.createInsecure());
const loginClient = new servicesProto.LoginService(serverAddress, grpc.credentials.createInsecure());
const logOutClient = new servicesProto.LogOutService(serverAddress, grpc.credentials.createInsecure());
const saveFilesClient = new servicesProto.SaveFilesService(serverAddress, grpc.credentials.createInsecure());
const getPortsClient = new servicesProto.GetPortsService(serverAddress, grpc.credentials.createInsecure());


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const setTime = 1500
let user = { id: 0, name: '', password: '', isOpenSesion: false }

function realizarAccion(opcion) {
    if (opcion === '1' && user.isOpenSesion === false) { //Register
        rl.question("Enter a name: ", (name) => {
            rl.question("Enter a password:", (password) => {
                register(name, password)
            });
        })

    } else if (opcion === '2' && user.isOpenSesion === false) { //Login
        rl.question("Enter a name: ", (name) => {
            rl.question("Enter a password: ", (password) => {
                login(name, password)
            });
        })

    } else if ((opcion === '1' && user.isOpenSesion === true)) { //Log-out
        logOut()
    } else if (opcion === '2' && user.isOpenSesion === true) { // Save files
        const files = generarArchivosAleatorios()

        saveFiles(files)

    } else if (opcion === '3' && user.isOpenSesion === true) {  //Get files other peer
        const solicitud = { id: user.id };
        getPortsClient.GetPorts(solicitud, (error, respuesta) => {
            if (!error) {
                const ports = respuesta.ports;
                console.log(ports)
                console.log(`\n${respuesta.mensaje} \n`);
                for (let i = 0; i < ports.length; i++) {
                    let port = parseInt(ports[i])
                    getFiles(port)

                }
                setTimeout(mostrarMenu, setTime);
            } else {
                console.log(`\n${error} \n`);
                setTimeout(mostrarMenu, setTime);
            }
        });

    } else if (opcion === '3' || (opcion === '4' && user.isOpenSesion === true)) {
        console.log("Saliendo...");
        rl.close();
        process.exit(0); // Termina el proceso
    } else {
        console.log("Opción inválida.");
        mostrarMenu();
    }

}

/**
 * The function "mostrarMenu" displays different menu options based on the user's ID and session
 * status.
 */
function mostrarMenu() {
    if (user.id === 0) {
        rl.question("Seleccione una opción:\n1. Register\n2. Login\n3.Salir del menu\n", (answer) => {
            realizarAccion(answer);
        });
    } else if (user.id != 0 && user.isOpenSesion === true) {
        rl.question("Seleccione una opción:\n1.Log-out\n2. insertar archivos\n3.searh files \n4.Salir del menu\n", (answer) => {
            realizarAccion(answer);
        });
    }
}

/**
 * The `register` function takes a name and password, sends a registration request to a client, and
 * handles the response accordingly.
 * @param name - The `name` parameter in the `register` function is the name of the user who is
 * registering. It is a string value that represents the name of the user.
 * @param password - The `password` parameter in the `register` function is used to store the password
 * provided by the user during the registration process. It is passed as an argument to the function
 * along with the `name` parameter, which stores the user's name.
 */
function register(name, password) {
    const solicitud = { name: name, password: password };
    registerClient.Register(solicitud, (error, respuesta) => {
        if (!error) {
            console.log(`\n${respuesta.mensaje} \n`);
            setTimeout(mostrarMenu, setTime);
        } else {
            console.log(`\n${error} \n`);
            setTimeout(mostrarMenu, setTime);
        }
    });
}

/**
 * The function `login` takes a name and password, sends a login request, and handles the response
 * accordingly.
 * @param name - The `name` parameter in the `login` function is typically the username or email
 * entered by the user trying to log in. It is used to identify the user and authenticate them.
 * @param password - It seems like you might have missed providing the value for the `password`
 * parameter in the `login` function. The `password` parameter is required for the function to
 * authenticate the user. You should pass the user's password as an argument when calling the `login`
 * function.
 */
function login(name, password) {
    const solicitud = { name: name, password: password };
    loginClient.Login(solicitud, (error, respuesta) => {
        if (!error) {
            if (respuesta.user.isOpenSesion === true) {
                user = respuesta.user;
                console.log(`\n${respuesta.mensaje} \n`);
                console.log(user);
                setTimeout(mostrarMenu, setTime);
            } else {
                console.log(`\n${respuesta.mensaje} \n`);
                setTimeout(mostrarMenu, setTime);
            }
        } else {
            console.log(`\n${error} \n`);
            setTimeout(mostrarMenu, setTime);
        }
    });
}

/**
 * The `logOut` function logs out the user by sending a request to the server and updating the user
 * information accordingly.
 */
function logOut() {
    const solicitud = { id: user.id };
    logOutClient.LogOut(solicitud, (error, respuesta) => {
        if (!error) {
            user = respuesta.user;
            console.log(`\n${respuesta.mensaje} \n`);
            user = { id: 0, name: '', password: '', isOpenSesion: false }
            setTimeout(mostrarMenu, setTime);
        } else {
            console.log(`\n${error} \n`);
            setTimeout(mostrarMenu, setTime);
        }
    });
}

/**
 * The function `saveFiles` saves files using a client-side method and displays a message based on the
 * response.
 * @param files - The `files` parameter in the `saveFiles` function is an array that contains the files
 * to be saved. Each element in the array represents a file that needs to be saved.
 */
function saveFiles(files) {
    const solicitud = { files: files };
    saveFilesClient.SaveFiles(solicitud, (error, respuesta) => {
        if (!error) {
            console.log(`\n${respuesta.mensaje} \n`);
            setTimeout(mostrarMenu, setTime);
        } else {
            console.log(`\n${error} \n`);
            setTimeout(mostrarMenu, setTime);
        }
    });
}

/**
 * The function `getFiles` makes a gRPC call to a service to retrieve files based on a user ID and
 * handles the response accordingly.
 * @param port - The `port` parameter in the `getFiles` function is used to specify the port number on
 * which the gRPC server is running. This port number is needed to establish a connection with the
 * server and make requests to retrieve files.
 */
function getFiles(port) {
    console.log(port)
    const getFilesClient = new servicesProto.GetFilesService(`localhost:${port}`, grpc.credentials.createInsecure());
    const solicitud = { id: user.id };

    getFilesClient.GetFiles(solicitud, (error, respuesta) => {
        if (!error) {
            const files = respuesta.files;
            console.log(`\n ${respuesta.mensaje} \n`);
            console.log(`\n Files: ${files} \n`);
            setTimeout(mostrarMenu, setTime);
        } else {
            console.log(`\n${error} \n`);
            setTimeout(mostrarMenu, setTime);
        }
    });
}

/**
 * The function "generarArchivosAleatorios" generates an array of random file names.
 * @returns An array containing the names of two randomly generated files.
 */
function generarArchivosAleatorios() {
    files = []
    for (let i = 0; i < 2; i++) {
        const numeroAleatorio = Math.floor(Math.random() * 501); // Generar un numero aleatorio entre 0 y 500
        const nombreArchivo = `archivo${numeroAleatorio}`;
        files.push(nombreArchivo);
    }
    return files
}

mostrarMenu(); // Llamar a la función para iniciar el ciclo
