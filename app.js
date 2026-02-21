// Plik app.js - główny plik aplikacji i inicjalizacja

// Funkcja wymuszająca odświeżenie strony
function forcePageRefresh() {
  if (confirm('Czy na pewno chcesz odświeżyć stronę? Niezapisane dane mogą zostać utracone.')) {
    // Najpierw wyczyść cache
    forceClearLocalStorage();
    
    // Poczekaj chwilę i odśwież stronę
    setTimeout(() => {
      window.location.reload(true); // true wymusza odświeżenie z serwera, nie z cache
    }, 500);
  }
}

// Funkcja sprawdzająca kompatybilność przeglądarki
function checkBrowserCompatibility() {
  try {
    // Sprawdź dostępność localStorage
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage nie jest dostępny w tej przeglądarce!');
      showNotification('Uwaga: Twoja przeglądarka może nie obsługiwać zapisywania danych lokalnie', 'warning');
      return false;
    }
    
    // Próba zapisania i odczytania testowej wartości
    localStorage.setItem('test', 'test');
    if (localStorage.getItem('test') !== 'test') {
      console.warn('localStorage nie działa poprawnie!');
      showNotification('Uwaga: Problem z zapisywaniem danych lokalnie', 'warning');
      return false;
    }
    localStorage.removeItem('test');
    
    return true;
  } catch (error) {
    console.error('Błąd podczas sprawdzania kompatybilności przeglądarki:', error);
    showNotification('Uwaga: Problem z dostępem do pamięci lokalnej przeglądarki', 'warning');
    return false;
  }
}

// Inicjalizacja – po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('Inicjalizacja aplikacji...');
    
    // Sprawdź kompatybilność przeglądarki
    const isCompatible = checkBrowserCompatibility();
    if (!isCompatible) {
      console.warn('Przeglądarka może nie obsługiwać wszystkich funkcji aplikacji');
    }
    
    // Wczytaj dane z localStorage
    loadFromLocalStorage();
    
    // Dodaj legendę do map
    createMapLegend();
    
    // Dodaj obsługę zdarzeń do przycisków
    const loadFileBtn = document.getElementById('loadFileBtn');
    if (loadFileBtn) {
      loadFileBtn.addEventListener('click', () => {
        const loadFileInput = document.getElementById('loadFileInput');
        if (loadFileInput) loadFileInput.click();
      });
    }
    
    const loadFileInput = document.getElementById('loadFileInput');
    if (loadFileInput) {
      loadFileInput.addEventListener('change', loadFile);
    }
    
    // Dodanie obsługi importu danych pogodowych
    const importWeatherBtn = document.getElementById('importWeatherBtn');
    if (importWeatherBtn) {
      importWeatherBtn.addEventListener('click', () => {
        const importWeatherInput = document.getElementById('importWeatherInput');
        if (importWeatherInput) importWeatherInput.click();
      });
    }
    
    const importWeatherInput = document.getElementById('importWeatherInput');
    if (importWeatherInput) {
      importWeatherInput.addEventListener('change', importWeatherData);
    }
    
    // Obsługa nowego przycisku wklejania JSON
    const pasteJSONBtn = document.getElementById('pasteJSONBtn');
    if (pasteJSONBtn) {
      pasteJSONBtn.addEventListener('click', handlePasteJSON);
    }
    
    const generateTxtBtn = document.getElementById('generateTxtBtn');
    if (generateTxtBtn) {
      generateTxtBtn.addEventListener('click', () => exportData('txt'));
    }
    
    const generateXMLBtn = document.getElementById('generateXMLBtn');
    if (generateXMLBtn) {
      generateXMLBtn.addEventListener('click', () => exportData('xml'));
    }
    
    const generateJSONBtn = document.getElementById('generateJSONBtn');
    if (generateJSONBtn) {
      generateJSONBtn.addEventListener('click', () => exportData('json'));
    }
    
    // Dodaj nowe przyciski, jeśli istnieją w HTML
    const exportAllBtn = document.getElementById('exportAllBtn');
    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', exportAllFormats);
    }
    
    const defaultValuesBtn = document.getElementById('defaultValuesBtn');
    if (defaultValuesBtn) {
      defaultValuesBtn.addEventListener('click', setDefaultValues);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetData);
    }
    
    // Obsługa przycisku do czyszczenia cache
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', forceClearLocalStorage);
    }
    
    // Obsługa przycisku wymuszającego odświeżenie
    const forceRefreshBtn = document.getElementById('forceRefreshBtn');
    if (forceRefreshBtn) {
      forceRefreshBtn.addEventListener('click', forcePageRefresh);
    }
    
    // Nasłuchuj zmiany rozmiaru okna
    window.addEventListener('resize', handleResize);
    
    console.log('Inicjalizacja aplikacji zakończona');
  } catch (error) {
    console.error('Błąd podczas inicjalizacji aplikacji:', error);
    showNotification('Wystąpił błąd podczas uruchamiania aplikacji', 'error');
  }
});