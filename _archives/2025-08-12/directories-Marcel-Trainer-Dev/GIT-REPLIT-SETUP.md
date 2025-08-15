
# Configuration Git pour Replit

1. Initialiser Git (si pas déjà fait):
   git init

2. Ajouter le remote Replit:
   git remote add replit https://github.com/[TON-USERNAME]/marcel-trainer-dev.git
   
   OU si tu utilises Replit Git:
   git remote add replit https://replit.com/@[TON-USERNAME]/marcel-trainer-dev.git

3. Premier push:
   git add .
   git commit -m "Initial sync from local"
   git push -u replit main

4. Synchronisations futures:
   npm run sync        # Prépare les fichiers
   git add .
   git commit -m "Update from local"
   git push replit main
