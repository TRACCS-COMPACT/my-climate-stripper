# 🌡️ Climate Striper

Un site web interactif pour visualiser l'évolution de la température à travers les Climate Stripes.

## 🚀 Fonctionnalités

- **Sélection de lieu** : Choisissez un lieu de deux façons :
  - Recherche par nom de ville (ex: Grenoble, Paris, Lyon...)
  - Clic direct sur la carte interactive
- **Génération automatique** : Création de Climate Stripes basées sur les données de température
- **Interface moderne** : Design responsive et intuitif
- **Hébergement GitHub Pages** : Déploiement automatique

## 🛠️ Technologies utilisées

- HTML5, CSS3, JavaScript vanilla
- Leaflet.js pour les cartes interactives
- OpenStreetMap pour les données cartographiques
- Nominatim pour la géocodage
- **Open-Meteo API** pour les données climatiques réelles (ERA5-Land)
- CDS API (optionnel) pour les données Copernicus
- GitHub Pages pour l'hébergement

## 📱 Utilisation

1. Ouvrez le site web
2. Cliquez sur "Sélectionner un lieu"
3. Choisissez votre méthode :
   - Tapez le nom d'une ville dans la barre de recherche
   - Ou cliquez directement sur la carte
4. Confirmez votre sélection
5. Cliquez sur "Générer Climate Stripes" pour voir l'évolution de la température

## 🌐 Déploiement

### Configuration GitHub Pages

1. **Forkez ce repository** sur votre compte GitHub

2. **Activez GitHub Pages** :
   - Allez dans Settings > Pages
   - Sélectionnez "Deploy from a branch"
   - Choisissez "main" branch
   - Le site sera disponible à : `https://[votre-username].github.io/my-climate-stripper`

3. **Configurez l'API CDS (optionnel)** :
   - Créez un compte sur [Copernicus Climate Data Store](https://cds.climate.copernicus.eu/)
   - Générez une clé API
   - Dans votre repository, allez dans Settings > Secrets and variables > Actions
   - Ajoutez un nouveau secret nommé `CDS_API_KEY` avec votre clé API
   - Le workflow GitHub Actions générera automatiquement les vraies données climatiques

### Déploiement local

```bash
# Cloner le repository
git clone https://github.com/[votre-username]/my-climate-stripper.git
cd my-climate-stripper

# Installer les dépendances Python (optionnel)
pip install -r requirements.txt

# Générer les données climatiques (optionnel)
python scripts/generate_climate_data.py

# Ouvrir le site
open index.html
```

## 🔧 Configuration avancée

### Données climatiques réelles

Le site utilise automatiquement l'**API Open-Meteo** (ERA5-Land) qui :
- ✅ **Aucune clé API requise**
- ✅ **Données historiques 1940→présent**
- ✅ **Requêtes directes par coordonnées**
- ✅ **Limites de taux généreuses**

**Optionnel** : Pour utiliser l'API CDS Copernicus :
1. Créez un compte sur [Copernicus Climate Data Store](https://cds.climate.copernicus.eu/)
2. Acceptez les conditions d'utilisation
3. Générez une clé API dans votre profil
4. Ajoutez la clé comme secret GitHub Actions (`CDS_API_KEY`)

### Personnalisation

- **Villes par défaut** : Modifiez la liste dans `scripts/generate_climate_data.py`
- **Période de données** : Changez `start_year` et `end_year` dans le script Python
- **Style** : Personnalisez les couleurs dans `styles.css`

## 📄 Licence

Ce projet est sous licence MIT.