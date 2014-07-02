// TODO: PUT INTO BTCONN
var BTUuid;

App.Model.BTConnection = Backbone.Model.extend({
    events: {
        'bt-initial': 'getBTState',
        'bt-enabled': 'getConnectionState',
        'bt-disabled': 'enableBT',

        'bt-connected': 'manageConnection',
        'bt-not-connected': 'discoverDevice',

        'bt-discovered': 'getUuid',
        'bt-ready': 'btReady',

        'bt-connect': 'startConnection',
        'bt-verify-connection': 'verifyConnection'

    },

    initialize: function () {
        this.on('bt-initial', this.getBTState);

        this.on('bt-enabled', this.getConnectionState);
        this.on('bt-disabled', this.enableBT);

        this.on('bt-connected', this.manageConnection);
        this.on('bt-not-connected', this.discoverDevice);

        this.on('bt-discovered', this.getUuid);
        this.on('bt-ready', this.btReady);

        this.on('bt-connect', this.startConnection);
        this.on('bt-verify-connection', this.verifyConnection);
    },

    getBTState: function () {
        console.log('Getting BT state...');
        window.bluetooth.isEnabled(function (enabled) {
            if (enabled) {
                console.log('BT is enabled.');
                BTConnection.trigger('bt-enabled');
            } else {
                console.log('BT is disabled.');
                BTConnection.trigger('bt-disabled')
            }
        }, onBTError);
    },

    enableBT: function () {
        console.log('Enabling BT...');
        window.bluetooth.enable(function () {
            BTConnection.trigger('bt-initial');
        }, onBTError);
    },

    getConnectionState: function () {
        console.log('Getting connection state...');
        window.bluetooth.isConnected(function (connected) {
            if (connected) {
                console.log('Device connected!');
                BTConnection.trigger('bt-connected');
            } else {
                console.log('Device not connected.');
                BTConnection.trigger('bt-not-connected');
            }
        }, onBTError);
    },

    manageConnection: function () {
        console.log('Starting connection manager...');
        window.bluetooth.startConnectionManager(Communication.onDataRead, onBTError);

        // TODO: to be removed
        setTimeout(function () {
            console.log("Connection managed!");
            BTConnection.trigger('bt-ready');
        }, 500);
    },

    discoverDevice: function () {
        console.log('Discovering device...');
        window.bluetooth.startDiscovery(function (device) {
                if (device.name == BTDeviceName) {
                    console.log('Device discovered!');
                    BTConnection.trigger('bt-discovered');
                }
            },
            function () {
                console.log("Device not detected.");
            },
            onBTError
        );
    },

    getUuid: function () {
        console.log('Getting device UUID...');
        window.bluetooth.getUuids(function (device) {
            console.log('Got device UUID!');
            BTUuid = device.uuids[0];
            BTConnection.trigger('bt-connect');
        }, onBTError, BTHWAddress);
    },

    startConnection: function () {
        console.log("Trying to connect...");
        window.bluetooth.connect(function () {
            BTConnection.trigger('bt-verify-connection');
        }, onBTError, {
            address: BTHWAddress,
            uuid: BTUuid
        });
    },

    verifyConnection: function () {
        console.log("Verifying conection...");
        window.bluetooth.isConnected(function (connected) {
            if (connected) {
                console.log("Device connected!");
                BTConnection.trigger('bt-connected');
            } else {
                console.log("Connection failed. Retry manually.");
            }
        }, onBTError);
    },

    btReady: function(){
        ConnectionState.set({
            connected: true
        });
    }

    /*
     window.bluetooth.stopDiscovery(
     window.bluetooth.getUuids(function (device) {
     console.log("Got Uuids!");
     BTManager.connect(function () {
     console.log("Connected!");
     }, device);
     }, onBTError, device.address)
     , onBTError);*/
});