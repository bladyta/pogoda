// Plik data.js - funkcje do obsługi danych (import, eksport, localStorage)

// Funkcja wymuszająca całkowite czyszczenie localStorage
function forceClearLocalStorage() {
    try {
        // Zapamiętaj nazwy wszystkich kluczy przed wyczyszczeniem
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            allKeys.push(localStorage.key(i));
        }

        // Najpierw całkowicie wyczyść localStorage
        localStorage.clear();

        // Dodatkowo dla pewności explicite usuwamy nasz klucz i wszystkie inne
        localStorage.removeItem('weatherData');
        allKeys.forEach(key => localStorage.removeItem(key));

        // Aby być pewnym, że localStorage jest wyczyszczony, sprawdzamy czy klucz został usunięty
        const stillExists = localStorage.getItem('weatherData');
        if (stillExists) {
            console.error('Nie udało się usunąć danych z localStorage!');
            return false;
        }

        console.log('Pamięć podręczna została całkowicie wyczyszczona');

        // Wyczyść zmienną globalną
        weatherData = {};

        // Zaktualizuj interfejs
        populateTable();

        // Powiadom użytkownika
        showNotification('Pamięć przeglądarki została całkowicie wyczyszczona', 'success');
        return true;
    } catch (error) {
        console.error('Błąd podczas czyszczenia localStorage:', error);
        showNotification('Błąd podczas czyszczenia pamięci podręcznej', 'error');
        return false;
    }
}

// Funkcja do aktualizacji danych pogodowych
function updateWeatherData() {
    const rows = document.querySelectorAll('#table-body tr');

    try {
        rows.forEach(row => {
            if (!row || !row.cells || row.cells.length < 6) return;

            const city = row.cells[1].innerText;
            const selectNight = row.cells[2].querySelector('select');
            const selectTempNight = row.cells[3].querySelector('select');
            const selectDay = row.cells[4].querySelector('select');
            const selectTempDay = row.cells[5].querySelector('select');

            if (!selectNight || !selectTempNight || !selectDay || !selectTempDay) return;

            const conditionNight = selectNight.value;
            const tempNight = selectTempNight.value;
            const conditionDay = selectDay.value;
            const tempDay = selectTempDay.value;

            weatherData[city] = { tempDay, tempNight, conditionDay, conditionNight };
        });
    } catch (error) {
        console.error("Błąd podczas aktualizacji danych pogodowych:", error);
    }
}

// Funkcja do zapisywania danych w localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('weatherData', JSON.stringify(weatherData));
        console.log('Dane zapisane w localStorage');
    } catch (error) {
        console.error('Błąd podczas zapisywania w localStorage:', error);
    }
}

// Funkcja do wczytywania danych z localStorage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('weatherData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const validationResult = validateWeatherData(parsedData);

            if (validationResult.valid) {
                weatherData = parsedData;
                populateTable();
                showNotification('Wczytano zapisane dane', 'success');
            } else {
                console.error('Nieprawidłowe dane w localStorage:', validationResult.message);
                showNotification('Błąd wczytywania zapisanych danych', 'error');
                populateTable();
            }
        } else {
            populateTable();
        }
    } catch (error) {
        console.error('Błąd podczas wczytywania z localStorage:', error);
        populateTable();
    }
}

// Funkcja do czyszczenia pamięci lokalnej
function clearLocalStorage() {
    try {
        if (confirm('Czy na pewno chcesz wyczyścić pamięć podręczną? Spowoduje to usunięcie zapisanych danych pogodowych.')) {
            localStorage.removeItem('weatherData');
            showNotification('Pamięć podręczna została wyczyszczona', 'info');

            weatherData = {};
            populateTable();
        }
    } catch (error) {
        console.error('Błąd podczas czyszczenia pamięci lokalnej:', error);
        showNotification('Błąd podczas czyszczenia pamięci podręcznej', 'error');
    }
}

// Pomocnicza funkcja do odczytu zarówno starego, jak i nowego formatu importu
function extractImportedCityData(data) {
    const conditionNight = String(data?.["10"] ?? data?.NOC ?? "");
    const tempNight = String(data?.["1"] ?? data?.min ?? "");
    let conditionDay = String(data?.DZIEN ?? "");
    const tempDay = String(data?.max ?? "");

    if (conditionDay.includes('/')) {
        conditionDay = conditionDay.split('/')[0];
    }

    return {
        conditionNight,
        tempNight,
        conditionDay,
        tempDay
    };
}

