import http.server
import socketserver
import json
import urllib.parse

# Define el puerto en el que deseas inicializar el servidor
PORT = 3000

# Definir objeto para usuario
class User:
    def __init__(self, id, name, password, isOpenSesion, peerPort):
        self.id = id
        self.name = name
        self.password = password
        self.isOpenSesion = isOpenSesion
        self.peerPort = peerPort

    def __str__(self):
        return f"id: {self.id}, name: {self.name}, password: {self.password}, isOpenSesion: {self.isOpenSesion}, peerPort: {self.peerPort}"
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "password": self.password,
            "isOpenSesion": self.isOpenSesion,
            "peerPort": self.peerPort
        }


# Arreglo para almacenar usuarios
users = []


# Definir un manejador HTTP personalizado que maneje las solicitudes POST
class MiHandler(http.server.BaseHTTPRequestHandler):
    def imprimirUser(self):
        for user in users:
            print(user)

    def readQueryBody(self, headers):
        # Lee el cuerpo de la solicitud
        content_length = int(headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        # Decodificar el JSON recibido y retornarlo
        return json.loads(post_data.decode('utf-8'))
    
    def respondToCustomer(self, data):
        # Responder al cliente con un mensaje de exito
        response = json.dumps(data)
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))
        

    def handleAuthentication(self):
        user_data = self.readQueryBody(self.headers)
        foundUser = False
        for user in users:
            if user.name == user_data['name'] and user.password == user_data['password']:
                foundUser = True
                user.isOpenSesion = True
                self.respondToCustomer({"message": "Successful login", "user": user.to_dict() })

        if foundUser == False:
            self.respondToCustomer({"message":"Name or password invalid", "user": user.to_dict()})


    def handleLogOut(self):
        idUser = int(self.path.split('/')[-1])  # Último segmento de la URL
        print(idUser)
        for user in users:
            if user.id == idUser: 
                user.isOpenSesion = False
                self.respondToCustomer({"message": "Session closed successfully"})
    


    def do_POST(self):
        if self.command == 'POST':
            if self.path == '/register':
                user_data = self.readQueryBody(self.headers)

                idNewUser = -1
                if len(users) == 0:
                    idNewUser = 1
                elif len(users) > 0:
                    idNewUser = len(users) + 1

                user = User(idNewUser, user_data['name'], user_data['password'], False, user_data['port'])
                
                # Agregar el usuario al arreglo 'users'
                users.append(user)
                
                self.respondToCustomer({"message": "Usuario recibido y almacenado correctamente"})

                self.imprimirUser()

            elif self.path == '/login':
                print("SI ENTRAA 1")
                self.handleAuthentication()
                self.imprimirUser()
            elif self.path.startswith('/log_out/'):
                self.handleLogOut()
                self.imprimirUser()
            # elif self.path == '/index':
            #     print("SI ENTRAA")
            #     self.handleFileInsertion()
            #     self.imprimirUser()

            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write("Ruta no encontrada".encode('utf-8'))
    
        
    def do_GET(self):
        if self.command == 'GET':
            if self.path.startswith('/search'):
                query = urllib.parse.urlparse(self.path).query
                params = urllib.parse.parse_qs(query)
                id_entero = int(params['id'][0])
                print(id_entero)
                ports = []
                for user in users:
                    if id_entero != user.id:
                        ports.append(user.peerPort)
                
                # Estructura de la respuesta como un objeto JSON
                response_data = {
                    "menssage": "Operación exitosa",
                    "ports": ports
                }
                
                # Convierte el objeto JSON a una cadena y envía la respuesta al cliente
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))



# Configurar el servidor un puerto
with socketserver.TCPServer(("", PORT), MiHandler) as httpd:
    print("Servidor iniciado en el puerto", PORT)
    # Iniciar el servidor
    httpd.serve_forever()
