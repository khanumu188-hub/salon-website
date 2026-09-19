"""
Aura Luxury Hair Lounge - Local HTTPS Dev Server
Automatically generates local self-signed SSL certificates and starts an HTTPS server.
"""

import http.server
import ssl
import os
import subprocess
import sys

PORT = 3443
CERT_FILE = "localhost.pem"
KEY_FILE = "localhost-key.pem"

def generate_self_signed_cert():
    if os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        return

    print("Generating local self-signed SSL certificate for https://localhost:" + str(PORT) + "...")
    try:
        # Generate with openssl if available
        cmd = [
            "openssl", "req", "-x509", "-newkey", "rsa:2048",
            "-keyout", KEY_FILE, "-out", CERT_FILE,
            "-days", "365", "-nodes",
            "-subj", "/CN=localhost"
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("✓ SSL Certificate generated successfully.")
    except Exception:
        # Fallback to python cryptography or ad-hoc cert if openssl is not in PATH
        try:
            from cryptography import x509
            from cryptography.x509.oid import NameOID
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.asymmetric import rsa
            from cryptography.hazmat.primitives import serialization
            import datetime
            import ipaddress

            key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
            with open(KEY_FILE, "wb") as f:
                f.write(key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption()
                ))

            subject = issuer = x509.Name([
                x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
            ])
            cert = x509.CertificateBuilder().subject_name(
                subject
            ).issuer_name(
                issuer
            ).public_key(
                key.public_key()
            ).serial_number(
                x509.random_serial_number()
            ).not_valid_before(
                datetime.datetime.utcnow()
            ).not_valid_after(
                datetime.datetime.utcnow() + datetime.timedelta(days=365)
            ).add_extension(
                x509.SubjectAlternativeName([x509.DNSName(u"localhost"), x509.IPAddress(ipaddress.IPv4Address("127.0.0.1"))]),
                critical=False,
            ).sign(key, hashes.SHA256())

            with open(CERT_FILE, "wb") as f:
                f.write(cert.public_bytes(serialization.Encoding.PEM))
            print("✓ Python cryptography SSL Certificate generated successfully.")
        except Exception as e:
            print(f"Note: Install cryptography or openssl to generate local certificate ({e})")

def run_https_server():
    generate_self_signed_cert()
    
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

    if os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        print(f"\n=======================================================")
        print(f"✨ Aura Luxury Hair Lounge is running on HTTPS:")
        print(f"🔒 https://localhost:{PORT}")
        print(f"=======================================================\n")
    else:
        print(f"\nRunning on standard HTTP: http://localhost:{PORT}")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == '__main__':
    run_https_server()
