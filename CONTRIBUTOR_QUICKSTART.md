# 🚀 Guide de Démarrage Rapide pour Contributeurs

## 🎯 Pour les contributeurs débutants

### Étape 1 : Préparation de l'environnement
```bash
# 1. Fork le projet sur GitHub (bouton Fork en haut à droite)

# 2. Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/csv_to_db.git
cd csv_to_db

# 3. Ajouter le repo original comme remote
git remote add upstream https://github.com/dev-akw/csv_to_db.git

# 4. Installer les dépendances
npm install

# 5. Vérifier que tout fonctionne
npm test
npm run dev
```

### Étape 2 : Choisir une tâche
```bash
# Consulter les issues disponibles
# https://github.com/dev-akw/csv_to_db/issues

# Chercher les labels :
# - good first issue (parfait pour débuter)
# - help wanted (besoin d'aide spécifique)
# - hacktoberfest (compte pour Hacktoberfest)
```

### Étape 3 : Développement
```bash
# Créer une branche pour votre contribution
git checkout -b feature/votre-nom-de-feature

# Exemple : améliorer les logs
git checkout -b feature/better-error-messages

# Développer votre fonctionnalité
# (éditer les fichiers avec votre IDE)

# Tester vos changements
npm test
npm run lint

# Ajouter et commiter
git add .
git commit -m "feat: amélioration des messages d'erreur

- Messages d'erreur plus explicites
- Gestion des cas limites
- Tests ajoutés pour validation"

# Pousser vers votre fork
git push origin feature/votre-nom-de-feature
```

### Étape 4 : Pull Request
```bash
# 1. Aller sur GitHub → Votre fork
# 2. Cliquer "Compare & pull request"
# 3. Sélectionner votre branche
# 4. Ajouter une description claire
# 5. Cliquer "Create pull request"
```

## 📋 Checklist avant PR

- [ ] Tests passent (`npm test`)
- [ ] ESLint OK (`npm run lint`)
- [ ] README mis à jour si nécessaire
- [ ] Description de PR complète
- [ ] Lien vers issue résolue

## 🎉 Après la PR

1. **Attendre la review** (peut prendre quelques jours)
2. **Répondre aux commentaires** si besoin de modifications
3. **PR mergée** = contribution validée pour Hacktoberfest !
4. **Votre nom** apparaîtra dans les contributeurs

## 🆘 Besoin d'aide ?

- **Issues** : Posez vos questions sur les issues existantes
- **Discussions** : Utilisez GitHub Discussions si disponibles
- **Community** : La communauté Node.js est très accueillante

---

**Rappel** : Toute contribution compte, même petite !
Une correction de faute ou une amélioration de commentaire est précieuse.

🚀 **Bonne contribution et bon Hacktoberfest !** 🎉
