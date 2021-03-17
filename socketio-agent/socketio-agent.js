module.exports = function(RED) {
    'use strict';

    function connect(uri, options) {
        return require('socket.io-client')(uri, options);
    }

    /* socket config */
    function SocketIOConfig(config) {
        RED.nodes.createNode(this, config);
        this.uri = config.uri;
        this.options = config.options;
        this.socket = connect(config.uri, JSON.parse(config.options || '{}'));
    }
    RED.nodes.registerType('socketio-config', SocketIOConfig);
   
    /* sckt listener*/
    function SocketIOListener(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        
        const server = RED.nodes.getNode(config.server);
        const socket = server.socket

        socket.on('connect', function() {
            node.status({ fill: 'green', shape: 'dot', text: 'connected' });
        });

        socket.on('disconnect', function () {
            node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
        });

        socket.on('connect_error', function(err) {
            node.status({ fill: 'red', shape: 'ring', text: 'error' });
        });

        socket.on(config.eventname, function (data) {
            node.send({ topic: config.eventname, payload: data });
        })

        node.on('close', function (done) {
            socket.disconnect();
            node.status({});
            done();
        });
    }
    RED.nodes.registerType('socketio-listener', SocketIOListener);

    /* sckt emitter*/
    function SocketIOEmitter(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const server = RED.nodes.getNode(config.server);
        
        const socket = server.socket

        socket.on('connect', function() {
            node.status({ fill: 'green', shape: 'dot', text: 'connected' });
        });

        socket.on('disconnect', function () {
            node.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
        });

        socket.on('connect_error', function(err) {
            node.status({ fill: 'red', shape: 'ring', text: 'error' });
        });

        node.on('input', function (msg) {
            const data = msg.payload 
                || (config.messageType == 'json' ? JSON.parse(config.message) : config.message)
            socket.emit(config.eventname, data);
        });

        node.on('close', function (done) {
            node.status({});
            done();
        });
    }
    RED.nodes.registerType('socketio-emitter', SocketIOEmitter);
};
