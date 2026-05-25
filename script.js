// fetch(
//   "https://v2.jokeapi.dev/joke/Any?lang=fr&blacklistFlags=nsfw,religious,political,racist,sexist,explicit&amount=2",
// )
//   .then(function (reponse) {
//     return reponse.json();
//   })
//   .then(function (donnees) {
//     console.log(donnees.jokes[0].setup);
//     console.log(donnees.jokes[0].delivery);
//   });

//   1. Utilisez la fonction fetch pour récupérer les données des utilisateurs
// depuis l’API publique suivante :
// https://jsonplaceholder.typicode.com/users.
// 2. Affichez dans la console le nom, l’email et le numéro de téléphone de
// chaque utilisateur.
// 3. Gérez les erreurs potentielles avec un bloc catch.

// fetch("https://jsonplaceholder.typicode.com/users")
//   .then(function (response) {
//     return response.json();
//   })
//   .then(function (data) {
//     data.forEach(function (user) {
//       console.log(user.name);
//       console.log(user.email);
//       console.log(user.phone);
//     });
//   });

// ou data.forEach(function(user){

//console.log(`${user.name} : ${user.email} - ${user.phone}`)}); c402c01ef76ecafbe5ac3a3afe35deafy

//

const form = document.querySelector("form");
const cityInput = document.getElementById("city");
const resultat = document.getElementById("resultat");
const icon = document.getElementById("icon");
const weatherResult = document.getElementById("weatherResult");

const apiKey = "c402c01ef76ecafbe5ac3a3afe35deaf";

form.addEventListener("submit", function (event) {
  event.preventDefault();
  weatherResult.classList.remove("show");
  resultat.textContent = "";
  icon.style.display = "none";

  const city = cityInput.value;

  if (city === "") {
    resultat.textContent = "Veuillez saisir une ville.";
    return;
  }

  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=metric" +
    "&lang=fr" +
    "&appid=" +
    apiKey;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.cod !== 200) {
        resultat.textContent =
          "Ville introuvable. Veuillez vérifier le nom saisi.";
        return;
      }

      const ville = data.name;
      const temperature = Math.round(data.main.temp);
      const description = data.weather[0].description;

      const iconCode = data.weather[0].icon;
      const iconUrl =
        "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";

      resultat.textContent =
        "À " +
        ville +
        ", il fait " +
        temperature +
        "°C avec " +
        description +
        ".";
      icon.src = iconUrl;
      icon.style.display = "block";
      icon.alt = description;

      // déclenchement animation
      weatherResult.classList.add("show");
    });
});

//https://api.openweathermap.org/data/2.5/weather?q={cityname}
