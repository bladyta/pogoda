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
                // W przypadku błędu, zainicjuj pustą tabelę
                populateTable();
            }
        } else {
            // Brak danych w localStorage, zainicjuj pustą tabelę
            populateTable();
        }
    } catch (error) {
        console.error('Błąd podczas wczytywania z localStorage:', error);
        // W przypadku błędu, zainicjuj pustą tabelę
        populateTable();
    }
}

// Funkcja do czyszczenia pamięci lokalnej
function clearLocalStorage() {
    try {
        if (confirm('Czy na pewno chcesz wyczyścić pamięć podręczną? Spowoduje to usunięcie zapisanych danych pogodowych.')) {
            localStorage.removeItem('weatherData');
            showNotification('Pamięć podręczna została wyczyszczona', 'info');
            
            // Wyczyść dane w aplikacji i zresetuj tabelę
            weatherData = {};
            populateTable();
        }
    } catch (error) {
        console.error('Błąd podczas czyszczenia pamięci lokalnej:', error);
        showNotification('Błąd podczas czyszczenia pamięci podręcznej', 'error');
    }
}

// Funkcja wczytująca plik
function loadFile(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        // Sprawdzenie rozszerzenia pliku
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'json' && fileExt !== 'txt') {
            showNotification('Obsługiwane są tylko pliki JSON i TXT', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const parsedData = JSON.parse(e.target.result);
                const validationResult = validateWeatherData(parsedData);

                if (validationResult.valid) {
                    weatherData = parsedData;
                    populateTable();
                    saveToLocalStorage();
                    showNotification('Plik wczytany pomyślnie', 'success');
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

// Poprawiona i zabezpieczona funkcja importująca dane pogodowe
function importWeatherData(event) {
    try {
        const file = event.target.files[0];
        if (!file) {
            showNotification('Nie wybrano pliku', 'warning');
            return;
        }

        // Zweryfikuj rozszerzenie i MIME typ pliku
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'json') {
            showNotification('Obsługiwane są tylko pliki JSON', 'error');
            return;
        }

        // Dla całkowitej pewności, że nie ma konfliktów z poprzednimi danymi
        forceClearLocalStorage();

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                let dataText = e.target.result;

                // Usuń BOM jeśli istnieje (problem z kodowaniem UTF-8 z BOM)
                if (dataText.charCodeAt(0) === 0xFEFF) {
                    dataText = dataText.slice(1);
                }

                // Sprawdź czy to prawidłowy JSON przed parsowaniem
                if (!dataText.trim().startsWith('[') && !dataText.trim().startsWith('{')) {
                    showNotification('Plik nie zawiera prawidłowego formatu JSON', 'error');
                    return;
                }

                // Wyświetl zawartość pliku dla celów diagnostycznych
                console.log('Zawartość pliku JSON:', dataText.substring(0, 200) + '...');

                const importedData = JSON.parse(dataText);
                console.log('Parsowanie JSON pomyślne, struktura:', JSON.stringify(importedData).substring(0, 100) + '...');

                // Sprawdź format danych
                if (!Array.isArray(importedData) || importedData.length === 0) {
                    showNotification('Nieprawidłowy format danych - oczekiwano tablicy', 'error');
                    return;
                }

                // Pobierz pierwszy element tablicy (zawierający dane miast)
                const cityData = importedData[0];
                console.log('Liczba miast w danych:', Object.keys(cityData).length);

                // Przygotuj nowy obiekt danych w formacie aplikacji
                const convertedData = {};
                let importedCities = 0;
                let skippedCities = 0;
                let errorCities = 0;

                // Przygotujemy mapowanie miast z aplikacji dla łatwiejszego odnajdywania
                const appCityMap = {};
                cities.forEach(city => {
                    // Klucz to uproszczona nazwa (bez polskich znaków, małe litery)
                    const simplifiedName = simplifyName(city);
                    appCityMap[simplifiedName] = city;
                });

                // Iteracja po miastach z pliku
                for (const city in cityData) {
                    try {
                        // Dane miasta z pliku
                        const data = cityData[city];

                        // Sprawdź czy dane miasta są dostępne
                        if (!data) {
                            console.warn(`Miasto ${city}: Brak danych`);
                            skippedCities++;
                            continue;
                        }

                        if (typeof data["10"] === 'undefined') {
                            console.warn(`Miasto ${city}: Brak wartości "10" (condition_night)`);
                            skippedCities++;
                            continue;
                        }

                        if (typeof data["1"] === 'undefined') {
                            console.warn(`Miasto ${city}: Brak wartości "1" (temp_night)`);
                            skippedCities++;
                            continue;
                        }

                        if (typeof data.DZIEN === 'undefined') {
                            console.warn(`Miasto ${city}: Brak wartości DZIEN`);
                            skippedCities++;
                            continue;
                        }

                        if (typeof data.max === 'undefined') {
                            console.warn(`Miasto ${city}: Brak wartości max`);
                            skippedCities++;
                            continue;
                        }

                        // Debugowanie: pokaż dane dla miasta
                        console.log(`Miasto ${city}:`, data);

                        // Pobierz znormalizowaną nazwę miasta
                        let normalizedCity = normalizeCity(city);
                        console.log(`  Znormalizowana nazwa: ${normalizedCity}`);

                        // Jeśli bezpośrednia normalizacja nie działa, spróbuj znaleźć przez uproszczoną nazwę
                        if (!cities.includes(normalizedCity)) {
                            const simplifiedImportCityName = simplifyName(city);
                            console.log(`  Uproszczona nazwa: ${simplifiedImportCityName}`);

                            if (appCityMap[simplifiedImportCityName]) {
                                normalizedCity = appCityMap[simplifiedImportCityName];
                                console.log(`  Znaleziono przez uproszczoną nazwę: ${normalizedCity}`);
                            } else {
                                // Ostatnia próba - sprawdź podobieństwo nazw
                                const foundCity = cities.find(c =>
                                    simplifyName(c).includes(simplifiedImportCityName) ||
                                    simplifiedImportCityName.includes(simplifyName(c))
                                );

                                if (foundCity) {
                                    normalizedCity = foundCity;
                                    console.log(`  Znaleziono przez podobieństwo: ${normalizedCity}`);
                                } else {
                                    console.warn(`  Nie znaleziono odpowiednika dla miasta: ${city}`);
                                    skippedCities++;
                                    continue;
                                }
                            }
                        }

                        // Obsługa specjalnych przypadków (np. DZIEN: "0/0")
                        let conditionDay = String(data.DZIEN || 0);
                        if (conditionDay.includes('/')) {
                            conditionDay = conditionDay.split('/')[0];
                            console.log(`  Skorygowano wartość DZIEN z "${data.DZIEN}" na "${conditionDay}"`);
                        }

                        // Obsługa wartości liczbowych i tekstowych 
                        const tempDay = typeof data.max === 'number' ? String(data.max) : String(data.max ?? "0");
                        const tempNight = typeof data["1"] === 'number' ? String(data["1"]) : String(data["1"] ?? "0");
                        const conditionNight = String(data["10"] ?? 0);

                        console.log(`  Konwersja wartości: tempDay=${tempDay}, tempNight=${tempNight}, conditionDay=${conditionDay}, conditionNight=${conditionNight}`);

                        // Przekształcenie danych do formatu aplikacji
                        convertedData[normalizedCity] = {
                            tempDay: tempDay,
                            tempNight: tempNight,
                            conditionDay: conditionDay,
                            conditionNight: conditionNight
                        };

                        importedCities++;
                    } catch (cityError) {
                        console.error(`Błąd przetwarzania miasta ${city}:`, cityError);
                        errorCities++;
                    }
                }

                // Jeśli nie zaimportowano żadnych danych, przywróć stare
                if (importedCities === 0) {
                    showNotification('Nie udało się zaimportować żadnych danych', 'error');
                    return;
                }

                // Podsumowanie działania
                console.log('Zaimportowano:', convertedData);
                console.log(`Statystyki importu: zaimportowano ${importedCities} miast, pominięto ${skippedCities} miast, błędy przy ${errorCities} miastach`);

                // Zapisz dane i zaktualizuj interfejs
                weatherData = convertedData;
                populateTable();

                // Zapisz w localStorage dopiero po pomyślnym zaimportowaniu
                try {
                    saveToLocalStorage();
                    console.log('Dane zapisane w localStorage');
                } catch (storageError) {
                    console.error('Błąd zapisywania w localStorage:', storageError);
                    showNotification('Dane zaimportowane, ale nie mogły zostać zapisane w pamięci podręcznej', 'warning');
                }

                // Pokaż podsumowanie importu
                const summary = `Zaimportowano ${importedCities} miast. Pominięto ${skippedCities} miast.`;
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

            // Walidacja danych przed eksportem
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
        // Format wymagany przez system zewnętrzny:
        // [
        //   {
        //     "Bydgoszcz": { "1": 1, "10": "4", "DZIEN": "10", "max": "3" }
        //   }
        // ]
        const output = [{}];

        Object.entries(data).forEach(([city, cityData]) => {
            const cityName = removePolishCharacters(city);
            output[0][cityName] = {
                "1": Number.isFinite(Number(cityData.tempNight)) ? Number(cityData.tempNight) : 0,
                "10": String(cityData.conditionNight ?? 0),
                "DZIEN": String(cityData.conditionDay ?? 0),
                "max": String(cityData.tempDay ?? 0)
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
        // Powiadomienie już zostało wyświetlone w funkcji exportData
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
        // Dane domyślne dla wszystkich miast
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
        // Stwórz dialog do wklejenia zawartości JSON
        const dialogContainer = document.createElement('div');
        dialogContainer.className = 'paste-dialog-container';
        dialogContainer.innerHTML = `
            <div class="paste-dialog">
                <h3>Wklej zawartość pliku JSON</h3>
                <p>Wklej poniżej zawartość pliku JSON:</p>
                <textarea id="json-paste-area" rows="10" placeholder='[{"Bydgoszcz":{"1":1,"10":"4","DZIEN":"10","max":"3"}}]'></textarea>
                <div class="dialog-buttons">
                    <button id="paste-json-cancel" class="interactive-element">Anuluj</button>
                    <button id="paste-json-confirm" class="interactive-element">Importuj</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialogContainer);

        // Ustaw focus na pole wklejania (żeby Ctrl+V działało od razu)
        const pasteArea = document.getElementById('json-paste-area');
        if (pasteArea) {
            setTimeout(() => pasteArea.focus(), 0);
        }

        // Obsługa przycisków
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
                // Najpierw wyczyść localStorage
                forceClearLocalStorage();
                
                // Przetwórz wklejony JSON
                let dataText = jsonText;
                
                // Usuń BOM jeśli istnieje (problem z kodowaniem UTF-8 z BOM)
                if (dataText.charCodeAt(0) === 0xFEFF) {
                    dataText = dataText.slice(1);
                }
                
                // Sprawdź czy to prawidłowy JSON
                if (!dataText.trim().startsWith('[') && !dataText.trim().startsWith('{')) {
                    showNotification('Zawartość nie jest prawidłowym formatem JSON', 'error');
                    return;
                }
                
                const importedData = JSON.parse(dataText);
                
                // Użyj tej samej logiki co w funkcji importWeatherData
                if (!Array.isArray(importedData) || importedData.length === 0) {
                    showNotification('Nieprawidłowy format danych - oczekiwano tablicy', 'error');
                    return;
                }
                
                // Pobierz pierwszy element tablicy
                const cityData = importedData[0];
                
                // Przygotuj nowy obiekt danych
                const convertedData = {};
                let importedCities = 0;
                let skippedCities = 0;
                
                // Mapowanie miast
                const appCityMap = {};
                cities.forEach(city => {
                    const simplifiedName = simplifyName(city);
                    appCityMap[simplifiedName] = city;
                });
                
                // Iteracja po miastach
                for (const city in cityData) {
                    const data = cityData[city];
                    
                    if (
                        !data ||
                        typeof data["10"] === 'undefined' ||
                        typeof data["1"] === 'undefined' ||
                        typeof data.DZIEN === 'undefined' ||
                        typeof data.max === 'undefined'
                    ) {
                        console.warn(`Pomijanie miasta: ${city} (brakujące dane pogodowe)`);
                        skippedCities++;
                        continue;
                    }
                    
                    let normalizedCity = normalizeCity(city);
                    
                    if (!cities.includes(normalizedCity)) {
                        const simplifiedImportCityName = simplifyName(city);
                        
                        if (appCityMap[simplifiedImportCityName]) {
                            normalizedCity = appCityMap[simplifiedImportCityName];
                        } else {
                            const foundCity = cities.find(c => 
                                simplifyName(c).includes(simplifiedImportCityName) || 
                                simplifiedImportCityName.includes(simplifyName(c))
                            );
                            
                            if (foundCity) {
                                normalizedCity = foundCity;
                            } else {
                                console.warn(`Pomijanie miasta: ${city} (nie znaleziono odpowiednika w aplikacji)`);
                                skippedCities++;
                                continue;
                            }
                        }
                    }
                    
                    let conditionDay = String(data.DZIEN || 0);
                    if (conditionDay.includes('/')) {
                        conditionDay = conditionDay.split('/')[0];
                    }
                    
                    convertedData[normalizedCity] = {
                        tempDay: String(data.max ?? 0),
                        tempNight: String(data["1"] ?? 0),
                        conditionDay: conditionDay,
                        conditionNight: String(data["10"] ?? 0)
                    };
                    
                    importedCities++;
                }
                
                if (importedCities === 0) {
                    showNotification('Nie udało się zaimportować żadnych danych', 'error');
                    return;
                }
                
                // Zapisz dane i zaktualizuj interfejs
                weatherData = convertedData;
                populateTable();
                saveToLocalStorage();
                
                // Pokaż podsumowanie
                const summary = `Zaimportowano ${importedCities} miast. Pominięto ${skippedCities} miast.`;
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