# Convertisseur CSV vers Base de Données 🚀

[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2025-brightgreen)](https://hacktoberfest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

## 📖 À Propos du Projet

Ce projet est une application Node.js qui convertit les fichiers CSV en tables de base de données. Il offre un moyen facile de :

- Télécharger un fichier CSV
- Stocker les données CSV au format JSON sur le serveur (data/db.json)
- Générer des scripts SQL à partir des données JSON (data/sql/db.sql)
- Fournir un lien de téléchargement direct pour le fichier SQL généré
- Gérer la détection de type de données de base et le nettoyage des colonnes

Parfait pour les développeurs qui ont besoin de migrer des données de feuilles de calcul vers des bases de données !

## 🛠️ Construit Avec

- Node.js
- Express.js
- Multer
- CSV-Parse
- fs-extra
<!-- - Jest (pour les tests) -->

## 🚀 Démarrage Rapide

### Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- Git

### Installation

1. Cloner le dépôt

```bash
git clone https://github.com/devOnlyPurple/csv_to_db.git
```

2. Installer les paquets NPM

```bash
cd csv-to-db
npm install
```

3. Démarrer le serveur de développement

```bash
npm run dev
```

## 📊 Structure du Projet

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

## 🔥 Fonctionnalités

- [x] Téléchargement de fichiers CSV
- [x] Détection automatique du type de données
- [x] Génération de scripts SQL
- [x] Configuration du mappage des colonnes
- [x] Validation de données de base
- [ ] Support de plusieurs bases de données
- [ ] Transformations de données personnalisées
- [ ] Traitement par lots

## 🤝 Contribuer

Nous aimons les contributions ! Voici comment vous pouvez aider : 

### Commencer à Contribuer

1. Forker le Projet
2. Créer votre branche de fonctionnalité

```bash
git checkout -b feature/AmazingFeature
```

3. Committer vos modifications

```bash
git commit -m 'Ajouter une fonctionnalité incroyable'
```

4. Pousser vers la branche

```bash
git push origin feature/AmazingFeature
```

5. Ouvrir une Pull Request

### Directives de Contribution

#### Style de Code

- Suivre la configuration ESLint
- Écrire des messages de commit significatifs
- Ajouter des tests pour les nouvelles fonctionnalités

#### Processus de Pull Request

1. Mettre à jour le README.md avec les détails des modifications
2. Mettre à jour le CHANGELOG.md en suivant le versionnement sémantique
3. Lier les problèmes connexes
4. Demander une révision aux mainteneurs

### Bonnes Premières Contributions

Recherchez ces étiquettes dans nos problèmes :

- `good first issue`
- `help wanted`
- `hacktoberfest`
- `documentation`

## 📝 Documentation API

### Points d'accès (Endpoints)

#### Liste des points d'accès

```
POST /api/v1/
Content-Type: application/json

{
    "success": true,
    "message": "Bienvenue à l'API CSV vers DB",
    "data": [
        {
            "method": "POST",
            "path": "/api/v1/tables/upload",
            "description": "Télécharger un fichier CSV"
        },
        {
            "method": "GET",
            "path": "/api/v1/tables/:tableName",
            "description": "Obtenir les données de la table"
        }
    ]
}
```

#### Télécharger un CSV

```
POST /api/v1/upload
Content-Type: multipart/form-data
{
    "success": true,
    "tableName": "projet4",
    "rows": 23
}
```

#### Exporter en SQL

```
POST /api/v1/:tableName/export
Content-Type: application/json

{
    "success": true,
    "downloadUrl": "http://localhost:3000/api/v1/tables/download/projet4.sql"
}
```

## 🎯 Hacktoberfest 2025

Ce projet participe à Hacktoberfest 2025 ! Nous accueillons les contributions de développeurs de tous niveaux.

### Comment Participer

1. S'inscrire sur [Hacktoberfest](https://hacktoberfest.com)
2. Choisir un problème étiqueté `hacktoberfest`
3. Suivre nos directives de contribution
4. Soumettre votre PR
5. La faire fusionner !

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## 📫 Contact

Lien du projet : https://github.com/devOnlyPurple/csv_to_db

## 🙏 Remerciements

- [Choisir une licence open source](https://choosealicense.com)
- [Img Shields](https://shields.io)
