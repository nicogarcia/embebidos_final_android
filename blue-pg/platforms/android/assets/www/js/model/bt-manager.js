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
            console.log("ERROR: %s", error);
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
            console.log("ERROR: %s", error);
        };

        window.bluetooth.disable(onSuccessWithState, onErrorWithState);
    },

    discover: function(onDeviceDiscover, onDiscoveryFinish, onDiscoveryError){
        BluetoothState.set({
            state: App.Model.BluetoothState.Busy
        });

        var onFinish = function(){
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            onDiscoveryFinish();
        };

        var onError = function(error){
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            onDiscoveryError(error);
        };

        window.bluetooth.startDiscovery(onDeviceDiscover,
            onFinish, onError);
    },

    connect: function(callback, address) {
        window.bluetooth.connect(callback, address);
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

    }
});

App.Collection.DeviceCollection = Backbone.Collection.extend({
    model: App.Model.Device
});
