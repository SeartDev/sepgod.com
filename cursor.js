/* =========================================================================
 * CURSOR.JS: CLIENTE DE CURSORES REMOTOS (WebSocket) PARA EL CANAL SEPGOD
 * Portado desde landing-page-v2 (CursorFunctions.ts) a JavaScript plano.
 *
 * CursorClient abre el WebSocket de cursores de una sala, autentica con
 * {username, token} y emite cada actualizacion recibida a onUpdate. La forma
 * de una actualizacion es { username, x, y, left }. La reconexion usa backoff
 * exponencial.
 * ========================================================================= */
(function () {
    "use strict";

    var RECONNECT_BASE_MS = 500;
    var RECONNECT_MAX_MS = 30000;

    var roomPath = function (room) {
        return encodeURIComponent(room);
    };

    var roomCursorWSURL = function (wsBaseUrl, room) {
        var base = String(wsBaseUrl).replace(/\/ws\/?$/, "").replace(/\/$/, "");
        return base + "/rooms/" + roomPath(room) + "/cursor-ws";
    };

    function CursorClient(room, wsBaseUrl, user, onUpdate) {
        this.ws = null;
        this.room = room;
        this.wsBaseUrl = wsBaseUrl;
        this.user = user;
        this.onUpdate = onUpdate;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.shouldReconnect = true;
        this.isConnecting = false;
    }

    CursorClient.prototype.connect = function () {
        this.shouldReconnect = true;
        this.reconnectAttempts = 0;
        this.openSocket();
    };

    CursorClient.prototype.openSocket = function () {
        var self = this;
        if (this.isConnecting) return;
        this.isConnecting = true;
        this.clearReconnectTimer();

        try {
            this.ws = new WebSocket(roomCursorWSURL(this.wsBaseUrl, this.room));
        } catch (e) {
            this.isConnecting = false;
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = function () {
            self.isConnecting = false;
            self.reconnectAttempts = 0;
            if (self.ws) {
                self.ws.send(JSON.stringify({
                    username: self.user.username,
                    token: self.user.token
                }));
            }
        };

        this.ws.onmessage = function (event) {
            try {
                var update = JSON.parse(event.data);
                self.onUpdate(update);
            } catch (e) {
                console.error("Failed to parse cursor update", event.data);
            }
        };

        this.ws.onerror = function () {};

        this.ws.onclose = function () {
            self.isConnecting = false;
            if (self.shouldReconnect) {
                self.scheduleReconnect();
            }
        };
    };

    CursorClient.prototype.scheduleReconnect = function () {
        var self = this;
        if (!this.shouldReconnect) return;
        this.clearReconnectTimer();
        var attempt = Math.min(this.reconnectAttempts, 10);
        var delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, attempt));
        this.reconnectAttempts += 1;
        this.reconnectTimer = setTimeout(function () {
            self.openSocket();
        }, delay);
    };

    CursorClient.prototype.clearReconnectTimer = function () {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    };

    CursorClient.prototype.sendPosition = function (x, y) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ x: x, y: y, left: false }));
        }
    };

    CursorClient.prototype.sendLeave = function () {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ x: 0, y: 0, left: true }));
        }
    };

    CursorClient.prototype.disconnect = function () {
        this.shouldReconnect = false;
        this.clearReconnectTimer();
        if (this.ws) {
            this.ws.close();
        }
    };

    window.CursorClient = CursorClient;
})();
