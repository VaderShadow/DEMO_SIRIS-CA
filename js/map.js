// =========================================
// SIRIS-CA
// MAP MODULE
// =========================================

let map = null;
let layerManager = null;
// =========================================

function initMap() {

    console.log("Inicializando mapa SIRIS-CA...");

    const container = document.getElementById("map");

    if (!container) {

        console.warn("El contenedor #map todavía no existe.");

        return;

    }

    // Evita crear el mapa dos veces
    if (map !== null) {

        return;

    }

    map = L.map("map", {

        center: [14.5, -87],

        zoom: 5,

        zoomControl: true

    });

    layerManager = new LayerManager(map);

    // =============================
// MAPAS BASE
// =============================

const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:"© OpenStreetMap"
    }
);

const topo = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
        attribution:"© OpenTopoMap"
    }
);

const cartoDark = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
        attribution:"© CARTO"
    }
);

const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution:"© Esri"
    }
);

osm.addTo(map);

const baseMaps = {

    "OpenStreetMap": osm,

    "Satélite": satellite,

    "Topográfico": topo,

    "Modo Oscuro": cartoDark

};

L.control.layers(baseMaps).addTo(map);

    const countries = [

        {
            name: "Guatemala",
            lat: 15.7835,
            lng: -90.2308
        },

        {
            name: "Belice",
            lat: 17.1899,
            lng: -88.4976
        },

        {
            name: "El Salvador",
            lat: 13.7942,
            lng: -88.8965
        },

        {
            name: "Honduras",
            lat: 15.1999,
            lng: -86.2419
        },

        {
            name: "Nicaragua",
            lat: 12.8654,
            lng: -85.2072
        },

        {
            name: "Costa Rica",
            lat: 9.7489,
            lng: -83.7534
        },

        {
            name: "Panamá",
            lat: 8.538,
            lng: -80.7821
        }

    ];

    countries.forEach(country => {

        L.marker([country.lat, country.lng])

            .addTo(map)

            .bindPopup(

                "<b>" + country.name + "</b>"

            );

    });

    console.log("Mapa inicializado correctamente.");

}