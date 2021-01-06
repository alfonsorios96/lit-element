import {LitElement, html, css} from "lit-element";
import '@polymer/paper-toast/paper-toast';

class ChatApp extends LitElement {

    static get styles() {
        return css`
          ul {
            list-style: none;
            word-wrap: break-word;
          }

          /* Pages */

          .pages {
            height: 100%;
            margin: 0;
            padding: 0;
            width: 100%;
          }

          .page {
            height: 100%;
            position: absolute;
            width: 100%;
          }

          /* Login Page */

          .login.page {
            background-color: #000;
          }

          .login.page .form {
            height: 100px;
            margin-top: -100px;
            position: absolute;

            text-align: center;
            top: 50%;
            width: 100%;
          }

          .login.page .form .usernameInput {
            background-color: transparent;
            border: none;
            border-bottom: 2px solid #fff;
            outline: none;
            padding-bottom: 15px;
            text-align: center;
            width: 400px;
          }

          .login.page .title {
            font-size: 200%;
          }

          .login.page .usernameInput {
            font-size: 200%;
            letter-spacing: 3px;
          }

          .login.page .title, .login.page .usernameInput {
            color: #fff;
            font-weight: 100;
          }

          /* Font */

          .messages {
            font-size: 150%;
          }

          .inputMessage {
            font-size: 100%;
          }

          .log {
            color: gray;
            font-size: 70%;
            margin: 5px;
            text-align: center;
          }

          /* Messages */

          .chatArea {
            height: 100%;
            padding-bottom: 60px;
          }

          .messages {
            height: 100%;
            margin: 0;
            overflow-y: scroll;
            padding: 10px 20px 10px 20px;
          }

          .message.typing .messageBody {
            color: gray;
          }

          .username {
            font-weight: 700;
            overflow: hidden;
            padding-right: 15px;
            text-align: right;
          }

          /* Input */

          .inputMessage {
            border: 10px solid #000;
            bottom: 0;
            height: 60px;
            left: 0;
            outline: none;
            padding-left: 10px;
            position: absolute;
            right: 0;
            width: 100%;
          }
        `;
    }

    static get properties() {
        return {
            username: {type: String},
            connected: {type: Boolean},
            typing: {type: Boolean},
            lastTypingTime: {type: Number},
            socket: {type: Object},
            chat: {type: Array}
        }
    }

    constructor() {
        super();

        // Prompt for setting a username
        this.username = '';
        this.connected = false;
        this.typing = false;
        this.lastTypingTime = 0;

        this.chat = [];

        // Declare and init constants

        this.TYPING_TIMER_LENGTH = 400; // ms
        this.COLORS = [
            '#e21400', '#91580f', '#f8a700', '#f78b00',
            '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
            '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
        ];
    }

    render() {
        return html`
            <ul class="pages">
                ${this.username !== '' ? html`
                    <li class="chat page">
                        <div class="chatArea">
                            <div class="messages">
                                ${this.chat.map(data => html`
                                    <p style="color: ${this.getUsernameColor(data.username)}">${data.username} :
                                        ${data.message}</p>
                                `)}
                            </div>
                        </div>
                        <input class="inputMessage" placeholder="Escribe aquí"/>
                    </li>
                ` : html`
                    <li class="login page">
                        <div class="form">
                            <h3 class="title">¿Cuál es tu nombre de usuario?</h3>
                            <input class="usernameInput" type="text" maxLength="14"/>
                        </div>
                    </li>
                `}

            </ul>
            <paper-toast id="toast"></paper-toast>
        `;
    }

