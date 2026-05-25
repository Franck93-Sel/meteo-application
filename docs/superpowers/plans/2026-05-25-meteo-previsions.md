# Météo — Prévisions horaires + 5 jours

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un carrousel de prévisions horaires (toutes les 3h) et un bloc 5 jours sous la météo actuelle, avec humidité / vent / précipitations dans les 3 sections.

**Architecture:** Un seul appel à `/forecast` remplace l'appel à `/weather`. La réponse contient une liste de créneaux toutes les 3h sur 5 jours — on filtre pour la journée en cours (carrousel) et on extrait un créneau par jour (bloc 5 jours). Les 3 sections sont empilées en flex-column dans `.app`.

**Tech Stack:** HTML/CSS/JS vanilla, API OpenWeatherMap `/forecast` (plan gratuit)

---

## Fichiers modifiés

| Fichier | Rôle |
|---|---|
| `index.html` | Ajouter les conteneurs HTML pour les 3 nouvelles sections |
| `style.css` | Corriger le bug mobile + styles carrousel + styles 5 jours |
| `script.js` | Remplacer `/weather` par `/forecast`, ajouter les fonctions de rendu |

---

## Task 1 : Mettre à jour `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Étape 1 — Remplacer le contenu de `index.html` par la version suivante**

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meteo</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="app">
      <h1>Météo</h1>
      <form>
        <input type="text" id="city" placeholder="Entrez le nom de la ville" />
        <input type="submit" value="Résultat Météo" />
      </form>

      <div class="weather-result" id="weatherResult">

        <!-- Section 1 : météo actuelle -->
        <div class="current-weather">
          <img id="icon" alt="Icône météo" />
          <p id="resultat"></p>
          <div class="current-details" id="currentDetails"></div>
        </div>

        <!-- Section 2 : carrousel horaire -->
        <div class="hourly-section" id="hourlySection">
          <p class="section-title">Aujourd'hui</p>
          <div class="hourly-carousel" id="hourlyCarousel"></div>
        </div>

        <!-- Section 3 : prévisions 5 jours -->
        <div class="daily-section" id="dailySection">
          <p class="section-title">5 prochains jours</p>
          <div class="daily-list" id="dailyList"></div>
        </div>

      </div>
    </div>
    <script src="script.js"></script>
  </body>
</html>
```

- [ ] **Étape 2 — Vérifier dans le navigateur**

Ouvrir `index.html` dans le navigateur. La page doit afficher le titre "Météo" et le formulaire. Les sections horaire et 5 jours ne sont pas encore visibles (elles sont dans `.weather-result` qui a `opacity: 0` par défaut).

- [ ] **Étape 3 — Commit**

```bash
git add index.html
git commit -m "feat: add HTML containers for hourly carousel and 5-day forecast"
```

---

## Task 2 : Mettre à jour `style.css`

**Files:**
- Modify: `style.css`

- [ ] **Étape 1 — Remplacer le contenu de `style.css` par la version suivante**

```css
body {
  margin: 0;
  min-height: 100vh; /* FIX: était height: 100vh — le fond s'étire maintenant */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: url(./img/clouds-4750959_1280.jpg) center/cover fixed;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.app {
  border: solid 3px rgb(224, 154, 23);
  border-radius: 10px;
  width: 500px;
  height: auto; /* FIX: était 400px fixe */
  min-height: 400px;
  margin: 50px auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 24px;
  align-items: center;
  background: linear-gradient(
    145deg,
    rgba(0, 0, 89, 1) 0%,
    rgba(9, 9, 121, 1) 14%,
    rgba(0, 212, 255, 1) 100%
  );
  box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
  -webkit-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
}

h1 {
  color: rgb(224, 154, 23);
  text-align: center;
  font-size: 3rem;
  margin: 0 0 16px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
  text-align: center;
}

/* ==========================================
   Bloc résultat global (animation d'entrée)
   ========================================== */

.weather-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  width: 100%;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.weather-result.show {
  opacity: 1;
  transform: translateY(0);
}

/* ==========================================
   Section 1 : Météo actuelle
   ========================================== */

.current-weather {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

#icon {
  display: none;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

#resultat {
  font-size: 1.1rem;
  color: white;
  margin: 0;
}

.current-details {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4px;
}

/* ==========================================
   Sections communes (horaire + 5 jours)
   ========================================== */

.hourly-section,
.daily-section {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 12px;
  box-sizing: border-box;
}

.section-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 10px;
  text-align: left;
}

/* ==========================================
   Section 2 : Carrousel horaire
   ========================================== */

.hourly-carousel {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 6px;
}

.hourly-carousel::-webkit-scrollbar {
  height: 4px;
}

.hourly-carousel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.hourly-carousel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.hourly-card {
  flex: 0 0 auto;
  scroll-snap-align: start;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
  color: white;
  min-width: 64px;
}

