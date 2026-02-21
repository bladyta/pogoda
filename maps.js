// Plik maps.js - funkcje do obsługi map i nakładek

// Funkcja do obliczania responsywnego rozmiaru ikon
function getResponsiveIconSize() {
    // Bazując na szerokości okna, zwracamy różne rozmiary dla ikon
    const windowWidth = window.innerWidth;

    if (windowWidth < 480) {
        return { iconSize: "12px", weatherIconSize: "18px" };
    } else if (windowWidth < 768) {
        return { iconSize: "14px", weatherIconSize: "22px" };
    } else {
        return { iconSize: "16px", weatherIconSize: "26px" };
    }
}

// Funkcja aktualizująca nakładki na mapach
function updateMapOverlays() {
    const dayMap = document.querySelector('.day-map');
    const nightMap = document.querySelector('.night-map');

    if (!dayMap || !nightMap) {
        console.error('Nie znaleziono elementów map');
        return;
    }

    // Usunięcie istniejących nakładek
    dayMap.querySelectorAll('.city-overlay').forEach(el => el.remove());
    nightMap.querySelectorAll('.city-overlay').forEach(el => el.remove());

    const rows = document.querySelectorAll('#table-body tr');
    if (!rows.length) {
        console.warn("Brak wierszy w tabeli do aktualizacji nakładek mapy");
        return;
    }

    // Pobierz responsywne rozmiary
    const responsiveSizes = getResponsiveIconSize();

    rows.forEach(row => {
        try {
            if (!row || !row.cells || row.cells.length < 6) return;

            const city = row.cells[1].innerText;
            if (!city || excludeFromMap.includes(city)) return;

            const selectNight = row.cells[2].querySelector('select');
            const selectTempNight = row.cells[3].querySelector('select');
            const selectDay = row.cells[4].querySelector('select');
            const selectTempDay = row.cells[5].querySelector('select');

            if (!selectNight || !selectTempNight || !selectDay || !selectTempDay) return;

            const conditionNight = selectNight.value;
            const tempNight = selectTempNight.value;
            const conditionDay = selectDay.value;
            const tempDay = selectTempDay.value;

            // Używamy bezpośrednio wartości z tabeli, bez modyfikacji
            const displayTempDay = tempDay;
            const displayTempNight = tempNight;

            // Sprawdź, czy miasto ma pozycję na mapie
            const pos = cityPositions[city];
            if (!pos) return;

            // Mapa dzienna
            createCityOverlay(dayMap, city, pos, conditionDay, displayTempDay, 'day', responsiveSizes);

            // Mapa nocna
            createCityOverlay(nightMap, city, pos, conditionNight, displayTempNight, 'night', responsiveSizes);
        } catch (error) {
            console.error(`Błąd podczas tworzenia nakładki dla wiersza:`, error);
        }
    });
}

// Pomocnicza funkcja do tworzenia nakładek miast
function createCityOverlay(mapElement, city, position, condition, temperature, timeOfDay, sizes) {
    const overlay = document.createElement('div');
    overlay.className = 'city-overlay';
    overlay.style.top = position.top;
    overlay.style.left = position.left;

    // Wybór ikony
    const iconMap = timeOfDay === 'day' ? weatherIconMap.day : weatherIconMap.night;
    const icon = iconMap[condition] || "";

    overlay.innerHTML = `
        <div class="icon-wrapper" aria-hidden="true">${icon}</div>
        <div class="city-info">${city}: ${temperature}°C</div>
    `;
    overlay.style.fontWeight = "bold";
    overlay.style.fontSize = sizes.iconSize;

    const iconWrapper = overlay.querySelector('.icon-wrapper');
    if (iconWrapper) {
        iconWrapper.style.fontSize = sizes.weatherIconSize;
    }

    mapElement.appendChild(overlay);
}

// Funkcja reagująca na zmiany rozmiaru okna
function handleResize() {
    try {
        updateMapOverlays();
    } catch (error) {
        console.error('Błąd podczas obsługi zmiany rozmiaru okna:', error);
    }
}