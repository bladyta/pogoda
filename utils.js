// Plik utils.js - zawiera uniwersalne funkcje pomocnicze

// Funkcja do wyświetlania powiadomień
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

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
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { valid: false, message: 'Nieprawidłowa struktura danych' };
    }

    for (const city in data) {
        const cityData = data[city];

        if (!cityData || typeof cityData !== 'object' || Array.isArray(cityData)) {
            return { valid: false, message: `Nieprawidłowe dane dla miasta: ${city}` };
        }

        if (
            !('tempDay' in cityData) ||
            !('tempNight' in cityData) ||
            !('conditionDay' in cityData) ||
            !('conditionNight' in cityData)
        ) {
            return { valid: false, message: `Brakujące dane dla miasta: ${city}` };
        }

        const tempDay = parseInt(cityData.tempDay, 10);
        const tempNight = parseInt(cityData.tempNight, 10);

        // Zakres zgodny z generateTempOptions()
        if (isNaN(tempDay) || tempDay < -20 || tempDay > 40) {
            return { valid: false, message: `Nieprawidłowa temperatura dzienna dla miasta: ${city}` };
        }

        if (isNaN(tempNight) || tempNight < -20 || tempNight > 40) {
            return { valid: false, message: `Nieprawidłowa temperatura nocna dla miasta: ${city}` };
        }

        const validConditions = weatherConditions.map(cond => String(cond.value));

        if (!validConditions.includes(String(cityData.conditionDay))) {
            return { valid: false, message: `Nieprawidłowy warunek dzienny dla miasta: ${city}` };
        }

        if (!validConditions.includes(String(cityData.conditionNight))) {
            return { valid: false, message: `Nieprawidłowy warunek nocny dla miasta: ${city}` };
        }
    }

    return { valid: true };
}

// Funkcja usuwająca polskie znaki
function removePolishCharacters(str) {
    const polishChars = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'Ł': 'L',
        'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
    };
    return str.replace(/[ąćęłńóśźżŁ]/g, match => polishChars[match]);
}

// Funkcja upraszczająca nazwę do porównywania
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

    if (cityMapping[cityName]) {
        return cityMapping[cityName];
    }

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
