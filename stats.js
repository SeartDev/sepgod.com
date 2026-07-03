/* =========================================================================
 * STATS.JS: CLIENTE DE ESTADISTICAS (WebSocket push) PARA EL CANAL SEPGOD
 * Portado desde landing-page-v2 (StatsFunctions.ts) a JavaScript plano.
 *
 * StatsClient se suscribe al WebSocket push-only de estadisticas de una sala
 * e invoca onStats por cada frame que empuja el servidor (al conectar recibe
 * una instantanea inmediata, luego actualizaciones al conectar/desconectar
 * clientes, nuevos mensajes y un refresco periodico del servidor). A diferencia
 * de ChatClient/CursorClient nunca autentica: las estadisticas de sala son
 * publicas. La reconexion usa el mismo backoff exponencial que el cliente de
 * cursor.
 * ========================================================================= */
(function () {
    "use strict";

    var RECONNECT_BASE_MS = 500;
    var RECONNECT_MAX_MS = 30000;

    var roomPath = function (room) {
        return encodeURIComponent(room);
    };

    var roomStatsWSURL = function (wsBaseUrl, room) {
        var base = String(wsBaseUrl).replace(/\/ws\/?$/, "").replace(/\/$/, "");
        return base + "/rooms/" + roomPath(room) + "/stats-ws";
    };

    function StatsClient(room, wsBaseUrl, onStats) {
        this.ws = null;
        this.room = room;
        this.wsBaseUrl = wsBaseUrl;
        this.onStats = onStats;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.shouldReconnect = true;
        this.isConnecting = false;
    }

    StatsClient.prototype.connect = function () {
        this.shouldReconnect = true;
        this.reconnectAttempts = 0;
        this.openSocket();
    };

    StatsClient.prototype.openSocket = function () {
        var self = this;
        if (this.isConnecting) return;
        this.isConnecting = true;
        this.clearReconnectTimer();

        try {
            this.ws = new WebSocket(roomStatsWSURL(this.wsBaseUrl, this.room));
        } catch (e) {
            this.isConnecting = false;
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = function () {
            self.isConnecting = false;
            self.reconnectAttempts = 0;
        };

        this.ws.onmessage = function (event) {
            try {
                var stats = JSON.parse(event.data);
                self.onStats(stats);
            } catch (e) {
                console.error("Failed to parse stats update", event.data);
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

    StatsClient.prototype.scheduleReconnect = function () {
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

    StatsClient.prototype.clearReconnectTimer = function () {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    };

    StatsClient.prototype.disconnect = function () {
        this.shouldReconnect = false;
        this.clearReconnectTimer();
        if (this.ws) {
            this.ws.close();
        }
    };

    window.StatsClient = StatsClient;
})();
