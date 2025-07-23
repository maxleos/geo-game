let map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([20, 0], 2);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CartoDB',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

let geojsonLayer;
let geoData = null;
let currentCountry = null;
let correctCount = 0;
let wrongCount = 0;
let countryQueue = [];
let allCountries = [];

const continents = {
  "South America": [
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia",
    "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname",
    "Uruguay", "Venezuela"
  ],
  "Europe": [
    "France", "Germany", "Italy", "Spain", "Portugal", "Norway", "Sweden", "Finland", "Poland", "Greece",
    "United Kingdom", "Ireland", "Austria", "Hungary", "Romania", "Bulgaria", "Netherlands", "Belgium", "Denmark", "Switzerland"
  ],
  "Africa": [
    "Nigeria", "Egypt", "South Africa", "Morocco", "Kenya", "Ethiopia", "Ghana", "Algeria", "Uganda", "Tanzania"
  ],
  "Asia": [
    "China", "India", "Japan", "South Korea", "Indonesia", "Thailand", "Vietnam", "Malaysia", "Saudi Arabia", "Iran"
  ],
  "North America": [
    "United States", "Canada", "Mexico", "Guatemala", "Cuba", "Panama", "Honduras", "Nicaragua", "Costa Rica", "Haiti"
  ],
  "Oceania": [
    "Australia", "New Zealand", "Papua New Guinea", "Fiji", "Samoa"
  ]
};

function updateScore() {
  document.getElementById("score").textContent =
    `Correct: ${correctCount} | Incorrect: ${wrongCount}`;
}

function loadGeoData() {
  return fetch("ne_countries.geojson")
    .then(res => res.json())
    .then(data => {
      geoData = data;
    });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startGame(selectedContinent) {
  allCountries = continents[selectedContinent];
  countryQueue = shuffle([...allCountries]);
  correctCount = 0;
  wrongCount = 0;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";
  updateScore();
  loadNext();
}

function loadNext() {
  document.getElementById("feedback").textContent = "";
  document.getElementById("choices").innerHTML = "";

  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  if (countryQueue.length === 0) {
    const total = correctCount + wrongCount;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    document.getElementById("feedback").textContent = `Game over! You got ${percentage}% correct.`;
    return;
  }

  const correct = countryQueue.shift();
  currentCountry = correct;

  const feature = geoData.features.find(f =>
    f.properties.ADMIN.toLowerCase().includes(correct.toLowerCase())
  );

  if (feature) {
    geojsonLayer = L.geoJSON(feature, {
      style: {
        color: "#000",
        fillColor: "#ccc",
        weight: 2,
        fillOpacity: 0.8
      }
    }).addTo(map);
    map.fitBounds(geojsonLayer.getBounds());
    map.invalidateSize();
  } else {
    document.getElementById("feedback").textContent = "Error loading map.";
    console.error("Could not match country:", correct);
  }

  const choices = shuffle([
    correct,
    ...shuffle(allCountries.filter(c => c !== correct)).slice(0, 2)
  ]);

  document.getElementById("choices").innerHTML = choices.map(name => {
    return `<button onclick="checkAnswer('${name}')">${name}</button>`;
  }).join("");
}

function checkAnswer(name) {
  const feedback = document.getElementById("feedback");
  if (name === currentCountry) {
    feedback.textContent = "Well done, let's try the next one!";
    feedback.style.color = "green";
    correctCount++;
    updateScore();
    setTimeout(loadNext, 1500);
  } else {
    feedback.textContent = "Incorrect, try again.";
    feedback.style.color = "red";
    wrongCount++;
    updateScore();
  }
}

function showContinentMenu() {
  const menu = document.getElementById("continent-choices");
  menu.innerHTML = Object.keys(continents).map(continent =>
    `<button onclick="startGame('${continent}')">${continent}</button>`
  ).join("");
}

window.onload = () => {
  loadGeoData().then(() => {
    showContinentMenu();
  });
};
