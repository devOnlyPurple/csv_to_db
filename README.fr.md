# Convertisseur CSV vers Base de Données 🚀

> 🇺🇸 [English version available](./README.md)

[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2025-brightgreen)](https://hacktoberfest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)
[![Issues](https://img.shields.io/github/issues/dev-akw/csv_to_db)](https://github.com/devOnlyPurple/csv_to_db/issues)
[![Contributors](https://img.shields.io/github/contributors/dev-akw/csv_to_db)](https://github.com/devOnlyPurple/csv_to_db/graphs/contributors)

## 📖 À propos du projet

Ce projet est une application Node.js qui convertit les fichiers CSV en tables de base de données. Il offre un moyen simple de :

- Importer des fichiers CSV
- Stocker les données CSV en JSON sur le serveur (data/db.json)
- Générer des scripts SQL à partir des données JSON (data/sql/db.sql)
- Fournir un lien de téléchargement direct pour le fichier SQL généré
- Gérer la détection automatique des types de données et le nettoyage des colonnes

Parfait pour les développeurs qui ont besoin de migrer des données depuis des feuilles de calcul vers des bases de données !

## 🛠️ Technologies utilisées

- Node.js
- Express.js
- Multer (upload de fichiers)
- CSV-Parse (analyse CSV)
- fs-extra (système de fichiers avancé)

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

## 🧪 Guide de test rapide

### 🎯 Test rapide avec curl

#### 1. Vérifier que l'API fonctionne

```bash
curl http://localhost:3000/api/v1/
```

#### 2. Créer un fichier CSV de test

```bash
cat > produits_test.csv << 'EOF'
produit,prix,categorie
Ordinateur Portable,999,Electronique
Smartphone,599,Electronique
Tablette,349,Electronique
EOF
```

#### 3. Importer le CSV

```bash
curl -X POST http://localhost:3000/api/v1/tables/upload \
  -F "file=@produits_test.csv" \
  -F "tableName=produits"
```

#### 4. Récupérer les données

```bash
curl http://localhost:3000/api/v1/tables/produits
```

#### 5. Exporter en SQL

```bash
curl http://localhost:3000/api/v1/tables/produits/export
```

#### 6. Télécharger le fichier SQL généré

```bash
curl -O -J http://localhost:3000/api/v1/tables/download/produits.sql
```

### 🎨 Test avec interface web simple

Créez un fichier `test.html` :

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test Upload CSV</title>
  </head>
  <body>
    <h2>Test de l'API CSV vers DB</h2>

    <h3>1. Upload CSV</h3>
    <form
      action="http://localhost:3000/api/v1/tables/upload"
      method="post"
      enctype="multipart/form-data"
    >
      <input type="file" name="file" accept=".csv" required />
      <input
        type="text"
        name="tableName"
        placeholder="Nom de la table"
        value="table_test"
      />
      <button type="submit">Uploader</button>
    </form>

    <h3>2. Voir les données</h3>
    <p>
      Table : <input type="text" id="tableName" value="table_test" />
      <button onclick="getData()">Récupérer données</button>
    </p>

    <h3>3. Résultats</h3>
    <div id="results"></div>

    <script>
      async function getData() {
        const tableName = document.getElementById("tableName").value;
        const response = await fetch(
          `http://localhost:3000/api/v1/tables/${tableName}`
        );
        const data = await response.json();

        document.getElementById("results").innerHTML =
          "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
      }
    </script>
  </body>
</html>
```

Puis ouvrez `test.html` dans votre navigateur.

## 📚 Endpoints de l'API

### URL de base

```
http://localhost:3000/api/v1
```

### Endpoints disponibles

#### Accueil

```http
GET /
```

**Description :** Documentation de l'API
**Réponse :**

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
- file: [fichier CSV]
- tableName: "ma_table" (optionnel)
```

**Réponse :**

```json
{
  "success": true,
  "tableName": "ma_table",
  "rows": 150
}
```

#### Récupérer les données d'une table

```http
GET /tables/:tableName
```

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "colonne1": "valeur1",
      "colonne2": "valeur2"
    }
  ]
}
```

#### Exporter une table en SQL

```http
GET /tables/:tableName/export
```

**Réponse :**

```json
{
  "success": true,
  "downloadUrl": "http://localhost:3000/api/v1/tables/download/ma_table.sql"
}
```

## 🤝 Contribuer

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)
[![Open Issues](https://img.shields.io/github/issues/dev-akw/csv_to_db)](https://github.com/devOnlyPurple/csv_to_db/issues)

### Comment contribuer ?

Ce projet participe à **Hacktoberfest 2025** ! Vous pouvez contribuer de plusieurs façons :

#### 🎯 Issues étiquetées pour débutants

- [`good first issue`](https://github.com/devOnlyPurple/csv_to_db/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) - Parfait pour commencer
- [`help wanted`](https://github.com/devOnlyPurple/csv_to_db/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) - Besoin d'aide
- [`enhancement`](https://github.com/devOnlyPurple/csv_to_db/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement) - Améliorations

#### 🚀 Types de contributions acceptées

1. **🐛 Corrections de bugs**

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

## 📁 Gestion automatique des dossiers

Cette application crée automatiquement les dossiers nécessaires au démarrage :

### Dossiers générés automatiquement :

- `uploads/` - Fichiers CSV importés temporairement
- `data/` - Données JSON des tables créées
- `data/sql/` - Fichiers SQL générés
- `logs/` - Fichiers de logs quotidiens

### Avantages :

- 🔄 **Auto-création** : Les dossiers se créent au premier démarrage
- 🛡️ **Sécurité** : Pas de données sensibles sur Git
- 🧹 **Maintenance facile** : Scripts de nettoyage intégrés
- 📊 **Monitoring** : Logs organisés par date

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage des tests
npm run test:coverage
```

## 📋 Améliorations prévues

- [ ] Interface web pour l'API
- [ ] Support des fichiers Excel (.xlsx)
- [ ] Validation plus poussée des CSV
- [ ] Export vers d'autres formats (JSON, XML)
- [ ] Tests end-to-end automatisés
- [ ] Documentation API avec Swagger/OpenAPI
- [ ] Support multilingue
- [ ] Configuration via variables d'environnement

## 📄 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 👥 Auteurs

- **devOnlyPurple** - _Travail initial_

## 🙏 Remerciements

- Hacktoberfest pour encourager les contributions open source
- La communauté Node.js pour les excellents packages
- Tous les contributeurs qui améliorent ce projet

---

⭐ **Si ce projet vous plaît, n'oubliez pas de lui donner une étoile !**

[🌟 Star this repo](https://github.com/devOnlyPurple/csv_to_db)
