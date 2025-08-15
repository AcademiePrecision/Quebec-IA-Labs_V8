#!/bin/bash
# start-all.sh - Démarrer tout l'écosystème

echo "🚀 Démarrage Québec IA Labs..."

# Terminal 1: Serveur principal
echo "Starting server..."
cd quebec-ia-labs && npm start &

# Terminal 2: App mobile (optionnel)
read -p "Lancer l'app mobile? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cd ../academie-precision-app && npm run mobile &
fi

echo "✅ Systèmes démarrés!"
echo "📍 Serveur: http://localhost:3000"
echo "📍 Marcel: http://localhost:3000/test-marcel"
