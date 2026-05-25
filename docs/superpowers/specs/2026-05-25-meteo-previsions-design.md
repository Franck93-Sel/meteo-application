# Design — Prévisions météo (horaire + 5 jours)

**Date :** 2026-05-25
**Statut :** Approuvé

---

## Objectif

Enrichir l'application météo existante avec :
1. Un carrousel de prévisions horaires (toutes les 3h) pour la journée en cours
2. Un bloc de prévisions sur 5 jours avec min/max
3. Des détails (humidité, vent, précipitations) dans les 3 sections
4. Une correction du bug de fond d'écran tronqué sur mobile

---

## API

### Endpoint unique : `/forecast`

Remplace l'appel à `/weather`. Un seul appel suffit pour toutes les sections.

```
GET https://api.openweathermap.org/data/2.5/forecast
  ?q={ville}
  &units=metric
  &lang=fr
  &appid={clé}
```

**Réponse :** liste de créneaux (`list[]`) toutes les 3h sur 5 jours.
Chaque créneau contient :
- `dt_txt` — date et heure au format `"YYYY-MM-DD HH:MM:SS"`
- `main.temp` — température actuelle
- `main.temp_min` / `main.temp_max` — min/max du créneau
- `main.humidity` — humidité en %
- `wind.speed` — vitesse du vent en m/s (à convertir en km/h : × 3.6)
- `rain["3h"]` — précipitations sur 3h en mm (optionnel, absent si 0)
- `weather[0].icon` — code icône OpenWeatherMap
- `weather[0].description` — description en français

---

## Structure de l'interface

Disposition verticale (`flex-column`) dans `.app` :

```
┌──────────────────────────────┐
│         MÉTÉO ACTUELLE        │
│   Ville · Temp · Description  │
│   💧 Humidité  💨 Vent  🌧 Précip │
├──────────────────────────────┤
│    AUJOURD'HUI (carrousel)   │
│  ← [3h] [6h] [9h] ... →      │
│  Chaque carte : heure, icône,│
│  temp, humidité, vent         │
├──────────────────────────────┤
│       5 PROCHAINS JOURS       │
│  Ligne par jour : jour, icône,│
│  humidité, vent, min° / max°  │
└──────────────────────────────┘
```

---

## Données par section

### Section 1 — Météo actuelle
- Source : `list[0]` (premier créneau, le plus proche dans le temps)
- Affiche : ville (`city.name`), température, description, icône
- Détails : humidité (`main.humidity`), vent (converti en km/h), précipitations (`rain["3h"]` ou 0 si absent)

### Section 2 — Carrousel horaire
- Source : créneaux dont `dt_txt` commence par la date du jour (`YYYY-MM-DD`)
- Affiche par carte : heure (ex : "15h"), icône, température, humidité, vent
- Défilement horizontal avec `overflow-x: auto`, `scroll-snap-type: x mandatory`
- Pas de précipitations dans les cartes horaires (manque de place)

### Section 3 — 5 jours
- Source : un créneau représentatif par jour (préférence pour `12:00:00`, sinon premier dispo)
- Jours affichés : aujourd'hui + les 4 jours suivants (5 lignes au total)
- Affiche par ligne : nom du jour (ex : "Lun."), icône, humidité, vent, temp min / temp max
- Les min/max sont les valeurs extrêmes de **tous les créneaux du jour** (pas juste celui de midi)

---

## Corrections CSS

| Propriété | Avant | Après | Raison |
|---|---|---|---|
| `body height` | `100vh` | `min-height: 100vh` | Le fond s'étire avec le contenu sur mobile |
| `.app height` | `400px` (fixe) | `height: auto` | La carte s'adapte à son contenu |
| `.app` | — | `padding-bottom: 24px` | Espace en bas de la carte |

---

## Gestion des erreurs

- Ville introuvable : `data.cod !== "200"` (string pour `/forecast`, pas entier) → message d'erreur affiché
- Champ `rain` absent : traité comme 0 mm (le champ n'existe pas si pas de pluie)
- Vent converti : `(wind.speed * 3.6).toFixed(0)` km/h

---

## Fichiers modifiés

| Fichier | Changements |
|---|---|
| `script.js` | Remplacer l'appel `/weather` par `/forecast`, ajouter les fonctions de filtrage et d'affichage |
| `style.css` | Corriger `body`/`.app`, ajouter styles carrousel et section 5 jours |
| `index.html` | Ajouter les conteneurs HTML pour le carrousel et la section 5 jours |

---

## Ce qui ne change pas

- La clé API existante (`c402c01ef76ecafbe5ac3a3afe35deaf`)
- Le formulaire de recherche par ville
- L'animation d'apparition (`.weather-result.show`)
- Le design global (couleurs, bordures, fond)
