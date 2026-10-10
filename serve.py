"""Local server for Let's Cook. Run: python serve.py  (then open http://localhost:5173)

Camera and microphone only work on a secure origin, and localhost counts as one.
To test on a tablet over Wi-Fi, use Chrome's port forwarding (chrome://inspect) or an
HTTPS tunnel, because a plain http://<laptop-ip> address will block camera and mic.
"""
import http.server
import mimetypes
import os
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
ROOT = os.path.dirname(os.path.abspath(__file__))
TYPES = {'.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8',
         '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json'}


class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def do_GET(self):
        path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
        if path.endswith('/'):
            path += 'index.html'
        full = os.path.normpath(os.path.join(ROOT, path.lstrip('/')))
        if not full.startswith(ROOT) or not os.path.isfile(full):
            body = b'Not found'
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        with open(full, 'rb') as f:
            data = f.read()
        ext = os.path.splitext(full)[1].lower()
        self.send_response(200)
        self.send_header('Content-Type', TYPES.get(ext) or mimetypes.guess_type(full)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)  # one write per file: no partial, stalled transfers
        self.wfile.flush()

    def log_message(self, fmt, *args):
        pass


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True


if __name__ == '__main__':
    server = Server(('127.0.0.1', PORT), Handler)
    print(f"Let's Cook running at http://localhost:{PORT}")
    server.serve_forever()