// Pomocnicza funkcja do znajdowania miasta z importu w aplikacji
function findMatchingCityName(importCityName) {
    let normalizedCity = normalizeCity(importCityName);

    if (cities.includes(normalizedCity)) {
        return normalizedCity;
    }

    const simplifiedImportCityName = simplifyName(importCityName);

    const appCityMap = {};
    cities.forEach(city => {
        appCityMap[simplifyName(city)] = city;
    });

    if (appCityMap[simplifiedImportCityName]) {
        return appCityMap[simplifiedImportCityName];
    }

    const foundCity = cities.find(c =>
        simplifyName(c).includes(simplifiedImportCityName) ||
        simplifiedImportCityName.includes(simplifyName(c))
    );

    return foundCity || null;
}

// Konwersja importowanego payloadu do formatu aplikacji
function convertImportedWeatherPayload(importedData) {
    if (!Array.isArray(importedData) || importedData.length === 0) {
        return {
            valid: false,
            message: 'Nieprawidłowy format danych - oczekiwano tablicy'
        };
    }

    const cityData = importedData[0];
    if (!cityData || typeof cityData !== 'object' || Array.isArray(cityData)) {
        return {
            valid: false,
            message: 'Nieprawidłowy format danych miast'
        };
    }

    const convertedData = {};
    let importedCities = 0;
    let skippedCities = 0;
    let errorCities = 0;

    for (const city in cityData) {
        try {
            const data = cityData[city];

            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                console.warn(`Pomijanie miasta: ${city} (nieprawidłowe dane)`);
                skippedCities++;
                continue;
            }

            const { conditionNight, tempNight, conditionDay, tempDay } = extractImportedCityData(data);

            if (
                conditionNight === "" ||
                tempNight === "" ||
                conditionDay === "" ||
                tempDay === ""
            ) {
                console.warn(`Pomijanie miasta: ${city} (brakujące dane pogodowe)`);
                skippedCities++;
                continue;
            }

            const matchedCity = findMatchingCityName(city);
            if (!matchedCity) {
                console.warn(`Pomijanie miasta: ${city} (nie znaleziono odpowiednika w aplikacji)`);
                skippedCities++;
                continue;
            }

            convertedData[matchedCity] = {
                tempDay: String(tempDay),
                tempNight: String(tempNight),
                conditionDay: String(conditionDay),
                conditionNight: String(conditionNight)
            };

            importedCities++;
        } catch (cityError) {
            console.error(`Błąd przetwarzania miasta ${city}:`, cityError);
            errorCities++;
        }
    }

    if (importedCities === 0) {
        return {
            valid: false,
            message: 'Nie udało się zaimportować żadnych danych',
            stats: { importedCities, skippedCities, errorCities }
        };
    }

    return {
        valid: true,
        convertedData,
        stats: { importedCities, skippedCities, errorCities }
    };
}

// Funkcja wczytująca plik
function loadFile(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'json' && fileExt !== 'txt') {
            showNotification('Obsługiwane są tylko pliki JSON i TXT', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const parsedData = JSON.parse(e.target.result);

                // Najpierw spróbuj wczytać klasyczny format aplikacji
                const validationResult = validateWeatherData(parsedData);

                if (validationResult.valid) {
                    weatherData = parsedData;
                    populateTable();
                    saveToLocalStorage();
                    showNotification('Plik wczytany pomyślnie', 'success');
                    return;
                }

                // Jeśli to nie jest format aplikacji, spróbuj potraktować go jako import zewnętrzny
                const importResult = convertImportedWeatherPayload(parsedData);

                if (importResult.valid) {
                    weatherData = importResult.convertedData;
                    populateTable();
                    saveToLocalStorage();

                    const { importedCities, skippedCities } = importResult.stats;
                    showNotification(`Plik zaimportowany pomyślnie. Zaimportowano ${importedCities} miast, pominięto ${skippedCities}.`, 'success');
                } else {
                    showNotification(`Błąd walidacji: ${validationResult.message}`, 'error');
                }
            } catch (error) {
                console.error('Błąd parsowania pliku:', error);
                showNotification('Błąd parsowania pliku. Sprawdź format danych.', 'error');
            }
        };

        reader.onerror = function () {
            showNotification('Błąd podczas odczytu pliku', 'error');
        };

        reader.readAsText(file);
    } catch (error) {
        console.error('Błąd podczas wczytywania pliku:', error);
        showNotification('Wystąpił błąd podczas wczytywania pliku', 'error');
    }
}

