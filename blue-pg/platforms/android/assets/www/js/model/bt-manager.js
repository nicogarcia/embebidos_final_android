var BTDeviceName = 'H-C-2010-06-01';
var BTHWAddress = '00:11:12:11:04:39';

App.Model.BluetoothState = Backbone.Model.extend({}, {
    Off:       1,
    Busy:      2,
    Ready:     3,
    Connected: 4
});

App.Model.Device = Backbone.Model.extend({
    defaults: {
        name:        'name',
        address:     'address',
        isConnected: false
    }
});

App.Model.BTManager = Backbone.Model.extend({

    waiting: false,

    initialize: function(){
        var self = this;
        window.bluetooth.isEnabled(function(isEnabled) {
            if(!isEnabled)
                self.enable();
        });
    },

    // TODO: REMOVE!
    tryConnection: function(){
        var onConnected = function(connected){
            if(connected){
                ConnectionState.set({
                    connected: true
                });
                BTManager.startConnectionManager();
            }else{
                var onDeviceDiscovered = function(device){
                    if(device.name == BTDeviceName){
                        ConnectionState.set({
                            deviceDetected: true
                        });
                        console.log(device.address);
                        window.bluetooth.stopDiscovery(
                            window.bluetooth.getUuids(function (device) {
                                console.log("Got Uuids!");
                                BTManager.connect(function () {
                                    console.log("Connected!");
                                }, device);
                            }, onBTError, device.address)
                            , onBTError);
                    }
                };
                var onDiscoveryFinish = function () {
                    if (!ConnectionState.get('deviceDetected')) {
                        console.log('Device not detected!');
                    }
                };

                console.log('Discovering device...');
                BTManager.discover(onDeviceDiscovered, onDiscoveryFinish);
            }
        };
        window.bluetooth.isConnected(onConnected, onBTError);
    },

    enable: function(){
        BluetoothState.set({
            state: App.Model.BluetoothState.Busy
        });

        var onSuccessWithState = function () {
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
        };

        var onErrorWithState = function (error) {
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            console.log("ERROR: %s", error.message);
        };

        window.bluetooth.enable(onSuccessWithState, onErrorWithState);
    },

    disable: function(){
        BluetoothState.set({
            state: App.Model.BluetoothState.Busy
        });

        var onSuccessWithState = function () {
            BluetoothState.set({
                state: App.Model.BluetoothState.Off
            });
        };

        var onErrorWithState = function (error) {
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            onBTError(error);
        };

        window.bluetooth.disable(onSuccessWithState, onErrorWithState);
    },

    discover: function(onDeviceDiscover, onDiscoveryFinish){
        BluetoothState.set({
            state: App.Model.BluetoothState.Busy
        });

        var onFinish = function(){
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            onDiscoveryFinish();
        };

        var onErrorWithState = function(error){
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            onBTError(error);
            onDiscoveryFinish();
        };

        window.bluetooth.startDiscovery(onDeviceDiscover,
            onFinish, onErrorWithState);
    },

    connect: function(onConnected, device){
        var self = this;
        var onConnectedProxy = function(){
            ConnectionState.set({
                connected: true
            });
            self.startConnectionManager();
            onConnected();
        };

        window.bluetooth.connect(onConnectedProxy, onBTError, {
            address: device.address,
            uuid: device.uuids[0]
        });
    },

    disconnect: function(onDisconnected) {
        BluetoothState.set({
            state: App.Model.BluetoothState.Busy
        });

        var onDisconnectedWithState = function(){
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            ConnectionState.set({
                connected: false,
                connectionManaged: false
            });
            onDisconnected();
        };

        window.bluetooth.disconnect(onDisconnectedWithState);
    },

    send: function(data){
        window.bluetooth.write(function () {
            if(data[1] != '6')
                Logger.log("Sent: " + data);
        }, onBTError, data);
    },

    startConnectionManager: function(){
        if(ConnectionState.get('connected')) {
            ConnectionState.set({
                connectionManaged: true
            });
            window.bluetooth.startConnectionManager(Communication.onDataRead, onBTError);
        }else{
            Logger.log('Device not connected. Cannot manage connection.');
        }
    },

    stopConnectionManager: function(callback){
        window.bluetooth.stopConnectionManager(
            function(){
                console.log("Connection stopped.");
                if(callback != undefined)
                    callback();
            }, onBTError);
    }
});

App.Collection.DeviceCollection = Backbone.Collection.extend({
    model: App.Model.Device
});
