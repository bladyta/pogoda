// Plik config.js - zawiera podstawowe zmienne i stałe konfiguracyjne

// Globalne zmienne
const iconSize = "15px";
const weatherIconSize = "24px";

// Lista miast
const cities = [
    "Szczecin", "Gdańsk", "Olsztyn", "Białystok", "Zielona Góra", "Poznań",
    "Bydgoszcz", "Toruń", "Łódź", "Warszawa", "Lublin", "Wrocław", "Katowice",
    "Kraków", "Zakopane", "Rzeszów", "Inowrocław", "Włocławek", "Brodnica", "Grudziądz", "Tuchola"
];

// Lista miast z województwa kujawsko-pomorskiego
const kujawskoPomorskieCities = ["Bydgoszcz", "Toruń", "Włocławek", "Grudziądz", "Inowrocław", "Brodnica", "Tuchola"];

// Lista miast, które nie mają być wyświetlane na mapie
const excludeFromMap = ["Inowrocław", "Tuchola", "Włocławek", "Grudziądz", "Brodnica", "Toruń"];

// Obiekt przechowujący dane pogodowe - dostępny globalnie
let weatherData = {};

// Obiekt z przykładowymi współrzędnymi nakładek (procentowo)
const cityPositions = {
    "Szczecin": { top: "20%", left: "10%" },
    "Gdańsk": { top: "10%", left: "40%" },
    "Olsztyn": { top: "20%", left: "70%" },
    "Białystok": { top: "40%", left: "90%" },
    "Zielona Góra": { top: "50%", left: "15%" },
    "Poznań": { top: "37%", left: "30%" },
    "Bydgoszcz": { top: "25%", left: "45%" },
    "Łódź": { top: "58%", left: "55%" },
    "Warszawa": { top: "49%", left: "67%" },
    "Lublin": { top: "66%", left: "84%" },
    "Wrocław": { top: "65%", left: "25%" },
    "Katowice": { top: "73%", left: "45%" },
    "Kraków": { top: "79%", left: "60%" },
    "Zakopane": { top: "90%", left: "55%" },
    "Rzeszów": { top: "80%", left: "80%" }
};

// Warunki pogodowe – wartości oraz opisy
const weatherConditions = [
    { value: "0", description: "0 - Bezchmurnie" },
    { value: "1", description: "1 - Zachmurzenie Małe" },
    { value: "2", description: "2 - Zachmurzenie Umiarkowane" },
    { value: "3", description: "3 - Zachmurzenie Duże" },
    { value: "4", description: "4 - Zachmurzenie Pełne" },
    { value: "10", description: "10 - Ciągły deszcz" },
    { value: "11", description: "11 - Ciągły deszcz ze śniegiem" },
    { value: "12", description: "12 - Ciągły śnieg" },
    { value: "13", description: "13 - Burza i ciągły deszcz" },
    { value: "14", description: "14 - Burza i ciągły śnieg" },
    { value: "20", description: "20 - Przelotny deszcz" },
    { value: "21", description: "21 - Przelotny deszcz ze śniegiem" },
    { value: "22", description: "22 - Przelotny śnieg" },
    { value: "23", description: "23 - Burza i przelotny deszcz" },
    { value: "24", description: "24 - Burza i przelotny śnieg" }
];

// Refaktoryzacja mapowania ikon pogodowych
const weatherIconMap = {
    day: {
        "0": '<i class="wi wi-day-sunny"></i>',           // Bezchmurnie (dzień)
        "1": '<i class="wi wi-day-cloudy"></i>',          // Zachmurzenie małe (dzień)
        "2": '<i class="wi wi-cloud"></i>',               // Zachmurzenie umiarkowane
        "3": '<i class="wi wi-cloudy"></i>',              // Zachmurzenie duże
        "4": '<i class="wi wi-cloudy"></i>',              // Zachmurzenie pełne
        "10": '<i class="wi wi-rain"></i>',               // Ciągły deszcz
        "11": '<i class="wi wi-rain-mix"></i>',           // Ciągły deszcz ze śniegiem
        "12": '<i class="wi wi-snow"></i>',               // Ciągły śnieg
        "13": '<i class="wi wi-thunderstorm"></i>',       // Burza i ciągły deszcz
        "14": '<i class="wi wi-snow-wind"></i>',          // Burza i ciągły śnieg
        "20": '<i class="wi wi-showers"></i>',            // Przelotny deszcz
        "21": '<i class="wi wi-rain-mix"></i>',           // Przelotny deszcz ze śniegiem
        "22": '<i class="wi wi-snow"></i>',               // Przelotny śnieg
        "23": '<i class="wi wi-thunderstorm"></i>',       // Burza i przelotny deszcz
        "24": '<i class="wi wi-snow-wind"></i>'           // Burza i przelotny śnieg
    },
    night: {
        "0": '<i class="wi wi-night-clear"></i>',         // Bezchmurnie (noc)
        "1": '<i class="wi wi-night-alt-cloudy"></i>',    // Zachmurzenie małe (noc)
        "2": '<i class="wi wi-night-alt-cloudy"></i>',    // Zachmurzenie umiarkowane (noc)
        "3": '<i class="wi wi-cloudy"></i>',              // Zachmurzenie duże
        "4": '<i class="wi wi-cloudy"></i>',              // Zachmurzenie pełne
        "10": '<i class="wi wi-night-alt-rain"></i>',     // Ciągły deszcz (noc)
        "11": '<i class="wi wi-night-alt-rain-mix"></i>', // Ciągły deszcz ze śniegiem (noc)
        "12": '<i class="wi wi-night-alt-snow"></i>',     // Ciągły śnieg (noc)
        "13": '<i class="wi wi-night-alt-thunderstorm"></i>', // Burza i ciągły deszcz (noc)
        "14": '<i class="wi wi-night-alt-snow-thunderstorm"></i>', // Burza i ciągły śnieg (noc)
        "20": '<i class="wi wi-night-alt-showers"></i>',  // Przelotny deszcz (noc)
        "21": '<i class="wi wi-night-alt-rain-mix"></i>', // Przelotny deszcz ze śniegiem (noc)
        "22": '<i class="wi wi-night-alt-snow"></i>',     // Przelotny śnieg (noc)
        "23": '<i class="wi wi-night-alt-thunderstorm"></i>', // Burza i przelotny deszcz (noc)
        "24": '<i class="wi wi-night-alt-snow-thunderstorm"></i>' // Burza i przelotny śnieg (noc)
    }
};