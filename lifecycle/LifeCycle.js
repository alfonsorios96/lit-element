import {LitElement} from 'lit-element';

/*
*
*  0. Solicitar el cambio de valor (this.myProp = '';)
*  1. Validar si tiene interceptor, si lo tiene se invoca el callback (Optional)
*  2. Nosotros lanzamos un this.requestUpdate() [ASYNC]
*  3. Se efectúa el cambio de valor.
*  4. Se renderiza el cambio de valor.
*
* */

class LifeCycle extends LitElement {

    static get properties() {
        return {
            myProp: {
                type: String,
                attribute: 'my-prop',
                hasChanged(newValue, oldValue) {
                    // 1
                    return newValue !== oldValue;
                }
            }
        };
    }

    // LitElement LifeCycle

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        // Consumo e inicialización de API Rest
    }

    // Se invoca cada vez que cualquier propiedad declarada CAMBIA de valor.
    async update(changedProperties) {
        // 3
        super.update(changedProperties);
        // This is a Map (Data Dictionary)
        // [[key, value], [key, value], [key, value], [key, value]]
        if (changedProperties.has('myProp')) {
            // TODO Sí cambió
            const _valueChanged = changedProperties.get('myProp');
            await this.requestUpdate() // 2
        }


        const obj = {
            key: 'value',
            number: 3
        };

        // Object.values(obj) => ['value', 3]
        // Object.keys(obj) => [key, number]
        // Object.entries(obj) => [[key, 'value'], [number, 3]]
    }

    render() {
        return super.render();
    }

    // WebComponents LifeCycle (extends HTMLElement)

    constructor() {
        super();
        this.myProp = '';
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    attributeChangedCallback(name, old, value) {
        super.attributeChangedCallback(name, old, value);
    }

    _onClick(event) {
        this.myProp = 'Otro valor'; // 0
    }
}

window.customElements.define('life-cycle', LifeCycle);
