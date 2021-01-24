import {LitElement, html} from "lit-element";

class HasChangedSample extends LitElement {
    static get properties() {
        return {
            _foo: {
                type: Array,
                /*
                  No se llama cada vez hay un cambio, de hecho, sólo se llamada cuando LitElement UPDATE sus propiedades.
                   this.foo = []; <--- Esto no genera un cambio real. Sino this.requestUpdate()
                */
                hasChanged(newValue, oldValue) {
                    return false; // true renderiza el cambio, si retorna false (falsy) no renderiza
                }
            }
        };
    }

    async set foo(newValue) {
        if(newValue !== this.foo) {
            this.requestUpdate('foo', 'oldValue').then(r => {
                // this.helper.toast.show('message');
                // this.logger.debug('The user [USER_NAME] changes foo property "oldValue" _> "newValue"');
            }).catch(e => {
                // TODO error message UI
            });

            /* ERROR */
            await this.requestUpdate();
        }
    }

    get foo() {
        return this._foo;
    }

    constructor() {
        super();

        console.log(this.foo); // Invoca al get foo()
        this.foo = []; // Invoca al set foo(newValue)
    }

    updated(_changedProperties) {
        super.updated(_changedProperties);
        if(_changedProperties.has('foo')) {
            //
        }

        if(_changedProperties.has('baz')) {
            //
        }

        if(_changedProperties.has('bar')) {
            //
        }
    }

    shouldUpdate(_changedProperties) {
        super.shouldUpdate(_changedProperties);
        if(_changedProperties.has('baz')) {
            return this.baz !== '';
        }
        return true;
    }

    render() {
        return html`
            <h2>Hello world!</h2>
            ${this.foo.map(baz => {
                return html`<p>${baz}</p>`
            })}
        `;
    }
}

window.customElements.define('my-app', HasChangedSample);