.hourly-hour {
  font-size: 0.75rem;
  font-weight: bold;
  margin-bottom: 2px;
}

.hourly-icon {
  width: 36px;
  height: 36px;
}

.hourly-temp {
  font-size: 1rem;
  font-weight: bold;
  margin: 2px 0;
}

.hourly-detail {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* ==========================================
   Section 3 : Prévisions 5 jours
   ========================================== */

.daily-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.daily-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 6px;
  padding: 6px 10px;
  color: white;
  font-size: 0.85rem;
}

.daily-day {
  width: 36px;
  font-weight: bold;
  text-transform: capitalize;
  flex-shrink: 0;
}

.daily-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.daily-detail {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  flex: 1;
}

.daily-temps {
  flex-shrink: 0;
  font-size: 0.85rem;
}

.temp-min {
  color: rgba(255, 255, 255, 0.6);
}

.temp-max {
  font-weight: bold;
}
```

- [ ] **Étape 2 — Vérifier dans le navigateur (mobile simulation)**

Dans les DevTools (F12), activer la vue mobile (icône téléphone). Redimensionner pour que la carte dépasse la hauteur de l'écran. Le fond d'écran doit couvrir tout le scroll — plus de fond blanc qui réapparaît en bas.

- [ ] **Étape 3 — Commit**

```bash
git add style.css
git commit -m "fix: mobile background cut-off, add styles for hourly carousel and 5-day forecast"
```

---

## Task 3 : Réécrire `script.js`

**Files:**
- Modify: `script.js`

- [ ] **Étape 1 — Remplacer le contenu de `script.js` par la version suivante**

```javascript
const form = document.querySelector("form");
const cityInput = document.getElementById("city");
const resultat = document.getElementById("resultat");
const icon = document.getElementById("icon");
const weatherResult = document.getElementById("weatherResult");
const currentDetails = document.getElementById("currentDetails");
const hourlyCarousel = document.getElementById("hourlyCarousel");
const dailyList = document.getElementById("dailyList");

const apiKey = "c402c01ef76ecafbe5ac3a3afe35deaf";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convertit m/s en km/h arrondi */
function formatWind(speedMs) {
  return Math.round(speedMs * 3.6);
}

/** Retourne les mm de pluie sur 3h, ou "0" si absent */
function getPrecip(slot) {
  return slot.rain && slot.rain["3h"] ? slot.rain["3h"].toFixed(1) : "0";
}

/** Retourne tous les créneaux dont la date correspond au premier créneau (= aujourd'hui) */
function getTodaySlots(list) {
  const today = list[0].dt_txt.slice(0, 10);
  return list.filter(function (slot) {
    return slot.dt_txt.startsWith(today);
  });
}

/** Retourne le nom court du jour en français à partir d'un dt_txt ("2026-05-26 12:00:00") */
function getDayName(dtTxt) {
  const date = new Date(dtTxt.replace(" ", "T"));
  return date.toLocaleDateString("fr-FR", { weekday: "short" });
}

/** Retourne { min, max } en °C arrondis sur tous les créneaux d'un jour donné */
function getDailyMinMax(list, dateStr) {
  const slots = list.filter(function (slot) {
    return slot.dt_txt.startsWith(dateStr);
  });
  const temps = slots.map(function (s) { return s.main.temp; });
  return {
    min: Math.round(Math.min.apply(null, temps)),
    max: Math.round(Math.max.apply(null, temps)),
  };
}

/**
 * Retourne un tableau de 5 créneaux représentatifs (un par jour).
 * Préfère le créneau de 12h00, sinon prend le premier dispo pour ce jour.
 */
function getDailySlots(list) {
  var seen = [];
  var result = [];

  for (var i = 0; i < list.length; i++) {
    var slot = list[i];
    var date = slot.dt_txt.slice(0, 10);

    if (seen.indexOf(date) !== -1) continue;
    seen.push(date);

    var noonSlot = list.find(function (s) {
      return s.dt_txt === date + " 12:00:00";
    });
    result.push(noonSlot || slot);

    if (result.length === 5) break;
  }
  return result;
}

// ── Fonctions de rendu ─────────────────────────────────────────────────────

/** Affiche la météo actuelle (premier créneau de la liste) */
function renderCurrentWeather(list, cityName) {
  var slot = list[0];
  var temp = Math.round(slot.main.temp);
  var description = slot.weather[0].description;
  var iconCode = slot.weather[0].icon;
  var humidity = slot.main.humidity;
  var wind = formatWind(slot.wind.speed);
  var precip = getPrecip(slot);

  resultat.textContent =
    "À " + cityName + ", il fait " + temp + "°C avec " + description + ".";

  icon.src = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
  icon.style.display = "block";
  icon.alt = description;

  currentDetails.innerHTML =
    "<span>💧 " + humidity + "%</span>" +
    "<span>💨 " + wind + " km/h</span>" +
    "<span>🌧️ " + precip + " mm</span>";
}

