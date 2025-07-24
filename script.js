
let map;
let geoData = null;
let currentCountry = null;
let countries = [];
let correctCount = 0;
let wrongCount = 0;
let shownCountries = [];
let currentLanguage = 'en';
let lastScoreText = "";

const uiText = {
  en: {
    title: "Guess the Country",
    selectContinent: "Select a continent:",
    correct: "Correct!",
    incorrect: "Incorrect, try again",
    wellDone: "Well done, let's try the next one",
    score: "Correct: {c} | Incorrect: {w}",
    final: "Game Finished!",
    backToMenu: "Back to continent selection",
    backToGame: "Back to ongoing game",
    end: "End",
    fullscreen: "Fullscreen"
  },
  de: {
    title: "Welches Land ist das?",
    selectContinent: "Wähle einen Kontinent:",
    correct: "Richtig!",
    incorrect: "Falsch, versuch's noch einmal",
    wellDone: "Gut gemacht, weiter geht's",
    score: "Richtig: {c} | Falsch: {w}",
    final: "Spiel beendet!",
    backToMenu: "Zurück zur Kontinent-Auswahl",
    backToGame: "Zurück zum Spiel",
    end: "Beenden",
    fullscreen: "Vollbild"
  }
};

const countryTranslations = {
  "Germany": "Deutschland",
  "France": "Frankreich",
  "Brazil": "Brasilien",
  "Argentina": "Argentinien",
  "India": "Indien",
  "United States of America": "Vereinigte Staaten",
  "United Kingdom": "Vereinigtes Königreich",
  "Italy": "Italien",
  "Spain": "Spanien",
  "China": "China",
  "Russia": "Russland",
  "Canada": "Kanada",
  "Mexico": "Mexiko",
  "Australia": "Australien",
  "South Africa": "Südafrika",
  "Japan": "Japan"
};

function translateCountry(name) {
  return currentLanguage === 'de' ? (countryTranslations[name] || name) : name;
}

function updateUIText() {
  document.querySelector('h1').textContent = uiText[currentLanguage].title;
  document.querySelector('#menu p').textContent = uiText[currentLanguage].selectContinent;
  document.querySelector('.end-btn').textContent = uiText[currentLanguage].end;
  document.querySelector('.fullscreen-btn').textContent = uiText[currentLanguage].fullscreen;
  document.querySelector('.lang-btn').textContent = "EN/DE";
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'de' : 'en';
  updateUIText();
  updateScore();
  if (currentCountry) {
    showChoices(currentCountry);
  }
}

function startGame(continent) {
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";

  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([20, 0], 2);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
    .then(res => res.json())
    .then(data => {
      geoData = data;
      countries = data.features.filter(f =>
        f.properties.CONTINENT === continent &&
        f.properties.ADMIN === f.properties.SOVEREIGNT
      ).map(f => f.properties.ADMIN);

      shuffle(countries);
      countries = countries.slice(0, 20);
      nextCountry();
    });
}

function nextCountry() {
  if (map._layers) {
    for (let i in map._layers) {
      if (map._layers[i]._path !== undefined) {
        try {
          map.removeLayer(map._layers[i]);
        } catch (e) {}
      }
    }
  }

  if (countries.length === 0) {
    let total = correctCount + wrongCount;
    let percentage = total ? Math.round((correctCount / total) * 100) : 0;
    lastScoreText = `You got ${percentage}% correct.`;
    document.getElementById("game").style.display = "none";
    document.getElementById("end-screen").style.display = "block";
    document.getElementById("final-score").textContent = lastScoreText;
    return;
  }

  currentCountry = countries.pop();
  const feature = geoData.features.find(
    f => f.properties.ADMIN.toLowerCase() === currentCountry.toLowerCase()
  );
  if (feature) {
    L.geoJSON(feature, {
      style: {
        color: "#2277aa",
        fillColor: "#88c",
        weight: 2,
        fillOpacity: 0.7
      }
    }).addTo(map).bringToFront();
    map.fitBounds(L.geoJSON(feature).getBounds());
  }
  showChoices(currentCountry);
}

function showChoices(correct) {
  const options = [correct];
  while (options.length < 3) {
    const pick = geoData.features[Math.floor(Math.random() * geoData.features.length)].properties.ADMIN;
    if (!options.includes(pick)) options.push(pick);
  }
  shuffle(options);
  document.getElementById("choices").innerHTML = options.map(name =>
    `<button onclick="checkAnswer('${name}')">${translateCountry(name)}</button>`
  ).join("");
}

function checkAnswer(name) {
  const feedback = document.getElementById("feedback");
  if (name === currentCountry) {
    feedback.textContent = uiText[currentLanguage].wellDone;
    feedback.style.color = "green";
    correctCount++;
    updateScore();
    setTimeout(() => {
      feedback.textContent = "";
      nextCountry();
    }, 1000);
  } else {
    feedback.textContent = uiText[currentLanguage].incorrect;
    feedback.style.color = "red";
    wrongCount++;
    updateScore();
  }
}

function updateScore() {
  document.getElementById("score").textContent =
    uiText[currentLanguage].score.replace("{c}", correctCount).replace("{w}", wrongCount);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function backToMenu() {
  location.reload();
}

function endGame() {
  document.getElementById("game").style.display = "none";
  document.getElementById("end-screen").style.display = "block";
  let total = correctCount + wrongCount;
  let percentage = total ? Math.round((correctCount / total) * 100) : 0;
  lastScoreText = `You got ${percentage}% correct.`;
  document.getElementById("final-score").textContent = lastScoreText;
}

function resumeGame() {
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("game").style.display = "block";
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

window.onload = () => {
  updateUIText();
  const continents = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];
  document.getElementById("continent-choices").innerHTML = continents.map(cont =>
    `<button onclick="startGame('${cont}')">${cont}</button>`
  ).join("");
};
