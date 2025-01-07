# Open Trail

Outil d'assitance en ligne à l'organisation de randonnées pédestres ou cyclistes longues distances.

## A ouvrir

1. RoadMap ?
2. Site web via Github Pages (ie. OpenSource)
3. Tracé GPX (ie. OpenTrack)
4. Matériel de randonnée dans le sac à dos
5. Calendrier prévisionnel (ie. OpenCalendar)
6. POI (attractions touristiques, point d'eau, ravitaillement / réapprovisionnement, bivouac, sommets à proximités, zones protégées, itinéraires alternatifs  ...) (ie. OpenMap)
7. MYOG Sac à dos (ie. OpenBackpack)
8. Liste des hébergements, bivouac, abris, refuges (ie. OpenCouch ?)
9. RSS
10. Bookmarks
11. Podcasts ?
12. Images / Photos
13. Menu / Courses


## Contact

- email
- Mastodon
- Github issues



## Equipement

(cf Drive)
- Pocket Rocket 2 RIM (2017)
- Duvet North Face (2017)
- Sac à dos MYOG
- Chaussures US
- Bâtons de randos Back Diamond (2017)
- Tente Camp


## Sac à dos

Vocabulaire
- MYOG : Make Your Own Gear

https://www.reddit.com/r/myog

Sites de références

Fournitures / Matériaux

Quelle machine à coudre ?



## Services

Planificateur de périple // Retro planning
Que mettre dans son sac à dos (avec plusieurs niveaux de poids / confort, nombre de jours de marche, saison)
wordpress2book
Catalogue de randonnées avec recherche par durée, région, niveau de difficulté, dénivelé ...


## ToDo

- website
- Comment coudre son sac à dos ?
- Acheter un pot
- Liste des villes traversées + date prévisionnelle + gare la plus proche
- Explicatif du sac à dos
- Pourquoi l'OpenTrail ?


## Trails

### Hexatrek

Distance: 3 034 km

Dénivelé+: 138 000 m

Durée: 3 à 5 mois

Période: été 2025

https://fr.wikipedia.org/wiki/Hexatrek
https://www.hexatrek.com/

GPX en accès libre sur le site hexatrek https://www.hexatrek.com/


#### Départ

Dans le sens Nord-Sud, nous conseillons de partir après le 15 Mai et avant le 1 Juillet. Les accumulations de neige dans les alpes sont encore très présentes jusqu'à début juillet.Un départ avant le 1 juin vous expose à des difficultés d'enneigement dès votre arrivée dans les alpes.

#### Durée

À rythme de 25km par jour avec un jour de repos par semaine, le trek prendra en moyenne 120 jours (4 mois) à réaliser en totalité. Les retours d'expériences de ces précédentes années indiquent une durée comprise entre 90 et 150 jours (3 à 5 mois).

#### Lieux de passage

Départ de Strasbourg

Savernes

Passage par Vallon-Pont-D'arc


### Le Poët-Sigillat

Valence TGV -> Le Poët-Sigillat

Distance: 201 km
Dénivelé+: 9 512 m
Durée: 10 jours
Période: été 2024

https://umap.openstreetmap.fr/en/map/le-poet-sigillat_1004840

- km 5 Alixan Supermarché Spar https://www.openstreetmap.org/node/2429403830
- km 10 Distributeur de lait
- km 85 Châtillons en Diois jour 4 Carrefour Express https://www.google.fr/maps/place/Carrefour+Express/@44.7106346,5.4792016,13z/data=!4m10!1m2!2m1!1ssupermarket!3m6!1s0x12cac544ddcabc3f:0xb7612d47c388ab61!8m2!3d44.6944759!4d5.48793!15sCgtzdXBlcm1hcmtldFoNIgtzdXBlcm1hcmtldJIBC3N1cGVybWFya2V04AEA!16s%2Fg%2F11sw__vl6m?hl=en&entry=ttu
- km 180 Villeperdrix Hébergement


### Pacific Crest Trail

Distance: 4 240 km ou 2 653 mi
Dénivelé+: 128 284 m ou 420 880 ft
Durée: 4 à 6 mois
Période: Avril à septembre 2017

https://fr.wikipedia.org/wiki/Pacific_Crest_Trail
https://www.pcta.org/


#### Feedbacks

Voici ce qu'il y avait dans mon sac à dos en 2017
- Sac à dos Décathlon 60 L.
- Batterie externe (achetée en cours de chemin, indispensable)
- Camelbag de 3L. de la marque Platypus
- Filtre Sawyer format familial (acheté en cours de chemin pour remplacer un mauvais choix)
- Bâtons de marche Black Diamond (acheté en cours de chemin)
- Pantalon de rando Décathlon premier prix (quelques coutures reprises en cours de chemin)
- Kit de couture minimaliste
- Bear canister (acheté en cours de chemin)
- 2 buffs
- Liseuse (avec beaucoup de livres dessus)
- Adaptateur USB USA (acheté sur place)
- Câble USB (micro-USB et USB-C)
- Lunettes de soleil
- Crème solaire
- Crème anti-moustique
- Paire de chaussure Salomon (au total 3 paires de chaussures auront été nécessaire au cours du chemin)
- Food bag
- Tongs
- ...


- Entraînement physique : préparation à un marathon qui a eu lieu début avril 2017
- Blog : https://pereetfillesurlepct.wordpress.com/
- https://lameriquedusudvuepar2blondes.wordpress.com


## Website

https://create-react-app.dev/docs/getting-started/
`npx create-react-app open-trail`

https://www.npmjs.com/package/maplibre-gl
`npm i maplibre-gl`

Exemple
* Display Mapbox
https://codesandbox.io/p/sandbox/react-qm5t04?file=%2Fsrc%2Findex.js%3A13%2C1
* Display Line on Mapbox
https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
https://maplibre.org/maplibre-gl-js/docs/examples/geojson-line/
https://visgl.github.io/react-map-gl/examples/geojson
* Display GPX file
https://codesandbox.io/p/sandbox/react-display-a-single-gpx-track-on-a-leaflet-map-kw7f2
https://www.manuelkruisz.com/blog/posts/gpx-maps-react
* Display linechart in d3
https://betterprogramming.pub/react-d3-plotting-a-line-chart-with-tooltips-ed41a4c31f4f
* OverPass
https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_API_by_Example#Pub_tour_in_Dublin
* Distance between points
https://en.wikipedia.org/wiki/Haversine_formula
* Amenities
https://wiki.openstreetmap.org/wiki/Key:amenity#Sustenance
