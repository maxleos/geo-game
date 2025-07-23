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

const countries = [
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia",
  "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname",
  "Uruguay", "Venezuela"
];

function updateScore() {
  document.getElementById("score").textContent =
    `Correct: ${correctCount} | Incorrect: ${wrongCount}`;
}

function loadGeoData() {
  return fetch("ne_countries.geojson") // Local Natural Earth GeoJSON
    .then(res => res.json())
    .then(data => {
      geoData = data;
    });
}

function loadNext() {
  document.getElementById("feedback").textContent = "";
  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  const correct = countries[Math.floor(Math.random() * countries.length)];
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

  const choices = [correct];
  while (choices.length < 3) {
    const option = countries[Math.floor(Math.random() * countries.length)];
    if (!choices.includes(option)) {
      choices.push(option);
    }
  }

  shuffle(choices);
  document.getElementById("choices").innerHTML = choices.map(name => {
    return `<button onclick="checkAnswer('${name}')">${name}</button>`;
  }).join("");
}

function checkAnswer(name) {
  const feedback = document.getElementById("feedback");
  if (name === currentCountry) {
    feedback.textContent = "Correct!";
    feedback.style.color = "green";
    correctCount++;
  } else {
    feedback.textContent = "Wrong!";
    feedback.style.color = "red";
    wrongCount++;
  }
  updateScore();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

window.onload = () => {
  updateScore();
  loadGeoData().then(() => {
    loadNext();
  });
};
