let map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([-15, -60], 3);

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

const allCountries = [
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia",
  "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname",
  "Uruguay", "Venezuela"
];

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

function startGame() {
  countryQueue = shuffle([...allCountries]);
  correctCount = 0;
  wrongCount = 0;
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

window.onload = () => {
  loadGeoData().then(() => {
    startGame();
  });
};
