// ========================================
// SIRIS-CA Dashboard Loader
// ========================================

async function loadComponent(containerId, componentPath) {

    try {

        const response = await fetch(componentPath);

        if (!response.ok) {

            throw new Error(`No se pudo cargar ${componentPath}`);

        }

        const html = await response.text();

        document.getElementById(containerId).innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

// ========================================

async function loadDashboard(){

    await loadComponent(
        "header-container",
        "../components/header.html"
    );

    await loadComponent(
        "metrics-container",
        "../components/metrics.html"
    );

    await loadComponent(
        "map-container",
        "../components/map-panel.html"
    );

    // Inicializar Leaflet
    initMap();

}
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();

});