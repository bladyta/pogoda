// Plik ui.js - funkcje do obsługi interfejsu użytkownika

// Funkcja wypełniająca tabelę danymi
function populateTable() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) {
        console.error('Nie znaleziono elementu z id "table-body"');
        return;
    }

    tableBody.innerHTML = '';
    const tempOptions = generateTempOptions();
    const conditionOptions = weatherConditions.map(cond =>
        `<option value="${cond.value}">${cond.description}</option>`
    ).join('');

    cities.forEach((city, index) => {
        const row = document.createElement('tr');
        if (kujawskoPomorskieCities.includes(city)) {
            row.classList.add('kujawsko-pomorskie');
        }
        const cityData = weatherData[city] || { tempDay: '0', tempNight: '0', conditionDay: "", conditionNight: "" };
        row.innerHTML = `
            <td>${index}</td>
            <td>${city}</td>
            <td><select class="weather-select" aria-label="Warunki w nocy dla ${city}"><option value="">Wybierz...</option>${conditionOptions}</select></td>
            <td><select class="temp-select" aria-label="Temperatura w nocy dla ${city}">${tempOptions}</select></td>
            <td><select class="weather-select" aria-label="Warunki w dzień dla ${city}"><option value="">Wybierz...</option>${conditionOptions}</select></td>
            <td><select class="temp-select" aria-label="Temperatura w dzień dla ${city}">${tempOptions}</select></td>
        `;
        tableBody.appendChild(row);

        // Ustawienie wartości w selectach z danych
        const selects = row.querySelectorAll('select');
        try {
            selects[0].value = cityData.conditionNight || "";
            selects[1].value = cityData.tempNight || "0";
            selects[2].value = cityData.conditionDay || "";
            selects[3].value = cityData.tempDay || "0";
        } catch (error) {
            console.error("Błąd podczas ustawiania wartości selectów:", error);
        }

        // Dodanie listenerów zdarzeń
        selects.forEach(select => {
            select.addEventListener('change', () => {
                try {
                    updateWeatherData();
                    updateMapOverlays();
                    saveToLocalStorage();
                } catch (error) {
                    console.error("Błąd podczas aktualizacji danych:", error);
                }
            });
        });
    });
    
    try {
        updateMapOverlays();
    } catch (error) {
        console.error("Błąd podczas aktualizacji nakładek mapy:", error);
    }
}

// Funkcja dodająca legendę do map
function createMapLegend() {
    try {
        // Legendy dla mapy dziennej i nocnej
        const legendsData = [
            { selector: '.day-map', title: 'Legenda - dzień', container: 'day-legend-container' },
            { selector: '.night-map', title: 'Legenda - noc', container: 'night-legend-container' }
        ];

        legendsData.forEach(legendData => {
            const mapContainer = document.querySelector(legendData.selector);
            if (!mapContainer) return;

            // Sprawdź, czy legenda już istnieje
            let legendContainer = document.getElementById(legendData.container);
            if (legendContainer) {
                legendContainer.innerHTML = ''; // Wyczyść istniejącą legendę
            } else {
                // Utwórz nowy kontener legendy
                legendContainer = document.createElement('div');
                legendContainer.id = legendData.container;
                legendContainer.className = 'map-legend';
                mapContainer.parentNode.appendChild(legendContainer);
            }

            // Nagłówek legendy
            const legendTitle = document.createElement('h4');
            legendTitle.textContent = legendData.title;
            legendContainer.appendChild(legendTitle);

            // Lista elementów legendy
            const legendList = document.createElement('ul');
            legendList.className = 'legend-list';
            legendContainer.appendChild(legendList);

            // Dodaj elementy legendy
            const isDay = legendData.selector === '.day-map';
            const iconMap = isDay ? weatherIconMap.day : weatherIconMap.night;

            // Wybierz kilka najważniejszych warunków do pokazania w legendzie
            const keyCodes = ["0", "2", "4", "10", "13", "20"];

            keyCodes.forEach(code => {
                const condition = weatherConditions.find(c => c.value === code);
                if (!condition) return;

                const listItem = document.createElement('li');
                listItem.className = 'legend-item';

                const icon = iconMap[code];
                const description = condition.description.split(' - ')[1];

                listItem.innerHTML = `<span class="legend-icon">${icon}</span> <span class="legend-text">${description}</span>`;
                legendList.appendChild(listItem);
            });
        });
    } catch (error) {
        console.error('Błąd podczas tworzenia legendy:', error);
    }
}