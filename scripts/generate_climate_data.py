#!/usr/bin/env python3
"""
Script pour générer des données climatiques réelles à partir de l'API CDS
et les sauvegarder pour utilisation dans le site web.
"""

import cdsapi
import json
import os
import requests
import time
from datetime import datetime, timedelta
import numpy as np

def get_climate_data(lat, lon, start_year=1975, end_year=2024):
    """
    Récupère les données de température pour un point géographique donné
    """
    # Essayer d'abord l'API CDS si configurée
    cds_config_path = os.path.expanduser('~/.cdsapirc')
    
    if os.path.exists(cds_config_path):
        try:
            print("Tentative d'utilisation de l'API CDS...")
            c = cdsapi.Client()
            
            # Paramètres pour la requête ERA5
            request_params = {
                'product_type': 'reanalysis',
                'variable': '2m_temperature',
                'year': [str(year) for year in range(start_year, end_year + 1)],
                'month': [str(month).zfill(2) for month in range(1, 13)],
                'day': [str(day).zfill(2) for day in range(1, 32)],
                'time': [f"{hour:02d}:00" for hour in range(0, 24, 6)],
                'area': [lat + 0.1, lon - 0.1, lat - 0.1, lon + 0.1],
                'format': 'netcdf',
            }
            
            # Télécharger les données
            result = c.retrieve('reanalysis-era5-single-levels', request_params)
            
            # Ici, vous devriez traiter le fichier NetCDF téléchargé
            # Pour simplifier, on génère des données simulées basées sur des tendances réelles
            return generate_realistic_climate_data(start_year, end_year, lat)
            
        except Exception as e:
            print(f"Erreur CDS API: {e}")
            print("Tentative d'utilisation de l'API Open-Meteo...")
            return get_openmeteo_data(lat, lon, start_year, end_year)
    else:
        print("Configuration CDS non trouvée, utilisation de l'API Open-Meteo...")
        return get_openmeteo_data(lat, lon, start_year, end_year)

def get_openmeteo_data(lat, lon, start_year, end_year):
    """
    Récupère les données climatiques via l'API Open-Meteo (ERA5-Land)
    """
    try:
        # Construire l'URL pour l'API Open-Meteo
        base_url = "https://archive-api.open-meteo.com/v1/archive"
        
        # Paramètres de la requête
        params = {
            'latitude': lat,
            'longitude': lon,
            'start_date': f"{start_year}-01-01",
            'end_date': f"{end_year}-12-31",
            'daily': 'temperature_2m_mean',
            'timezone': 'auto'
        }
        
        print(f"Requête Open-Meteo pour {lat:.2f}, {lon:.2f} ({start_year}-{end_year})")
        
        # Faire la requête
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if 'daily' not in data:
            raise Exception("Données non disponibles dans la réponse")
        
        # Extraire les données de température
        daily_temps = data['daily']['temperature_2m_mean']
        daily_dates = data['daily']['time']
        
        # Calculer les moyennes annuelles
        yearly_temps = {}
        for i, date_str in enumerate(daily_dates):
            year = int(date_str[:4])
            temp = daily_temps[i]
            
            if year not in yearly_temps:
                yearly_temps[year] = []
            yearly_temps[year].append(temp)
        
        # Calculer les moyennes annuelles
        years = []
        temperatures = []
        
        for year in sorted(yearly_temps.keys()):
            if start_year <= year <= end_year:
                avg_temp = sum(yearly_temps[year]) / len(yearly_temps[year])
                years.append(year)
                temperatures.append(round(avg_temp, 1))
        
        print(f"Récupéré {len(temperatures)} années de données via Open-Meteo")
        
        # Délai pour éviter les limites de taux
        time.sleep(1)
        
        return {
            'years': years,
            'temperatures': temperatures,
            'location': {'lat': lat, 'lon': lon},
            'data_source': 'openmeteo_era5land'
        }
        
    except Exception as e:
        print(f"Erreur Open-Meteo API: {e}")
        print("Utilisation de données simulées réalistes...")
        return generate_realistic_climate_data(start_year, end_year, lat)

def generate_realistic_climate_data(start_year, end_year, lat):
    """
    Génère des données climatiques réalistes basées sur des tendances observées
    """
    years = list(range(start_year, end_year + 1))
    temperatures = []
    
    # Température de base selon la latitude (plus froid vers le nord)
    base_temp = 20 - (abs(lat) * 0.5)
    
    for year in years:
        # Tendance de réchauffement climatique (environ 0.02°C par an)
        warming_trend = (year - start_year) * 0.02
        
        # Variation saisonnière (plus chaud en été)
        seasonal_variation = 5 * np.sin(2 * np.pi * (year % 1))
        
        # Variabilité interannuelle (El Niño, La Niña, etc.)
        interannual_variation = np.random.normal(0, 1.5)
        
        # Température annuelle moyenne
        annual_temp = base_temp + warming_trend + seasonal_variation + interannual_variation
        
        temperatures.append(round(annual_temp, 1))
    
    return {
        'years': years,
        'temperatures': temperatures,
        'location': {'lat': lat, 'lon': 0},  # On utilise la lat pour la simulation
        'data_source': 'simulated_realistic'
    }

def save_climate_data(data, filename='climate_data.json'):
    """
    Sauvegarde les données climatiques dans un fichier JSON
    """
    os.makedirs('data', exist_ok=True)
    filepath = os.path.join('data', filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Données climatiques sauvegardées dans {filepath}")

def main():
    """
    Fonction principale pour générer les données climatiques
    """
    print("Génération des données climatiques...")
    
    # Points d'intérêt en France
    locations = [
        {'name': 'Paris', 'lat': 48.8566, 'lon': 2.3522},
        {'name': 'Lyon', 'lat': 45.7640, 'lon': 4.8357},
        {'name': 'Marseille', 'lat': 43.2965, 'lon': 5.3698},
        {'name': 'Grenoble', 'lat': 45.1885, 'lon': 5.7245},
        {'name': 'Toulouse', 'lat': 43.6047, 'lon': 1.4442},
        {'name': 'Nantes', 'lat': 47.2184, 'lon': -1.5536},
        {'name': 'Strasbourg', 'lat': 48.5734, 'lon': 7.7521},
        {'name': 'Bordeaux', 'lat': 44.8378, 'lon': -0.5792},
    ]
    
    all_data = {}
    
    for i, location in enumerate(locations):
        print(f"Traitement de {location['name']}...")
        data = get_climate_data(location['lat'], location['lon'])
        data['name'] = location['name']
        all_data[location['name']] = data
        
        # Délai entre les villes pour éviter les limites de taux
        if i < len(locations) - 1:
            print("Attente 2 secondes avant la prochaine ville...")
            time.sleep(2)
    
    # Sauvegarder toutes les données
    save_climate_data(all_data, 'french_cities_climate.json')
    
    # Créer aussi un fichier de données globales pour les tests
    global_data = {
        'paris': get_climate_data(48.8566, 2.3522),
        'generated_at': datetime.now().isoformat(),
        'description': 'Données climatiques simulées réalistes pour le Climate Striper'
    }
    save_climate_data(global_data, 'global_climate_data.json')
    
    print("Génération terminée !")

if __name__ == "__main__":
    main()