/** Remplit le carrousel avec les créneaux du jour */
function renderHourlyCarousel(slots) {
  hourlyCarousel.innerHTML = slots
    .map(function (slot) {
      var hour = slot.dt_txt.slice(11, 13) + "h";
      var temp = Math.round(slot.main.temp);
      var iconCode = slot.weather[0].icon;
      var humidity = slot.main.humidity;
      var wind = formatWind(slot.wind.speed);

      return (
        '<div class="hourly-card">' +
          '<div class="hourly-hour">' + hour + "</div>" +
          '<img class="hourly-icon" src="https://openweathermap.org/img/wn/' +
            iconCode + '.png" alt="' + slot.weather[0].description + '" />' +
          '<div class="hourly-temp">' + temp + "°</div>" +
          '<div class="hourly-detail">💧 ' + humidity + "%</div>" +
          '<div class="hourly-detail">💨 ' + wind + " km/h</div>" +
        "</div>"
      );
    })
    .join("");
}

/** Remplit le bloc 5 jours */
function renderDailyForecast(list) {
  var dailySlots = getDailySlots(list);

  dailyList.innerHTML = dailySlots
    .map(function (slot) {
      var date = slot.dt_txt.slice(0, 10);
      var dayName = getDayName(slot.dt_txt);
      var iconCode = slot.weather[0].icon;
      var humidity = slot.main.humidity;
      var wind = formatWind(slot.wind.speed);
      var minMax = getDailyMinMax(list, date);

      return (
        '<div class="daily-row">' +
          '<span class="daily-day">' + dayName + "</span>" +
          '<img class="daily-icon" src="https://openweathermap.org/img/wn/' +
            iconCode + '.png" alt="' + slot.weather[0].description + '" />' +
          '<span class="daily-detail">💧 ' + humidity + "%</span>" +
          '<span class="daily-detail">💨 ' + wind + " km/h</span>" +
          '<span class="daily-temps">' +
            '<span class="temp-min">' + minMax.min + "°</span>" +
            " / " +
            '<span class="temp-max">' + minMax.max + "°</span>" +
          "</span>" +
        "</div>"
      );
    })
    .join("");
}

// ── Soumission du formulaire ───────────────────────────────────────────────

form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Réinitialiser l'affichage
  weatherResult.classList.remove("show");
  resultat.textContent = "";
  icon.style.display = "none";
  currentDetails.innerHTML = "";
  hourlyCarousel.innerHTML = "";
  dailyList.innerHTML = "";

  var city = cityInput.value.trim();

  if (city === "") {
    resultat.textContent = "Veuillez saisir une ville.";
    weatherResult.classList.add("show");
    return;
  }

  var url =
    "https://api.openweathermap.org/data/2.5/forecast" +
    "?q=" + city +
    "&units=metric" +
    "&lang=fr" +
    "&appid=" + apiKey;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Note : /forecast retourne cod en string "200", pas en entier
      if (data.cod !== "200") {
        resultat.textContent =
          "Ville introuvable. Veuillez vérifier le nom saisi.";
        weatherResult.classList.add("show");
        return;
      }

      var cityName = data.city.name;
      var list = data.list;

      renderCurrentWeather(list, cityName);
      renderHourlyCarousel(getTodaySlots(list));
      renderDailyForecast(list);

      weatherResult.classList.add("show");
    })
    .catch(function () {
      resultat.textContent = "Une erreur réseau s'est produite. Réessayez.";
      weatherResult.classList.add("show");
    });
});
```

- [ ] **Étape 2 — Tester dans le navigateur**

Ouvrir `index.html`. Saisir une ville (ex : "Paris") et soumettre.

Vérifier :
- ✅ La météo actuelle affiche ville, température, description, icône + 💧 💨 🌧️
- ✅ Le carrousel horaire apparaît avec les créneaux du jour (toutes les 3h)
- ✅ On peut faire défiler le carrousel horizontalement
- ✅ Chaque carte horaire affiche heure, icône, temp, humidité, vent
- ✅ Le bloc 5 jours affiche 5 lignes avec icône, humidité, vent, min/max
- ✅ Tester avec une ville invalide → message d'erreur affiché

- [ ] **Étape 3 — Tester le fix mobile**

Dans les DevTools (F12), passer en vue mobile (iPhone 12 Pro ou similaire). La carte étant plus haute que le viewport, faire défiler la page. Le fond d'écran (nuages) doit rester visible sur tout le scroll — plus de fond blanc.

- [ ] **Étape 4 — Commit final**

```bash
git add script.js
git commit -m "feat: replace /weather with /forecast, add hourly carousel and 5-day forecast with weather details"
```
