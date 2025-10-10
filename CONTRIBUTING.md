# Guide de Contribution

Bienvenue ! 👋 Ce guide vous aidera à contribuer efficacement à ce projet.

## 🚀 Démarrage rapide

### Prérequis

- Node.js v18+
- npm ou yarn
- Git

### Configuration du développement

```bash
# 1. Fork le projet sur GitHub
# 2. Clonez votre fork
git clone https://github.com/devOnlyPurple/csv_to_db.git
cd csv_to_db

# 3. Installez les dépendances
npm install

# 4. Lancez les tests pour vérifier que tout fonctionne
npm test

# 5. Démarrez le serveur de développement
npm run dev
```

## 🧪 Tests

**Important :** Tous les nouveaux développements doivent inclure des tests.

### Structure des tests

```
tests/
├── unit/           # Tests unitaires
├── integration/    # Tests d'intégration
└── e2e/           # Tests end-to-end
```

### Commandes de test

```bash
# Lancer tous les tests
npm test

# Tests en mode watch (développement)
npm run test:watch

# Coverage des tests
npm run test:coverage

# Tests d'un fichier spécifique
npm test nom_du_fichier.test.js
```

## 🔧 Standards de code

### ESLint

Le code doit respecter les règles ESLint définies.

```bash
# Vérifier le linting
npm run lint

# Corriger automatiquement les problèmes
npm run lint:fix
```

### Commits

Utilisez des messages de commit clairs et concis :

```
feat: ajout d'une nouvelle fonctionnalité
fix: correction d'un bug
docs: mise à jour de la documentation
test: ajout de tests
refactor: amélioration du code sans changement fonctionnel
```

## 📋 Processus de contribution

### 1. Choisir une issue

- Consultez les [issues ouvertes](https://github.com/devOnlyPurple/csv_to_db/issues)
- Cherchez les labels `good first issue`, `help wanted`, `enhancement`
- Commentez sur l'issue pour indiquer que vous travaillez dessus

### 2. Créer une branche

```bash
git checkout -b feature/nom-de-votre-feature
# ou
git checkout -b fix/nom-du-bug
```

### 3. Développer

- Écrivez du code propre et testé
- Respectez les standards ESLint
- Ajoutez des tests si nécessaire
- Mettez à jour la documentation

### 4. Tester

```bash
# Lancez les tests
npm test

# Vérifiez le linting
npm run lint

# Testez manuellement l'application
npm run dev
```

### 5. Commiter et pousser

```bash
git add .
git commit -m "feat: description concise de la modification"
git push origin feature/nom-de-votre-feature
```

### 6. Créer une Pull Request

- Allez sur GitHub
- Cliquez sur "Compare & pull request"
- Décrivez clairement vos changements
- Référencez l'issue liée (ex: "Closes #123")

## 🎯 Types de contributions acceptées

### 🐛 Corrections de bugs

- Correction de bugs existants
- Amélioration des messages d'erreur
- Gestion des cas limites

### ✨ Nouvelles fonctionnalités

- Support de nouveaux formats de fichiers
- Nouveaux endpoints API
- Améliorations UX/UI

### 📚 Documentation

- Amélioration du README
- Ajout d'exemples d'utilisation
- Documentation des fonctions

### 🧪 Tests

- Tests unitaires pour les nouvelles fonctionnalités
- Tests d'intégration
- Amélioration de la couverture de tests

## 🏆 Critères d'acceptation des PR

- ✅ **Tests** : Tous les tests passent
- ✅ **Linting** : ESLint passe sans erreur
- ✅ **Documentation** : README mis à jour si nécessaire
- ✅ **Fonctionnalité** : La nouvelle feature fonctionne comme attendu
- ✅ **Code review** : Au moins une approbation

## 🤝 Bonnes pratiques

### Communication

- Soyez respectueux et constructif
- Expliquez clairement vos intentions
- Répondez aux commentaires de review

### Qualité du code

- Écrivez du code lisible et maintenable
- Commentez les parties complexes
- Respectez les conventions du projet

### Tests

- Testez tous les cas d'usage
- Incluez des tests pour les cas d'erreur
- Maintenez une bonne couverture de tests

## 🆘 Besoin d'aide ?

- Consultez les [issues existantes](https://github.com/devOnlyPurple/csv_to_db/issues)
- Posez vos questions sur les issues
- La communauté est là pour aider !

---

Merci pour votre contribution ! 🎉
