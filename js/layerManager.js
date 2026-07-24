// ==========================================
// SIRIS-CA
// Layer Manager
// ==========================================

class LayerManager {

    constructor(map) {

        this.map = map;

        this.layers = {};

    }

    add(name, layer) {

        this.layers[name] = layer;

    }

    show(name) {

        if (!this.layers[name]) return;

        this.map.addLayer(this.layers[name]);

    }

    hide(name) {

        if (!this.layers[name]) return;

        this.map.removeLayer(this.layers[name]);

    }

    toggle(name) {

        if (!this.layers[name]) return;

        if (this.map.hasLayer(this.layers[name])) {

            this.hide(name);

        } else {

            this.show(name);

        }

    }

    get(name) {

        return this.layers[name];

    }

}