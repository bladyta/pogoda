// Plik utils.js - zawiera uniwersalne funkcje pomocnicze

// Funkcja do wyświetlania powiadomień
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animacja pojawienia się
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Zniknięcie po 3 sekundach
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Funkcja generująca opcje temperatur
function generateTempOptions() {
    let options = '';
    for (let i = -20; i <= 40; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}

// Funkcja walidacji danych
function validateWeatherData(data) {
    if (!data || typeof data !== 'object') {
        return { valid: false, message: 'Nieprawidłowa struktura danych' };
    }

    // Sprawdź, czy wszystkie miasta mają właściwe wartości
    for (const city in data) {
        const cityData = data[city];

        if (!cityData || typeof cityData !== 'object') {
            return { valid: false, message: `Nieprawidłowe dane dla miasta: ${city}` };
        }

        // Sprawdź wymagane pola
        if (!('tempDay' in cityData) || !('tempNight' in cityData) ||
            !('conditionDay' in cityData) || !('conditionNight' in cityData)) {
            return { valid: false, message: `Brakujące dane dla miasta: ${city}` };
        }

        // Sprawdź zakres temperatur
        const tempDay = parseInt(cityData.tempDay);
        const tempNight = parseInt(cityData.tempNight);

        if (isNaN(tempDay) || tempDay < -15 || tempDay > 30) {
            return { valid: false, message: `Nieprawidłowa temperatura dzienna dla miasta: ${city}` };
        }

        if (isNaN(tempNight) || tempNight < -15 || tempNight > 30) {
            return { valid: false, message: `Nieprawidłowa temperatura nocna dla miasta: ${city}` };
        }

        // Sprawdź warunki pogodowe
        const validConditions = weatherConditions.map(cond => cond.value);

        if (!validConditions.includes(cityData.conditionDay)) {
            return { valid: false, message: `Nieprawidłowy warunek dzienny dla miasta: ${city}` };
        }

        if (!validConditions.includes(cityData.conditionNight)) {
            return { valid: false, message: `Nieprawidłowy warunek nocny dla miasta: ${city}` };
        }
    }

    return { valid: true };
}

// Funkcja usuwająca polskie znaki
function removePolishCharacters(str) {
    const polishChars = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'Ł': 'L', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' };
    return str.replace(/[ąćęłńóśźżŁ]/g, match => polishChars[match]);
}

// Funkcja upraszczająca nazwę do porównywania (usuwa polskie znaki, zamienia na małe litery)
function simplifyName(name) {
    if (!name) return '';
    
    return name.toLowerCase()
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z');
}

// Pomocnicza funkcja do normalizacji nazw miast
function normalizeCity(cityName) {
    // Mapa polskich nazw miast na oczekiwane nazwy w aplikacji
    const cityMapping = {
        "Gdansk": "Gdańsk",
        "Zielona Gora": "Zielona Góra",
        "Poznan": "Poznań",
        "Torun": "Toruń",
        "Lodz": "Łódź",
        "Wroclaw": "Wrocław",
        "Krakow": "Kraków",
        "Rzeszow": "Rzeszów",
        "Inowroclaw": "Inowrocław",
        "Wloclawek": "Włocławek",
        "Grudziadz": "Grudziądz",
        "Bialystok": "Białystok"
    };
    
    // Sprawdź, czy mamy mapowanie dla tego miasta
    if (cityMapping[cityName]) {
        return cityMapping[cityName];
    }
    
    // Jeśli nie mamy mapowania, zwróć oryginalną nazwę
    return cityName;
}

// Pomocnicza funkcja do pobierania plików
function downloadFile(content, fileName, contentType) {
    try {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Błąd podczas generowania pliku do pobrania:', error);
        showNotification('Błąd podczas generowania pliku', 'error');
    }
}
