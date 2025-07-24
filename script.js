
let currentLanguage = 'en';

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
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'de' : 'en';
  updateUIText();
}
