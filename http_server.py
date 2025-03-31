import http.server
import socketserver
import os

# Define the port to serve on
PORT = 8080

# Create a custom request handler
class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Handle root requests to serve game.html
        if path == '/' or path == '/index.html':
            return os.path.abspath('game.html')
        # Otherwise continue with default behavior
        return super().translate_path(path)

# Set up the HTTP server
Handler = CustomHTTPRequestHandler
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serving at http://0.0.0.0:{PORT}")
    httpd.serve_forever()