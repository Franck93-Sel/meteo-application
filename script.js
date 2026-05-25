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
