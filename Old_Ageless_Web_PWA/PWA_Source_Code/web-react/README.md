React conversion workspace

- Source: ./src
- Static/public (copied as-is by bundler): ./public
- Build output target (configured in bundler): ../web/react-build/

Notes
- Use CSP nonce injection in index.html when loading built scripts.
- Keep legacy UI under ../web/ until full parity.
