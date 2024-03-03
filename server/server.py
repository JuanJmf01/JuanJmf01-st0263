import http.server
import socketserver
import json
import urllib.parse

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


class MiHandler(http.server.BaseHTTPRequestHandler):
    def imprimirUser(self):
        for user in users:
            print(user)

    def readQueryBody(self, headers):
        """
        The function `readQueryBody` reads the body of a request based on the content length specified
        in the headers.
        
        :param headers: The `headers` parameter in the `readQueryBody` method is a dictionary containing
        the headers of the HTTP request. It is used to extract the 'Content-Length' header value, which
        indicates the size of the request body that needs to be read
        """
        content_length = int(headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        return json.loads(post_data.decode('utf-8'))
    
    def respondToCustomer(self, data):
        """
        The function `respondToCustomer` sends a success message to the client with the provided data in
        JSON format.
        
        :param data: The `data` parameter in the `respondToCustomer` method is the information or message
        that you want to send back to the customer as a response. This data will be converted to a JSON
        string using `json.dumps(data)` before sending it back to the customer
        """
        response = json.dumps(data)
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))
        

    def handleAuthentication(self):
        """
        The function `handleAuthentication` checks user credentials and responds accordingly.
        """
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
        """
        This function logs out a user by setting their isOpenSession attribute to False.
        """
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
                
                # Convertir el objeto JSON a una cadena y envia la respuesta al cliente
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))



# The code block you provided is configuring and starting a TCP server using Python's `socketserver`
# module. Here's a breakdown of what each part does:
# Configurar el servidor un puerto
with socketserver.TCPServer(("", PORT), MiHandler) as httpd:
    print("Servidor iniciado en el puerto", PORT)
    httpd.serve_forever()
