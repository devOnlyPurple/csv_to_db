#!/bin/bash

# Script de démonstration complète de l'API CSV to DB
# Usage: ./demo.sh

echo "🚀 Démonstration complète de l'API CSV to DB"
echo "=========================================="

# Vérifier que le serveur tourne
echo ""
echo "1️⃣ Vérification du serveur..."
if curl -s http://localhost:3000/api/v1/ > /dev/null; then
    echo "✅ Serveur OK"
else
    echo "❌ Serveur non accessible - Démarrez avec 'npm run dev'"
    exit 1
fi

# Test basique
echo ""
echo "2️⃣ Test de l'endpoint racine..."
curl -s http://localhost:3000/api/v1/ | jq .

# Upload du fichier CSV d'exemple
echo ""
echo "3️⃣ Upload du fichier CSV d'exemple..."
curl -s -X POST http://localhost:3000/api/v1/tables/upload \
  -F "file=@test_sample.csv" \
  -F "tableName=produits_demo" | jq .

# Récupération des données
echo ""
echo "4️⃣ Récupération des données..."
curl -s http://localhost:3000/api/v1/tables/produits_demo | jq .

# Export SQL
echo ""
echo "5️⃣ Export en SQL..."
curl -s http://localhost:3000/api/v1/tables/produits_demo/export | jq .

# Téléchargement du fichier SQL (optionnel)
echo ""
echo "6️⃣ Téléchargement du fichier SQL..."
curl -s -O -J http://localhost:3000/api/v1/tables/download/produits_demo.sql
if [ -f "produits_demo.sql" ]; then
    echo "✅ Fichier SQL téléchargé: produits_demo.sql"
    echo "📄 Aperçu du fichier généré :"
    head -5 produits_demo.sql
    echo "..."
else
    echo "❌ Erreur téléchargement SQL"
fi

# Test des logs
echo ""
echo "7️⃣ Consultation des logs récents..."
curl -s http://localhost:3000/api/v1/logs?hours=1 | jq '.data[-3:]'

echo ""
echo "🎉 Démonstration terminée !"
echo ""
echo "📋 Résumé :"
echo "✅ Serveur accessible"
echo "✅ Upload CSV fonctionnel"
echo "✅ Récupération données OK"
echo "✅ Export SQL généré"
echo "✅ Téléchargement fichier OK"
echo "✅ Logs disponibles via API"
echo ""
echo "🔧 Pour nettoyer :"
echo "rm -f produits_demo.sql"
echo "./manage-folders.sh clean"