// Import danych pogodowych z pliku JSON
function importWeatherData(event) {
    try {
        const file = event.target.files[0];
        if (!file) {
            showNotification('Nie wybrano pliku', 'warning');
            return;
        }

        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'json') {
            showNotification('Obsługiwane są tylko pliki JSON', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                let dataText = e.target.result;

                if (dataText.charCodeAt(0) === 0xFEFF) {
                    dataText = dataText.slice(1);
                }

                if (!dataText.trim().startsWith('[') && !dataText.trim().startsWith('{')) {
                    showNotification('Plik nie zawiera prawidłowego formatu JSON', 'error');
                    return;
                }

                console.log('Zawartość pliku JSON:', dataText.substring(0, 200) + '...');

                const importedData = JSON.parse(dataText);
                const importResult = convertImportedWeatherPayload(importedData);

                if (!importResult.valid) {
                    showNotification(importResult.message, 'error');
                    return;
                }

                console.log('Zaimportowano:', importResult.convertedData);
                console.log(
                    `Statystyki importu: zaimportowano ${importResult.stats.importedCities} miast, ` +
                    `pominięto ${importResult.stats.skippedCities} miast, ` +
                    `błędy przy ${importResult.stats.errorCities} miastach`
                );

                // Czyścimy dopiero po udanym imporcie
                forceClearLocalStorage();

                weatherData = importResult.convertedData;
                populateTable();

                try {
                    saveToLocalStorage();
                    console.log('Dane zapisane w localStorage');
                } catch (storageError) {
                    console.error('Błąd zapisywania w localStorage:', storageError);
                    showNotification('Dane zaimportowane, ale nie mogły zostać zapisane w pamięci podręcznej', 'warning');
                }

                const summary = `Zaimportowano ${importResult.stats.importedCities} miast. Pominięto ${importResult.stats.skippedCities} miast.`;
                showNotification(`Dane pogodowe zaimportowane pomyślnie. ${summary}`, 'success');
            } catch (parsingError) {
                console.error('Błąd parsowania JSON:', parsingError);
                showNotification('Błąd parsowania pliku. Szczegóły w konsoli deweloperskiej.', 'error');
            }
        };

        reader.onerror = function () {
            showNotification('Błąd podczas odczytu pliku', 'error');
        };

        reader.readAsText(file);
    } catch (error) {
        console.error('Krytyczny błąd podczas importu:', error);
        showNotification('Wystąpił nieoczekiwany błąd podczas importu', 'error');
    }
}

// Usprawnienie eksportu danych - unikamy powtarzania kodu
function exportData(format) {
    try {
        const rows = document.querySelectorAll('#table-body tr');
        if (!rows.length) {
            showNotification('Brak danych do eksportu', 'warning');
            return;
        }

        const data = {};

        rows.forEach(row => {
            if (!row || !row.cells || row.cells.length < 6) return;

            const city = row.cells[1].innerText;
            const selectNight = row.cells[2].querySelector('select');
            const selectTempNight = row.cells[3].querySelector('select');
            const selectDay = row.cells[4].querySelector('select');
            const selectTempDay = row.cells[5].querySelector('select');

            if (!selectNight || !selectTempNight || !selectDay || !selectTempDay) return;

            const conditionNight = selectNight.value;
            const tempNight = selectTempNight.value;
            const conditionDay = selectDay.value;
            const tempDay = selectTempDay.value;

            if (!conditionNight || !conditionDay) {
                showNotification(`Brakujące dane pogodowe dla miasta: ${city}`, 'error');
                throw new Error(`Brakujące dane pogodowe dla miasta: ${city}`);
            }

            data[city] = { tempDay, tempNight, conditionDay, conditionNight };
        });

        if (Object.keys(data).length === 0) {
            showNotification('Brak poprawnych danych do eksportu', 'warning');
            return;
        }

        switch (format) {
            case 'txt':
                exportAsTxt(data);
                break;
            case 'xml':
                exportAsXml(data);
                break;
            case 'json':
                exportAsJson(data);
                break;
            default:
                console.error('Nieznany format:', format);
                showNotification('Nieznany format eksportu', 'error');
        }
    } catch (error) {
        console.error('Błąd podczas eksportu danych:', error);
        showNotification('Nie można wyeksportować niekompletnych danych', 'error');
    }
}

