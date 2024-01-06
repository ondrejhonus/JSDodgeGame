/* Skript pro přepínání okna do režimu celé obrazovky */
/* Zdroj: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API */

/* Po načtení okna vyvolat funkci startup */
window.addEventListener("load", startup, false);

/* Funkce nastavující zobrazení těla stránky v režimu celé obrazovky po stisku klávesy Enter */
function startup() {
  // Konstanta body odkazuje na element body (tělo stránky)
  const body = document.querySelector("body");

  // Po stisku klávesy Enter bude vyvolána funkce toggleFullScreen
  document.addEventListener("keypress", function(e) {
    if (e.key === 'Enter') {
      toggleFullScreen(body);
    }
  }, false);
}

/* Funkce pro přepínání zobrazení elementu v režimu celé obrazovky */
function toggleFullScreen(element) {
    // Jestliže dokument není v režimu celé obrazovky
    if (!document.fullscreenElement) {
      // přepne zadaný element do režimu celé obrazovky
      element.requestFullscreen();
    } else {
    // v opačném případě dojde k opuštění režimu celé obrazovky
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
