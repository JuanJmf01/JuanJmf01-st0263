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

const registerClient = new servicesProto.RegisterService('localhost:50051', grpc.credentials.createInsecure());

const loginClient = new servicesProto.LoginService('localhost:50051', grpc.credentials.createInsecure());


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function realizarAccion(opcion) {
    if (opcion === '1') {
        rl.question("Enter a name: ", (name) => {
            rl.question("Enter a password: ", (password) => {
                const solicitud = { name: name, password: password };
                registerClient.Register(solicitud, (error, respuesta) => {
                    if (!error) {
                        console.log(respuesta.mensaje);
                    } else {
                        console.error('Error:', error);
                    }
                });
            });
        })

    } else if (opcion === '2') {
        rl.question("Enter a name: ", (name) => {
            rl.question("Enter a password: ", (password) => {
                const solicitud = { name: name, password: password };
                loginClient.Login(solicitud, (error, respuesta) => {
                    if (!error) {
                        console.log(respuesta.mensaje);
                    } else {
                        console.error('Error:', error);
                    }
                });
            });
        });

        console.log("Opción de login seleccionada.");
    } else if (opcion === '3') {
        console.log("Saliendo...");
        rl.close();
        process.exit(0); // Termina el proceso
    } else {
        console.log("Opción inválida.");
    }
}

function preguntarOpcion() {
    rl.question("Seleccione una opción:\n1. Register\n2. Login\n3. Salir\n", (answer) => {
        realizarAccion(answer);
        if (answer !== '3') {
            preguntarOpcion(); // Llamar recursivamente a preguntarOpcion si la opción no es '3'
        }
    });
}

preguntarOpcion(); // Llamar a la función para iniciar el ciclo
