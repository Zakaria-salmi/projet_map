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


---

## Cahier de Recette (Tests d'Acceptation)

Validation manuelle à effectuer avec le backend et le frontend démarrés (`docker compose up`, `npm run dev`).

| ID    | Description du scénario | Résultat attendu | Statut |
| ----- | ------------------------ | ---------------- | ------ |
| TA-01 | L'utilisateur saisit « Paris » dans le champ de recherche par nom. | La liste affiche les villes dont le nom contient « Paris » (ex : Paris, Paris-Le Bourget), triées par population décroissante. Aucune ville hors de France n'apparaît. | Pass |
| TA-02 | L'utilisateur clique sur la carte en région parisienne, règle la distance maximale à 50 km et la population minimale à 100 000 habitants. | Seules les villes situées à moins de 50 km du point cliqué et comptant plus de 100 000 habitants sont affichées. La distance de chaque ville est indiquée en km dans la liste. | Pass |
| TA-03 | L'utilisateur clique sur la carte, puis sélectionne la région « Bretagne » dans le filtre. | La liste se met à jour automatiquement et n'affiche que des villes appartenant à la région Bretagne dans le rayon défini. Les villes d'autres régions disparaissent de la liste. | Pass |
| TA-04 | L'utilisateur saisit un nom de ville inexistant dans le champ de recherche. | Le message « Aucune ville trouvée » s'affiche dans la section Résultats. Aucune ville n'apparaît dans la liste. | Pass |
| TA-05 | L'utilisateur clique sur une ville dans la liste des résultats. | La carte effectue un zoom animé vers la position de la ville sélectionnée et son infobulle (nom, population, distance) s'ouvre automatiquement. | Pass |
