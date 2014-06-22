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
            console.log("ERROR: %s", error.message);
        };

        window.bluetooth.disable(onSuccessWithState, onErrorWithState);
    },

    discover: function(onDeviceDiscover, onDiscoveryFinish, onError){
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
            onError();
            Logger.log(error.message);
        };

        window.bluetooth.startDiscovery(onDeviceDiscover,
            onFinish, onErrorWithState);
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

    send: function(data){
        var onError = function(error){
            console.log(error.message);
        };
        window.bluetooth.write(function(){}, onError, data);
    }
});

App.Collection.DeviceCollection = Backbone.Collection.extend({
    model: App.Model.Device
});
