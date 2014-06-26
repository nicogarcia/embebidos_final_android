var BTDeviceName = 'H-C-2010-06-01';

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
        window.bluetooth.isEnabled(function(isEnabled) {
            BluetoothState.set({
                state: isEnabled ? App.Model.BluetoothState.Ready : App.Model.BluetoothState.Off
            });
        });
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
            window.bluetooth.startConnectionManager(Communication.onDataRead, onBTError);
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
            onDisconnected();
        };

        window.bluetooth.disconnect(onDisconnectedWithState);
    },

    send: function(data, parsingFunction){
        // Enqueue parsing function
        Communication.parsingFunctionsQueue.push(parsingFunction);

        window.bluetooth.write(function(){
            Logger.log("Sent: " + data);
        }, onBTError, data);
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
