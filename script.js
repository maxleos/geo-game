let map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([-15, -60], 3);

// REMOVE tile layer to show only the country outline
// (no base map, no labels)

let geojsonLayer;
let currentCountry = null;
let correctCount = 0;
let wrongCount = 0;

const southAmericanCountries = [
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia",
  "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"
];

function updateScore() {
  document.getElementById("score").textContent = 
    `Correct: ${correctCount} | Incorrect: ${wrongCount}`;
}

function getCountryGeoJSON(name) {
  return fetch(`https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson`)
    .then(res => res.json())
    .then(data => {
      const countryFeature = data.features.find(f => f.properties.ADMIN === name);
      return countryFeature ? countryFeature : null;
    });
}

function loadNext() {
  document.getElementById("feedback").textContent = "";
  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  const correct = southAmericanCountries[Math.floor(Math.random() * southAmericanCountries.length)];
  currentCountry = correct;

  getCountryGeoJSON(correct).then(feature => {
    if (feature) {
      geojsonLayer = L.geoJSON(feature, {
        style: {
          color: "#000",
          fillColor: "#ccc",
          weight: 2,
          fillOpacity: 0.7
        }
      }).addTo(map);
      map.fitBounds(geojsonLayer.getBounds());
    } else {
      console.error("Could not find country:", correct);
    }
  });

  const choices = [correct];
  while (choices.length < 3) {
    const option = southAmericanCountries[Math.floor(Math.random() * southAmericanCountries.length)];
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
  loadNext();
};