    async firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);

        const response = await fetch('.env.json');
        const env = await response.json();
        this.socket = io.connect(env.SOCKET_URL, {forceNew: true});

        // Initialize variables
        this.$usernameInput = this.shadowRoot.querySelector('.usernameInput'); // Input for username

        // Keyboard events

        window.addEventListener('keydown', event => {
            // When the client hits ENTER on their keyboard
            if (event.keyCode === 13) {
                if (this.username !== '') {
                    this.sendMessage();
                    this.socket.emit('stop typing');
                    this.typing = false;
                } else {
                    this.setUsername();
                }
            }
        });

        // Socket events

        // Whenever the server emits 'login', log the login message
        this.socket.on('login', (data) => {
            this.connected = true;
            this.addParticipantsMessage(data);
        });

        // Whenever the server emits 'new message', update the chat body
        this.socket.on('new message', (data) => {
            this.addChatMessage(data);
            navigator.serviceWorker.getRegistration().then(registration => {
                registration.showNotification('Hello world!');
            });
        });

        // Whenever the server emits 'user joined', log it in the chat body
        this.socket.on('user joined', (data) => {
            this.log(data.username + ' se unió');
        });

        // Whenever the server emits 'user left', log it in the chat body
        this.socket.on('user left', (data) => {
            this.log(data.username + ' salió.');
            this.removeChatTyping(data);
        });

        // Whenever the server emits 'typing', show the typing message
        this.socket.on('typing', (data) => {
            this.addChatTyping(data);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        this.socket.on('stop typing', (data) => {
            this.removeChatTyping(data);
        });

        this.socket.on('disconnect', () => {
            this.log('Has sido desconectado');
        });

        this.socket.on('reconnect', () => {
            this.log('Has sido reconectado');
            if (this.username) {
                this.socket.emit('add user', this.username);
            }
        });

        this.socket.on('reconnect_error', () => {
            this.log('Hubo un error al intentar re-conectar');
        });
    }

    addParticipantsMessage(data) {
        let message = '';
        if (data.numUsers === 1) {
            message += "hay 1 participante";
        } else {
            message += "hay " + data.numUsers + " participantes";
        }
        this.log(message);
    }

    // Sets the client's username
    async setUsername() {
        this.username = this.$usernameInput.value.trim();
        await this.requestUpdate();

        // If the username is valid
        if (this.username) {

            // Tell the server your username
            this.socket.emit('add user', this.username);

            this.$inputMessage = this.shadowRoot.querySelector('.inputMessage'); // Input message input box

            this.$inputMessage.addEventListener('input', () => {
                this.updateTyping();
            });
        }
    }

    // Sends a chat message
    sendMessage() {
        let message = this.$inputMessage.value;
        // if there is a non-empty message and a socket connection
        if (message && this.connected) {
            this.$inputMessage.value = '';
            this.addChatMessage({
                username: this.username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            this.socket.emit('new message', message);
        }
    }

    // Log a message
    log(message, options) {
        const toast = this.shadowRoot.querySelector('#toast');
        toast.text = message;
        toast.open();
    }

    // Adds the visual chat message to the message list
    addChatMessage(data) {
        this.chat = [...this.chat, {
            username: data.username,
            message: data.message
        }];
    }

    // Adds the visual chat typing message
    addChatTyping(data) {
        data.typing = true;
        data.message = `está escribiendo...`;
        this.addChatMessage(data);
    }

    // Removes the visual chat typing message
    removeChatTyping() {
        this.chat = this.chat.filter(item => !item.message.includes('está escribiendo...'));
        this.requestUpdate();
    }

    // Updates the typing event
    updateTyping() {
        if (this.connected) {
            if (!this.typing) {
                this.typing = true;
                this.socket.emit('typing');
            }
            this.lastTypingTime = (new Date()).getTime();

            setTimeout(() => {
                const typingTimer = (new Date()).getTime();
                const timeDiff = typingTimer - this.lastTypingTime;
                if (timeDiff >= this.TYPING_TIMER_LENGTH && this.typing) {
                    this.socket.emit('stop typing');
                    this.typing = false;
                }
            }, this.TYPING_TIMER_LENGTH);
        }
    }

    // Gets the color of a username through our hash function
    getUsernameColor(username) {
        // Compute hash code
        let hash = 7;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        const index = Math.abs(hash % this.COLORS.length);
        return this.COLORS[index];
    }
}

window.customElements.define('chat-app', ChatApp);
