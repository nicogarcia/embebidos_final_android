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

    text: '',
    
    log: function(data){
        this.text += data + '<br>';
        $('#well-logger').html(this.text);

        data.replace('<br>', '');
        console.log(data);
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
        BTConnection.text = '';
        BTConnection.log('Getting BT state...');
        window.bluetooth.isEnabled(function (enabled) {
            if (enabled) {
                BTConnection.log('BT is enabled.');
                BTConnection.trigger('bt-enabled');
            } else {
                BTConnection.log('BT is disabled.');
                BTConnection.trigger('bt-disabled')
            }
        }, onBTError);
    },

    enableBT: function () {
        BTConnection.log('Enabling BT...');
        window.bluetooth.enable(function () {
            BTConnection.trigger('bt-initial');
        }, onBTError);
    },

    getConnectionState: function () {
        BTConnection.log('Getting connection state...');
        window.bluetooth.isConnected(function (connected) {
            if (connected) {
                BTConnection.log('Device connected!');
                BTConnection.trigger('bt-connected');
            } else {
                BTConnection.log('Device not connected.');
                BTConnection.trigger('bt-not-connected');
            }
        }, onBTError);
    },

    manageConnection: function () {
        BTConnection.log('Starting connection manager...');
        window.bluetooth.startConnectionManager(Communication.onDataRead, onBTError);

        // TODO: to be removed
        setTimeout(function () {
            BTConnection.log("Connection managed!");
            BTConnection.trigger('bt-ready');
        }, 50);
    },

    discoverDevice: function () {
        BTConnection.log('Discovering device...');
        window.bluetooth.startDiscovery(function (device) {
                if (device.name == BTDeviceName) {
                    BTConnection.log('Device discovered!');
                    BTConnection.trigger('bt-discovered');
                }
            },
            function () {
                BTConnection.log("Device not detected.");
            },
            onBTError
        );
    },

    getUuid: function () {
        BTConnection.log('Getting device UUID...');
        window.bluetooth.getUuids(function (device) {
            BTConnection.log('Got device UUID!');
            BTUuid = device.uuids[0];
            BTConnection.trigger('bt-connect');
        }, onBTError, BTHWAddress);
    },

    startConnection: function () {
        BTConnection.log("Trying to connect...");
        window.bluetooth.connect(function () {
            BTConnection.trigger('bt-verify-connection');
        }, onBTError, {
            address: BTHWAddress,
            uuid: BTUuid
        });
    },

    verifyConnection: function () {
        BTConnection.log("Verifying conection...");
        window.bluetooth.isConnected(function (connected) {
            if (connected) {
                BTConnection.log("Device connected!");
                BTConnection.trigger('bt-connected');
            } else {
                BTConnection.log("Connection failed. Retry manually.");
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
     BTConnection.log("Got Uuids!");
     BTManager.connect(function () {
     BTConnection.log("Connected!");
     }, device);
     }, onBTError, device.address)
     , onBTError);*/
});