## Topicos en telematica 2024-1 st0263

### Estudiante
- Juan Jose Muñoz Florez
- jjmunozf@eafit.edu.co

### Profesor
- Alvaro Enrique Ospina
- aeospinas@eafit.edu.co


# P2P - Comunicación entre procesos mediante API REST y RPC

## Descripción
Este proyecto implementa un sistema P2P donde cada nodo contiene microservicios para soportar un sistema de compartición de archivos distribuido y descentralizado. La comunicación entre los nodos se realiza mediante API REST y RPC. Los microservicios incluidos son Login, Register, Log-Out, SaveFiles y SearchFiles

### 1.1. Aspectos cumplidos/desarrollados
- Se implementaron los servicios de registro, inicio de sesión, cierre de sesión, guardar archivos, obtener puertos y busqueda archivos según los requisitos funcionales.
- Se utilizó gRPC para la comunicación entre los nodos.
- Se manejó la concurrencia en los microservicios del servidor.
- Se implementaron mecanismos de manejo de errores y respuesta a los clientes.

### 1.2. Aspectos no cumplidos/desarrollados
- No se exploraron otras alternativas de red no estructurada o estructurada.

## 2. Información general de diseño
- **Arquitectura**: Sistema P2P con microservicios.
- **Patrones y mejores prácticas**: Implementación de concurrencia, manejo de errores, y separación de responsabilidades.
  
## 3.1. Ambiente de desarrollo y técnico de los peers
- **Lenguaje de programación**: JavaScript (Node.js).
- **Librerías y paquetes**: gRPC 1.10.1, axios 1.6.7, express 4.18.2
- **Compilación y ejecución**: pServer se compila y ejecuta llendo al directorio donde se encuentra este archivo y ejecutando por consola 'node pServer.js', esto inicializara el servidor del peer en un puerto especifico

pClient se compila y se ejecuta llendo al directorio donde se encuentra este archivo y ejecutando por consola 'node pClient.js puerto_donde_corre_pServer_respectivo', ej: 'pClient.js 50051'

Se especifica un puerto dinamico en este caso ya que cada peer cuenta con pClient y pServer y la idea es que pClient envie solicitudes a el pServer correspondiente, esto permite la comunicacion entre 2 peers diferentes


- **Detalles técnicos**: Implementación de servicios gRPC entre peers y manejo de solicitudes HTTP desde pServer a server.

## 3.2. Ambiente de desarrollo y técnico server principal
- **Lenguaje de programación**: python 3.
- **Librerías y paquetes**: http.server, socketserver, json, urllib.parse.
- **Compilación y ejecución**: Se compila y ejecuta utilizando desde una terminal llendo al directorio donde esta el archivo server.py y ejecutando el comando 'python3 server.py' 
- **Detalles técnicos**: Implementación de servicios gRPC y manejo de solicitudes HTTP.

### 4. Configuración de parámetros del proyecto

La configuración de parámetros del proyecto se realiza principalmente a través de archivos de configuración específicos para cada nodo. A continuación se detallan los parámetros configurables:

- **Puerto de escucha de pServer**: A cada nodo que se inicializa se le asigna un puerto de escucha para las solicitudes entrantes, si el puerto ya esta en uso entonces se busca un puerto el cual este disponibleEsto se configura en el archivo de configuración del servidor `pServer.py`.

- **Puerto de transmision de pClient**: A cada nodo 'pClient' que se inicialice, se le debe especificar el puerto por consola del servidor gRPC al que va a transmitir las solicitudes. Ej: 'node pClient.js 50051'.

- **Directorio de archivos compartidos**: Cada nodo `pServer` debe especificar el directorio local (variable) donde se encuentran los archivos que desea compartir con otros nodos. Inicialmente esta variable esta vacia en `pServer.py`, sin embargo uno de los servicios le permite al usuario guardar archivos localmente.

- **puerto de peer amigo titular**: Cada vez que un usuario se registra, se registra a su vez el puerto del servidor donde esta corriendo el pServer correspondiente. Este puerto se guarda en el servidor principal junto con los demas datos del usuario. Ejemplo : Users : [{'id': 1, 'name': 'juan', 'password': '000', 'isOpenSesion': true,  'peerPort': 50051}]. De esta manera, si un peer amigo como [{'id': 2, 'name': 'pepe', 'password': '111', 'isOpenSesion': true,  'peerPort': 50052}] desea buscar archivos, entonces pepe utilizara el servicio `Search` y se empezara una busqueda en `server.py` de todos los `peerPort`; para terminos de este ejemplo, se encontro uno puerto dfierente al actual el cual es el puerto 50051, en este caso se realiza una solicitud gRPC hacia este puerto y como respuesta, suponiendo que hay archivos guardados, el usuario pepe optiene estos archivos de la variable que esta en `pServer` el cual esta corriendo en el puerto gRPC 50051




## 5. Otra información relevante
- Referencias: [Sitio 1](https://daily.dev/blog/build-a-grpc-service-in-nodejs), [Sitio 2](https://grpc.io/docs/languages/node/basics/)