// Funkcje eksportu do poszczególnych formatów
function exportAsTxt(data) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, 'pogoda.txt', 'text/plain');
        showNotification('Wyeksportowano plik TXT', 'success');
    } catch (error) {
        console.error('Błąd podczas eksportu TXT:', error);
        showNotification('Błąd podczas eksportu TXT', 'error');
    }
}

function exportAsXml(data) {
    try {
        let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<weather>\n';

        Object.entries(data).forEach(([city, cityData]) => {
            const cityName = removePolishCharacters(city);
            xmlString += `  <city name="${cityName}">\n`;
            xmlString += `    <condition_night>${cityData.conditionNight}</condition_night>\n`;
            xmlString += `    <temp_night>${cityData.tempNight}</temp_night>\n`;
            xmlString += `    <condition_day>${cityData.conditionDay}</condition_day>\n`;
            xmlString += `    <temp_day>${cityData.tempDay}</temp_day>\n`;
            xmlString += `  </city>\n`;
        });

        xmlString += '</weather>';
        downloadFile(xmlString, 'pogoda.xml', 'application/xml');
        showNotification('Wyeksportowano plik XML', 'success');
    } catch (error) {
        console.error('Błąd podczas eksportu XML:', error);
        showNotification('Błąd podczas eksportu XML', 'error');
    }
}

function exportAsJson(data) {
    try {
        // Zostawiam eksport w starym formacie dla kompatybilności wstecznej
        const output = [{}];

        Object.entries(data).forEach(([city, cityData]) => {
            const cityName = removePolishCharacters(city);
            output[0][cityName] = {
                "1": Number.isFinite(Number(cityData.tempNight)) ? Number(cityData.tempNight) : 0,
                "10": String(cityData.conditionNight ?? 0),
                "DZIEN": String(cityData.conditionDay ?? 0),
                "max": Number.isFinite(Number(cityData.tempDay)) ? Number(cityData.tempDay) : 0
            };
        });

        const jsonString = JSON.stringify(output, null, 2);
        downloadFile(jsonString, 'pogoda.json', 'application/json');
        showNotification('Wyeksportowano plik JSON', 'success');
    } catch (error) {
        console.error('Błąd podczas eksportu JSON:', error);
        showNotification('Błąd podczas eksportu JSON', 'error');
    }
}

// Funkcja do eksportu wszystkich formatów
function exportAllFormats() {
    try {
        exportData('txt');
        exportData('xml');
        exportData('json');
        showNotification('Eksportowano dane we wszystkich formatach', 'success');
    } catch (error) {
        console.error('Błąd podczas eksportu wszystkich formatów:', error);
    }
}

// Resetowanie danych z potwierdzeniem
function resetData() {
    try {
        if (confirm('Czy na pewno chcesz zresetować wszystkie dane?')) {
            weatherData = {};
            populateTable();
            saveToLocalStorage();
            showNotification('Dane zostały zresetowane', 'info');
        }
    } catch (error) {
        console.error('Błąd podczas resetowania danych:', error);
        showNotification('Błąd podczas resetowania danych', 'error');
    }
}

