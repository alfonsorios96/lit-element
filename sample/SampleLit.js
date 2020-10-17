import {LitElement, html} from 'lit-element';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-button/vaadin-button.js';

class SampleLit extends LitElement {
    properties() {
        return {
            is_logged: Boolean,
            users: Array
        };
    }

    constructor() {
        super();
        this.is_logged = false;
        this.users = [];
    }

    render() {
        return html`
            <h2>Aló! Desde LitElement 2</h2>
            <p>Otra cosa</p>
            ${this.is_logged ? html`
                <h3>Bienvenido estimado usuario.</h3>
                <ul>
                    ${this.users.map(user => html`
                        <li>
                            ${user.username}
                            <button @click="${this.removeUser}" model-user="${JSON.stringify(user)}">Remove</button>
                            <button @click="${this.editUser}" .modelUser="${user}">Edit</button>
                        </li>  
                    `)}
                </ul>
                <vaadin-button @click="${this.logOut}">LogOut</vaadin-button>
            ` : html`
            <h3>Es una plataforma seria, inicia sesión o vete al diablo</h3>
            <vaadin-text-field id="username" label="Username"></vaadin-text-field>
            <vaadin-password-field id="password" label="Password"></vaadin-password-field>
            <vaadin-button @click="${this.logIn}">LogIn</vaadin-button>
`}
        `;
    }

    editUser(event) {
        const user = event.currentTarget.modelUser;
        debugger;
    }

    async removeUser(event) {
        let user = event.currentTarget.getAttribute('model-user');
        user = JSON.parse(user);

        this.users = this.users.filter(_user => user.username !== _user.username);
        await this.requestUpdate();

        /*
        * const userTemp = this.users.find(_user => _user.username === user.username)
        * this.users.splice(this.users.indexOf(userTemp), 1);
        * await this.requestUpdate();
        * */

        /*
        *  this.users = this.users.reduce((accumulator, iterator, index) => iterator.username !== user.username ? [...accumulator, iterator] : accumulator, []);
        * await this.requestUpdate();
        * */
    }

    async logOut() {
        this.is_logged = false;
        await this.requestUpdate();
    }

    async logIn() {
        const username_node = this.shadowRoot.querySelector('#username');
        const password_node = this.shadowRoot.querySelector('#password');

        const user = {
            username: username_node.value,
            password: password_node.value
        };
        if (await this.validateUser(user)) {
            alert('Joven, bienvenido.');
            this.is_logged = true;
            await this.requestUpdate();
        } else {
            alert('Joven, verifique los campos por favor.');
        }

        username_node.value = '';
        password_node.value = '';
    }

    async validateUser(user) {
        this.users = await (await fetch('http://localhost:3000/users')).json();
        await this.requestUpdate();
        if (user.username !== '' && user.password !== '') {
            return this.users.some(_user => _user.username === user.username && _user.password === user.password);
        } else {
            return false;
        }
    }
}

window.customElements.define('sample-lit', SampleLit);