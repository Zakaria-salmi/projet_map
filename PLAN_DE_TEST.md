# Plan de test

## Analyse des Risques

### Risques Projet


| #   | Risque                                                                   | Probabilité     | Impact        | Niveau  |
| --- | ------------------------------------------------------------------------ | --------------- | ------------- | ------- |
| 01  | Indisponibilité de l'environnement Docker/PostGIS                        | Probable        | Impactant     | **III** |
| 02  | Manque de données de test représentatives (CSV incomplet ou mal formaté) | Invraisemblable | Impactant     | **II**  |
| 03  | Incompatibilité de dépendances NPM (frontend/backend)                    | Peu probable    | Peu impactant | **II**  |
| 04  | Périmètre du projet mal défini                                           | Probable        | Peu impactant | **II**  |


---

### Risques Produit


| #   | Risque                                                        | Probabilité  | Impact         | Niveau  |
| --- | ------------------------------------------------------------- | ------------ | -------------- | ------- |
| 01  | Filtrage retournant des résultats incorrects (accents, casse) | Probable     | Impactant      | **III** |
| 02  | Faille d'injection SQL                                        | Peu probable | Catastrophique | **III** |
| 03  | CORS mal configuré                                            | Probable     | Impactant      | **III** |
| 04  | Requête SQL mal rédigée (avec PostGIS)                        | Peu probable | Impactant      | **III** |


---

## Périmètre des Tests

**Campagne du 20/03/2026** — Filtrage des villes


| Inclus                                        | Exclus                     |
| --------------------------------------------- | -------------------------- |
| Filtrage des villes (nom, région, population) | Affichage cartographique   |
| Validation des résultats retournés par l'API  | Authentification           |
| Comportement avec filtres combinés            | Import / export de données |
| Cas limites (filtre vide, aucun résultat)     | Performances sous charge   |


