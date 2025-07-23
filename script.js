let map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView([-15, -60], 3);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CartoDB',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

let geojsonLayer, geoData;
let currentCountry, correctCount = 0, wrongCount = 0;
const countries = ["Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana","Paraguay","Peru","Suriname","Uruguay","Venezuela"];

function updateScore() {
  document.getElementById("score").textContent = `Correct: ${correctCount} | Incorrect: ${wrongCount}`;
}

function loadGeoData() {
  return fetch("ne_countries.geojson")
    .then(r => r.json())
    .then(data => geoData = data)
    .catch(e => console.error("GeoJSON load failed:", e));
}

function loadNext() {
  if (!geoData) return console.error("Geo data not loaded yet");
  document.getElementById("feedback").textContent = "";
  if (geojsonLayer) map.removeLayer(geojsonLayer);

  currentCountry = countries[Math.floor(Math.random() * countries.length)];
  const feature = geoData.features.find(f =>
    f.properties.ADMIN.toLowerCase().includes(currentCountry.toLowerCase())
  );

  if (feature) {
    geojsonLayer = L.geoJSON(feature, {
      style: { color: "#000", fillColor: "#ccc", weight: 2, fillOpacity: 0.8 }
    }).addTo(map);
    map.fitBounds(geojsonLayer.getBounds());
    map.invalidateSize();
  } else {
    console.error("No matching feature for:", currentCountry);
    document.getElementById("feedback").textContent = "Outline not found 😕";
  }

  // Setup choice buttons
  const opts = [currentCountry];
  while (opts.length < 3) {
    const pick = countries[Math.floor(Math.random() * countries.length)];
    if (!opts.includes(pick)) opts.push(pick);
  }

  document.getElementById("choices").innerHTML =
    opts.sort(() => Math.random() - 0.5)
      .map(n => `<button onclick="checkAnswer('${n}')">${n}</button>`).join("");
}

function checkAnswer(name) {
  const fb = document.getElementById("feedback");
  if (name === currentCountry) { fb.textContent="Correct!"; fb.style.color="green"; correctCount++; }
  else { fb.textContent="Wrong!"; fb.style.color="red"; wrongCount++; }
  updateScore();
}

function shuffle() {} // not used here

window.onload = () => {
  updateScore();
  loadGeoData().then(() => loadNext());
};
