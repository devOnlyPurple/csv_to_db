# CSV to Database Converter 🚀

[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2025-brightgreen)](https://hacktoberfest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)
[![Issues](https://img.shields.io/github/issues/dev-akw/csv_to_db)](https://github.com/dev-akw/csv_to_db/issues)
[![Contributors](https://img.shields.io/github/contributors/dev-akw/csv_to_db)](https://github.com/dev-akw/csv_to_db/graphs/contributors)

## 📖 About The Project

This project is a Node.js application that converts CSV files into database tables. It provides an easy way to:

- Upload CSV file
- Store CSV data as JSON on the server (data/db.json)
- Generate SQL scripts from the JSON data (data/sql/db.sql)
- Provide a direct download link for the generated SQL file
- Handle basic data type detection and column cleaning

Perfect for developers who need to migrate data from spreadsheets to databases!

## 🛠️ Built With

- Node.js
- Express.js
- Multer (file upload)
- CSV-Parse (CSV parsing)
- fs-extra (enhanced file system)

## 📁 Gestion automatique des dossiers

Cette application crée automatiquement les dossiers nécessaires au démarrage :

### Dossiers générés automatiquement :
- `uploads/` - Fichiers CSV uploadés temporairement
- `data/` - Données JSON des tables créées
- `data/sql/` - Fichiers SQL générés
- `logs/` - Fichiers de logs quotidiens

### Scripts utilitaires :

#### Script de gestion des dossiers :
```bash
# Voir l'aide
./manage-folders.sh help

# Créer les dossiers si manquants
./manage-folders.sh setup

# Nettoyer le contenu (garder la structure)
./manage-folders.sh clean

# Réinitialiser complètement
./manage-folders.sh reset

# Voir l'état actuel
./manage-folders.sh status

# Voir la taille occupée
./manage-folders.sh size
```

#### Commandes manuelles :
```bash
# Nettoyer les fichiers temporaires
rm -rf uploads/* data/*.json data/sql/*.sql

# Vérifier l'espace utilisé
du -sh uploads/ data/ logs/

# Consulter les logs en temps réel
tail -f logs/csv_to_db_$(date +%Y-%m-%d).log
```

### Configuration Git :
Ces dossiers sont automatiquement ignorés par Git (voir `.gitignore`) car ils contiennent :
- ❌ Des données utilisateur spécifiques
- ❌ Des fichiers temporaires
- ❌ Des logs de développement
- ✅ Chaque utilisateur aura ses propres dossiers

### Avantages :
- 🔄 **Auto-création** : Les dossiers se créent au premier démarrage
- 🛡️ **Sécurité** : Pas de données sensibles sur Git
- 🧹 **Maintenance facile** : Scripts de nettoyage intégrés
- 📊 **Monitoring** : Logs organisés par date

## 🚀 Démarrage rapide

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### Installation
```bash
npm install
```

### Démarrage
```bash
npm run dev
```

L'API sera disponible sur `http://localhost:3000`

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints disponibles

#### Accueil
```http
GET /
```
**Description:** Documentation de l'API
**Réponse:**
```json
{
  "success": true,
  "message": "Welcome to CSV to DB API",
  "data": [...]
}
```

#### Upload CSV
```http
POST /tables/upload
Content-Type: multipart/form-data

FormData:
- file: [CSV file]
- tableName: "my_table" (optional)
```

**Réponse:**
```json
{
  "success": true,
  "tableName": "my_table",
  "rows": 150
}
```

#### Récupérer les données d'une table
```http
GET /tables/:tableName
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "column1": "value1",
      "column2": "value2"
    }
  ]
}
```

#### Exporter une table en SQL
```http
GET /tables/:tableName/export
```

**Réponse:**
```json
{
  "success": true,
  "downloadUrl": "http://localhost:3000/api/v1/tables/download/my_table.sql"
}
```

#### Télécharger le fichier SQL généré
```http
GET /tables/download/:fileName
```

## 🤝 Contributing

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)
[![Open Issues](https://img.shields.io/github/issues/dev-akw/csv_to_db)](https://github.com/dev-akw/csv_to_db/issues)

### Comment contribuer ?

Ce projet participe à **Hacktoberfest 2025** ! Vous pouvez contribuer de plusieurs façons :

#### 🎯 Issues étiquetées pour débutants
- [`good first issue`](https://github.com/dev-akw/csv_to_db/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) - Parfait pour commencer
- [`help wanted`](https://github.com/dev-akw/csv_to_db/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) - Besoin d'aide
- [`enhancement`](https://github.com/dev-akw/csv_to_db/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement) - Améliorations

#### 🚀 Types de contributions acceptées

1. **🐛 Bug Fixes**
   - Correction de bugs existants
   - Amélioration des messages d'erreur
   - Gestion des cas limites

2. **✨ Nouvelles fonctionnalités**
   - Support de nouveaux formats de fichiers
   - Amélioration de l'interface utilisateur
   - Nouveaux endpoints API

3. **📚 Documentation**
   - Amélioration du README
   - Ajout d'exemples d'utilisation
   - Documentation des fonctions

4. **🧪 Tests**
   - Tests unitaires
   - Tests d'intégration
   - Tests end-to-end

5. **🎨 Améliorations UX/UI**
   - Interface web pour l'API
   - Amélioration des messages de réponse
   - Validation côté client

#### 📋 Processus de contribution

1. **Fork** le projet
2. **Créez** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Pushez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

#### 🔧 Développement local

```bash
# 1. Fork et clone le projet
git clone https://github.com/VOTRE_USERNAME/csv_to_db.git
cd csv_to_db

# 2. Installer les dépendances
npm install

# 3. Lancer les tests
npm test

# 4. Démarrer en mode développement
npm run dev

# 5. Vérifier le linting
npm run lint
```

#### ✅ Standards de qualité

- **Tests** : Tous les nouveaux features doivent avoir des tests
- **Linting** : Le code doit passer ESLint
- **Documentation** : Mettre à jour le README si nécessaire
- **Commits** : Messages de commit clairs et concis

#### 🎉 Récompenses

- **Hacktoberfest** : 4 PRs acceptées = T-shirt + goodies
- **Contribution** : Votre nom dans les contributors
- **Apprentissage** : Experience réelle de développement open source

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage des tests
npm run test:coverage
```

## 📋 Todo / Améliorations

- [ ] Interface web pour l'API
- [ ] Support des fichiers Excel (.xlsx)
- [ ] Validation plus poussée des CSV
- [ ] Export vers d'autres formats (JSON, XML)
- [ ] Tests end-to-end automatisés
- [ ] Documentation API avec Swagger/OpenAPI
- [ ] Support multilingue
- [ ] Configuration via variables d'environnement

## 📄 License

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 👥 Authors

- **devOnlyPurple** - *Initial work*

## 🙏 Acknowledgments

- Hacktoberfest pour encourager les contributions open source
- La communauté Node.js pour les excellents packages
- Tous les contributeurs qui améliorent ce projet

---

⭐ **Si ce projet vous plaît, n'oubliez pas de lui donner une étoile !**

[🌟 Star this repo](https://github.com/dev-akw/csv_to_db)

## 📁 Gestion automatique des dossiers

Cette application crée automatiquement les dossiers nécessaires au démarrage :

### Dossiers générés automatiquement :
- `uploads/` - Fichiers CSV uploadés temporairement
- `data/` - Données JSON des tables créées
- `data/sql/` - Fichiers SQL générés
- `logs/` - Fichiers de logs quotidiens

### Scripts utilitaires :

#### Script de gestion des dossiers :
```bash
# Voir l'aide
./manage-folders.sh help

# Créer les dossiers si manquants
./manage-folders.sh setup

# Nettoyer le contenu (garder la structure)
./manage-folders.sh clean

# Réinitialiser complètement
./manage-folders.sh reset

# Voir l'état actuel
./manage-folders.sh status

# Voir la taille occupée
./manage-folders.sh size
```

#### Commandes manuelles :
```bash
# Nettoyer les fichiers temporaires
rm -rf uploads/* data/*.json data/sql/*.sql

# Vérifier l'espace utilisé
du -sh uploads/ data/ logs/

# Consulter les logs en temps réel
tail -f logs/csv_to_db_$(date +%Y-%m-%d).log
```

### Configuration Git :
Ces dossiers sont automatiquement ignorés par Git (voir `.gitignore`) car ils contiennent :
- ❌ Des données utilisateur spécifiques
- ❌ Des fichiers temporaires
- ❌ Des logs de développement
- ✅ Chaque utilisateur aura ses propres dossiers

### Avantages :
- 🔄 **Auto-création** : Les dossiers se créent au premier démarrage
- 🛡️ **Sécurité** : Pas de données sensibles sur Git
- 🧹 **Maintenance facile** : Scripts de nettoyage intégrés
- 📊 **Monitoring** : Logs organisés par date

## 🚀 Démarrage rapide

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### Installation
```bash
npm install
```

### Démarrage
```bash
npm run dev
```

L'API sera disponible sur `http://localhost:3000`

## 📚 API Endpoints

```
csv_to_db/
├─ data/
│  ├─ db.json             # Données JSON générées depuis CSV
│  └─ sql/
│     └─ db.sql           # Fichiers SQL générés
├─ package-lock.json
├─ package.json
├─ README.md
├─ src/
│  ├─ app.js              # Point d’entrée de l’application
│  ├─ routes/
│  │  └─ table_routes.js  # Routes pour gérer CSV et SQL
│  └─ utils/
│     └─ csv_utils.js     # Fonctions utilitaires pour parser CSV et générer SQL
└─ uploads/               # Dossier pour stocker les CSV uploadés

```

## 🔥 Features

- [x] CSV file upload
- [x] Automatic data type detection
- [x] SQL script generation
- [x] Column mapping configuration
- [x] Basic data validation
- [ ] Multiple database support
- [ ] Custom data transformations
- [ ] Batch processing

## 🤝 Contributing

We love contributions! Here's how you can help:

### Getting Started with Contributions

1. Fork the Project
2. Create your Feature Branch

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your Changes

```bash
git commit -m 'Add some AmazingFeature'
```

4. Push to the Branch

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

### Contribution Guidelines

#### Code Style

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features

#### Pull Request Process

1. Update the README.md with details of changes
2. Update the CHANGELOG.md following semantic versioning
3. Link any related issues
4. Request review from maintainers

### Good First Issues

Look for these labels in our issues:

- `good first issue`
- `help wanted`
- `hacktoberfest`
- `documentation`

## 📝 API Documentation

### Endpoints

#### Endpoint list

```
GET /api/v1/
Content-Type: application/json

{
    "success": true,
    "message": "Welcome to CSV to DB API",
    "data": [
        {
            "method": "POST",
            "path": "/api/v1/tables/upload",
            "description": "Upload a CSV file"
        },
        {
            "method": "GET",
            "path": "/api/v1/tables/:tableName",
            "description": "Get table data"
        }
    ]
}
```

#### Upload CSV

```
POST /api/v1/upload
Content-Type: multipart/form-data
{
    "success": true,
    "tableName": "projet4",
    "rows": 23
}
```

#### Export SQL

```
POST /api/v1/:tableName/export
Content-Type: application/json

{
    "success": true,
    "downloadUrl": "http://localhost:3000/api/v1/tables/download/projet4.sql"
}
```

```
## 🎯 Hacktoberfest 2025

This project is participating in Hacktoberfest 2025! We welcome contributions from developers of all skill levels.

### How to Participate

1. Register at [Hacktoberfest](https://hacktoberfest.com)
2. Pick an issue labeled `hacktoberfest`
3. Follow our contribution guidelines
4. Submit your PR
5. Get it merged!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📫 Contact

Project Link: https://github.com/devOnlyPurple/csv_to_db

## 🙏 Acknowledgments

- [Choose an Open Source License](https://choosealicense.com)
- [Img Shields](https://shields.io)
```
