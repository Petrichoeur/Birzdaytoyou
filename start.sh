#!/bin/bash
echo "🕯️  Démarrage du serveur gothique..."
echo "   Ouvrez votre navigateur à : http://localhost:8080"
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""
python3 -m http.server 8080