// Funkcja ustawiająca wartości domyślne
function setDefaultValues() {
    try {
        weatherData = {
            "Szczecin": { tempDay: "4", tempNight: "-1", conditionDay: "2", conditionNight: "0" },
            "Gdańsk": { tempDay: "3", tempNight: "-2", conditionDay: "10", conditionNight: "4" },
            "Olsztyn": { tempDay: "2", tempNight: "-3", conditionDay: "3", conditionNight: "0" },
            "Białystok": { tempDay: "1", tempNight: "-5", conditionDay: "12", conditionNight: "12" },
            "Zielona Góra": { tempDay: "5", tempNight: "0", conditionDay: "2", conditionNight: "1" },
            "Poznań": { tempDay: "6", tempNight: "1", conditionDay: "1", conditionNight: "0" },
            "Bydgoszcz": { tempDay: "4", tempNight: "-1", conditionDay: "3", conditionNight: "2" },
            "Toruń": { tempDay: "4", tempNight: "-1", conditionDay: "3", conditionNight: "2" },
            "Łódź": { tempDay: "5", tempNight: "-1", conditionDay: "2", conditionNight: "1" },
            "Warszawa": { tempDay: "5", tempNight: "0", conditionDay: "2", conditionNight: "0" },
            "Lublin": { tempDay: "3", tempNight: "-2", conditionDay: "4", conditionNight: "0" },
            "Wrocław": { tempDay: "7", tempNight: "2", conditionDay: "2", conditionNight: "0" },
            "Katowice": { tempDay: "6", tempNight: "1", conditionDay: "3", conditionNight: "1" },
            "Kraków": { tempDay: "4", tempNight: "-1", conditionDay: "3", conditionNight: "0" },
            "Zakopane": { tempDay: "0", tempNight: "-7", conditionDay: "12", conditionNight: "12" },
            "Rzeszów": { tempDay: "3", tempNight: "-2", conditionDay: "2", conditionNight: "0" },
            "Inowrocław": { tempDay: "4", tempNight: "-1", conditionDay: "2", conditionNight: "1" },
            "Włocławek": { tempDay: "4", tempNight: "-1", conditionDay: "3", conditionNight: "2" },
            "Brodnica": { tempDay: "3", tempNight: "-2", conditionDay: "3", conditionNight: "1" },
            "Grudziądz": { tempDay: "3", tempNight: "-2", conditionDay: "4", conditionNight: "2" },
            "Tuchola": { tempDay: "2", tempNight: "-3", conditionDay: "11", conditionNight: "4" }
        };

        populateTable();
        saveToLocalStorage();
        showNotification('Ustawiono wartości domyślne dla wszystkich miast', 'success');
    } catch (error) {
        console.error('Błąd podczas ustawiania wartości domyślnych:', error);
        showNotification('Błąd podczas ustawiania wartości domyślnych', 'error');
    }
}

// Funkcja obsługująca wklejanie JSON bezpośrednio do aplikacji
function handlePasteJSON() {
    try {
        const dialogContainer = document.createElement('div');
        dialogContainer.className = 'paste-dialog-container';
        dialogContainer.innerHTML = `
            <div class="paste-dialog">
                <h3>Wklej zawartość pliku JSON</h3>
                <p>Wklej poniżej zawartość pliku JSON:</p>
                <textarea id="json-paste-area" rows="10" placeholder='[{"Bydgoszcz":{"NOC":"1","min":-8,"DZIEN":"1","max":-4}}]'></textarea>
                <div class="dialog-buttons">
                    <button id="paste-json-cancel" class="interactive-element">Anuluj</button>
                    <button id="paste-json-confirm" class="interactive-element">Importuj</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialogContainer);

        const pasteArea = document.getElementById('json-paste-area');
        if (pasteArea) {
            setTimeout(() => pasteArea.focus(), 0);
        }

        document.getElementById('paste-json-cancel').addEventListener('click', () => {
            document.body.removeChild(dialogContainer);
        });

        document.getElementById('paste-json-confirm').addEventListener('click', () => {
            const jsonText = document.getElementById('json-paste-area').value;
            document.body.removeChild(dialogContainer);

            if (!jsonText.trim()) {
                showNotification('Brak zawartości do importu', 'warning');
                return;
            }

            try {
                let dataText = jsonText;

                if (dataText.charCodeAt(0) === 0xFEFF) {
                    dataText = dataText.slice(1);
                }

                if (!dataText.trim().startsWith('[') && !dataText.trim().startsWith('{')) {
                    showNotification('Zawartość nie jest prawidłowym formatem JSON', 'error');
                    return;
                }

                const importedData = JSON.parse(dataText);
                const importResult = convertImportedWeatherPayload(importedData);

                if (!importResult.valid) {
                    showNotification(importResult.message, 'error');
                    return;
                }

                forceClearLocalStorage();

                weatherData = importResult.convertedData;
                populateTable();
                saveToLocalStorage();

                const summary = `Zaimportowano ${importResult.stats.importedCities} miast. Pominięto ${importResult.stats.skippedCities} miast.`;
                showNotification(`Dane pogodowe zaimportowane pomyślnie. ${summary}`, 'success');
            } catch (error) {
                console.error('Błąd podczas przetwarzania JSON:', error);
                showNotification('Błąd przetwarzania danych JSON. Sprawdź format.', 'error');
            }
        });

    } catch (error) {
        console.error('Błąd podczas tworzenia dialogu wklejania JSON:', error);
        showNotification('Wystąpił błąd podczas otwierania dialogu', 'error');
    }
}
