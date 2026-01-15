#!/usr/bin/env python3
"""
CORS Proxy Server - Forwards requests to Render API
This solves CORS issues when testing from localhost
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import json
from urllib.parse import urlparse, parse_qs
import ssl

RENDER_API = 'https://locali-corp.onrender.com'

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse the path
        path = self.path

        # Special case for health check
        if path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'proxy': 'active'}).encode())
            return

        # Remove leading slash and construct full URL
        api_path = path if path.startswith('/') else '/' + path
        target_url = RENDER_API + api_path

        print(f"Proxying: {target_url}")

        try:
            # Create SSL context that ignores certificate verification
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE

            # Make the request to the actual API
            req = urllib.request.Request(target_url)
            req.add_header('User-Agent', 'Mozilla/5.0')

            with urllib.request.urlopen(req, context=context) as response:
                data = response.read()

                # Send response back to client with CORS headers
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.send_header('Content-Length', len(data))
                self.end_headers()
                self.wfile.write(data)

        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = json.dumps({'error': str(e)}).encode()
            self.wfile.write(error_response)

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Suppress default logging"""
        print(f"[PROXY] {format % args}")

if __name__ == '__main__':
    PORT = 8765
    server = HTTPServer(('127.0.0.1', PORT), ProxyHandler)
    print(f"CORS Proxy running on http://127.0.0.1:{PORT}")
    print(f"Forwarding to: {RENDER_API}")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nProxy stopped")
