# 🚀 Guide de Test Rapide - CSV to Database API

## 🎯 Tests rapides avec curl

### 1. Vérifier que l'API fonctionne
```bash
curl http://localhost:3000/api/v1/
```

### 2. Créer un fichier CSV de test
```bash
cat > test_products.csv << 'EOF'
product,price,category
Ordinateur Portable,999,Electronique
Smartphone,599,Electronique
Tablette,349,Electronique
EOF
```

### 3. Uploader le CSV
```bash
curl -X POST http://localhost:3000/api/v1/tables/upload \
  -F "file=@test_products.csv" \
  -F "tableName=products"
```

### 4. Récupérer les données
```bash
curl http://localhost:3000/api/v1/tables/products
```

### 5. Exporter en SQL
```bash
curl http://localhost:3000/api/v1/tables/products/export
```

### 6. Télécharger le fichier SQL généré
```bash
curl -O -J http://localhost:3000/api/v1/tables/download/products.sql
```

## 🎨 Test avec interface web

Créez un fichier `test.html` :

```html
<!DOCTYPE html>
<html>
<head><title>Test CSV Upload</title></head>
<body>
    <h2>Test de l'API CSV to DB</h2>
    <form action="http://localhost:3000/api/v1/tables/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" accept=".csv" required>
        <input type="text" name="tableName" value="test">
        <button type="submit">Upload</button>
    </form>
</body>
</html>
```

Ouvrez `test.html` dans votre navigateur.

## 📋 Exemples de fichiers CSV

### Produits
```csv
product,price,category
Ordinateur Portable,999,Electronique
Smartphone,599,Electronique
```

### Utilisateurs
```csv
name,email,age,city
Jean,jean@test.com,25,Paris
Marie,marie@test.com,30,Lyon
```

## 🚨 Dépannage

### Problème de connexion ?
```bash
# Vérifier le statut du serveur
curl http://localhost:3000/api/v1/

# Voir les logs
tail -f logs/csv_to_db_$(date +%Y-%m-%d).log
```

### Erreur d'upload ?
```bash
# Vérifier la taille du fichier
ls -lh votre_fichier.csv

# Vérifier le format
head -1 votre_fichier.csv
```

## 🎉 Démarrage rapide

1. `npm install`
2. `npm run dev`
3. Testez avec les commandes ci-dessus !

---
*Ce guide vous permet de tester rapidement l'API sans lire toute la documentation.*
