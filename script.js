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
    min: Math.round(Math.min(...temps)),
    max: Math.round(Math.max(...temps)),
  };
}

/**
 * Retourne un tableau de 5 créneaux représentatifs (un par jour).
 * Préfère le créneau de 12h00, sinon prend le premier dispo pour ce jour.
 */
function getDailySlots(list) {
  const seen = [];
  const result = [];

  for (let i = 0; i < list.length; i++) {
    const slot = list[i];
    const date = slot.dt_txt.slice(0, 10);

    if (seen.indexOf(date) !== -1) continue;
    seen.push(date);

    const noonSlot = list.find(function (s) {
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
  const slot = list[0];
  const temp = Math.round(slot.main.temp);
  const description = slot.weather[0].description;
  const iconCode = slot.weather[0].icon;
  const humidity = slot.main.humidity;
  const wind = formatWind(slot.wind.speed);
  const precip = getPrecip(slot);

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
      const hour = slot.dt_txt.slice(11, 13) + "h";
      const temp = Math.round(slot.main.temp);
      const iconCode = slot.weather[0].icon;
      const humidity = slot.main.humidity;
      const wind = formatWind(slot.wind.speed);

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

  // Sélection au clic — une seule carte active à la fois
  hourlyCarousel.querySelectorAll(".hourly-card").forEach(function (card) {
    card.addEventListener("click", function () {
      hourlyCarousel.querySelectorAll(".hourly-card").forEach(function (c) {
        c.classList.remove("active");
      });
      card.classList.add("active");
    });
  });

  // Défilement horizontal à la molette (desktop)
  hourlyCarousel.addEventListener("wheel", function (e) {
    if (e.deltaY !== 0) {
      e.preventDefault();
      hourlyCarousel.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

/** Remplit le bloc 5 jours */
function renderDailyForecast(list) {
  const dailySlots = getDailySlots(list);

  dailyList.innerHTML = dailySlots
    .map(function (slot) {
      const date = slot.dt_txt.slice(0, 10);
      const dayName = getDayName(slot.dt_txt);
      const iconCode = slot.weather[0].icon;
      const humidity = slot.main.humidity;
      const wind = formatWind(slot.wind.speed);
      const minMax = getDailyMinMax(list, date);

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

  const city = cityInput.value.trim();

  if (city === "") {
    resultat.textContent = "Veuillez saisir une ville.";
    weatherResult.classList.add("show");
    return;
  }

  const url =
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

      const cityName = data.city.name;
      const list = data.list;

      if (!list || list.length === 0) {
        resultat.textContent = "Aucune prévision disponible pour cette ville.";
        weatherResult.classList.add("show");
        return;
      }

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
