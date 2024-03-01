import http.server
import socketserver
import json

# Define el puerto en el que deseas inicializar el servidor
PORT = 3000

# Definir objeto para usuario
class User:
    def __init__(self, id, name, password, isOpenSesion):
        self.id = id
        self.name = name
        self.password = password
        self.isOpenSesion = isOpenSesion

    def __str__(self):
        return f"id: {self.id}, name: {self.name}, password: {self.password}, isOpenSesion: {self.isOpenSesion}"



# Arreglo para almacenar usuarios
users = []


# Define un manejador HTTP personalizado que maneje las solicitudes POST
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
    
    def respondToCustomer(self, message):
        # Responder al cliente con un mensaje de exito
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(message.encode('utf-8'))
        

    def handleAuthentication(self, isLogin):
        user_data = self.readQueryBody(self.headers)
        for user in users:
            if user.name == user_data['name'] and user.password == user_data['password']:
                user.isOpenSesion = isLogin
        
        self.respondToCustomer("Usuario recibido y almacenado correctamente")

    def do_POST(self):
        # Verifica si la solicitud es POST
        if self.path == '/register':
            user_data = self.readQueryBody(self.headers)

            idNewUser = -1
            if len(users) == 0:
                idNewUser = 1
            elif len(users) > 0:
                idNewUser = len(users) + 1

            user = User(idNewUser, user_data['name'], user_data['password'], False)
            
            # Agrega el usuario al arreglo 'users'
            users.append(user)
            
            self.respondToCustomer("Usuario recibido y almacenado correctamente")

            self.imprimirUser()

        elif self.path == '/login':
            self.handleAuthentication(True)
            self.imprimirUser()
        elif self.path == '/log_out':
            self.handleAuthentication(False)
            self.imprimirUser()



        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write("Ruta no encontrada".encode('utf-8'))



# Configurar el servidor un puerto
with socketserver.TCPServer(("", PORT), MiHandler) as httpd:
    print("Servidor iniciado en el puerto", PORT)
    # Iniciar el servidor
    httpd.serve_forever()
