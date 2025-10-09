#!/bin/bash

# Script utilitaire pour gérer les dossiers générés automatiquement
# Usage: ./manage-folders.sh [command]

cd "$(dirname "$0")"

echo "🛠️  Gestionnaire des dossiers générés automatiquement"
echo "=================================================="

case "${1:-help}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [commande]"
        echo ""
        echo "Commandes disponibles :"
        echo "  setup     - Créer tous les dossiers nécessaires"
        echo "  clean     - Nettoyer le contenu des dossiers (garder la structure)"
        echo "  reset     - Supprimer et recréer tous les dossiers"
        echo "  status    - Afficher l'état actuel des dossiers"
        echo "  size      - Afficher la taille occupée par chaque dossier"
        echo "  help      - Afficher cette aide"
        echo ""
        echo "Exemples :"
        echo "  $0 setup    # Créer les dossiers si manquants"
        echo "  $0 clean    # Vider le contenu des dossiers"
        echo "  $0 status   # Voir l'état des dossiers"
        ;;

    "setup")
        echo "🔧 Configuration des dossiers..."
        npm run dev &
        SERVER_PID=$!
        sleep 3
        kill $SERVER_PID 2>/dev/null
        echo "✅ Dossiers configurés avec succès !"
        ;;

    "clean")
        echo "🧹 Nettoyage du contenu des dossiers..."
        rm -rf uploads/* data/*.json data/sql/*.sql logs/*.log 2>/dev/null || true
        echo "✅ Contenu nettoyé !"
        ;;

    "reset")
        echo "🔄 Réinitialisation complète des dossiers..."
        rm -rf uploads data logs tests 2>/dev/null || true
        echo "📁 Recréation des dossiers..."
        npm run dev &
        SERVER_PID=$!
        sleep 3
        kill $SERVER_PID 2>/dev/null
        echo "✅ Réinitialisation terminée !"
        ;;

    "status")
        echo "📊 État actuel des dossiers :"
        echo ""

        # Vérifier chaque dossier
        for dir in uploads data logs tests; do
            if [ -d "$dir" ]; then
                file_count=$(find "$dir" -type f 2>/dev/null | wc -l)
                echo "📁 $dir : ✅ Existe ($file_count fichiers)"
            else
                echo "📁 $dir : ❌ N'existe pas"
            fi
        done

        echo ""
        echo "📋 Structure détaillée :"
        find uploads data logs tests -type d 2>/dev/null | sort || echo "Certains dossiers sont vides"
        ;;

    "size")
        echo "📊 Taille occupée par les dossiers :"
        echo ""
        du -sh uploads data logs tests 2>/dev/null || echo "Certains dossiers sont vides"
        echo ""
        echo "📈 Détail par dossier :"
        for dir in uploads data logs tests; do
            if [ -d "$dir" ]; then
                echo "📁 $dir :"
                find "$dir" -type f -exec ls -lh {} \; 2>/dev/null | head -5
                echo ""
            fi
        done
        ;;

    *)
        echo "❌ Commande inconnue : $1"
        echo "Utilisez '$0 help' pour voir les commandes disponibles"
        exit 1
        ;;
esac

echo ""
echo "🎯 Commandes rapides :"
echo "  $0 setup  # Configurer les dossiers"
echo "  $0 status # Voir l'état actuel"
echo "  $0 clean  # Nettoyer le contenu"
