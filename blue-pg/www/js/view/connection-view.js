App.View.DeviceView = Backbone.View.extend({
    template: '#item-template',

    events: {
        'click .btn-bt-connect':    'connect',
        'click .btn-bt-disconnect': 'disconnect',
        'click .btn-bt-send': 'send',
        'click .btn-bt-login': 'tologin'
    },

    initialize: function() {
        this.model.on('change', this.render, this);
    },

    serialize: function(){
        return {
            name: this.model.get('name'),
            isConnected: this.model.get('isConnected')
        };
    },

    connect: function() {
        var self = this;

        BluetoothState.set({
            state: App.Model.BluetoothState.Busy
        });
        $('.btn-bt-connect').button('loading');

        var onFail = function (error) {
            Logger.log("Connection failed! :( " + error.message);
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            self.$('.btn-bt-connect').button('reset');
        };

        var gotUuids = function (device) {
            var onConnection = function () {
                self.model.set({
                    isConnected: true
                });
                BluetoothState.set({
                    state: App.Model.BluetoothState.Ready
                });
                self.$('.btn-bt-connect').button('reset');
            };

            window.bluetooth.connect(onConnection, onFail, {
                uuid: device.uuids[0],
                address: self.model.get('address')
            });
        }

        window.bluetooth.getUuids(gotUuids, onFail, self.model.get('address'));
    },

    disconnect: function(){
        // TODO: This is left for debug purposes, it should be removed
        BTManager.disconnect(function(){});
    },

    send: function(){
        BTManager.send($(".send-text").val());
    },

    tologin: function(){
        gotologin();
    }
});

App.View.DeviceListView = Backbone.View.extend({
    initialize: function() {
        this.collection.on('reset add', this.render, this);
    },

    serialize: function() {
        var self = this;
        self.collection.each(function(device) {
            self.insertView(
                new App.View.DeviceView({ model: device }));
        }, this);
        return self.collection;
    }
});

App.View.ConnectionView = Backbone.View.extend({
    template: "#connection-template",

    init: function(){
        // Initialize on and off buttons
        var onEnable = function(){
            BTManager.enable();
        };

        var onDisable = function(){
            BTManager.disable();
        };

        $('#btn-bt-on').on('click', onEnable);
        $('#btn-bt-off').on('click', onDisable);

        // Initialize discovery button
        var onDiscover = function() {
            var onDiscoveryFinished = function () {
                BluetoothState.set({
                    state: App.Model.BluetoothState.Ready
                });
                $('#btn-bt-discover').button('reset');
            };
            var onDeviceDiscovered = function (device) {
                DeviceCollection.add(new App.Model.Device(device));
                console.log("Device discovered: " + device.name);
                // TODO: Move behaviour to BTManager
                if(device.name == BTDeviceName)
                    window.bluetooth.stopDiscovery(function(){
                        onDiscoveryFinished();
                    }, onBTError);
            };

            $('#btn-bt-discover').button('loading');

            DeviceCollection.reset();

            BluetoothState.set({
                state: App.Model.BluetoothState.Busy
            });

            BTManager.discover(onDeviceDiscovered, onDiscoveryFinished, onBTError);
        };
        $('#btn-bt-discover').on('click', onDiscover);

        // Bind BluetoothState
        BluetoothState.on('change', this.refreshBTState);

        var gotUuids = function(device){
            Logger.log("Got Uuids!");
            var onConnected = function(){
                Logger.log("Connected with Device!");
            };
            BTManager.connect(onConnected, device);
        };

        var onDevicesRetrived = function(devices){
            $.each(devices, function(i, device){
                if(device.name == BTDeviceName){
                    Logger.log("Device detected! Connecting...");
                    window.bluetooth.getUuids(gotUuids, onBTError, device.address);
                    return;
                }
            });
        };

        var onConnected = function(connected){
            if(connected){
                Logger.log("Connection detected.");
                BTManager.disconnect(function(){
                    Logger.log("Disconected.");

                    window.bluetooth.getPaired(onDevicesRetrived, onBTError);

                    gotologin();
                });
            }else{
                window.bluetooth.getPaired(onDevicesRetrived, onBTError);
                gotologin();
            }
        };
        window.bluetooth.isConnected(onConnected, onBTError);
    },

    refreshBTState: function(){
        switch(BluetoothState.get('state')) {
            case App.Model.BluetoothState.Off:
                $('#btn-bt-on').enable();
                $('#btn-bt-off').disable();
                $('#btn-bt-discover').disable();
                $('.btn-bt-connect').disable();
                $('.btn-bt-disconnect').disable();
                break;

            case App.Model.BluetoothState.Busy:
                $('#btn-bt-on').disable();
                $('#btn-bt-off').disable();
                $('#btn-bt-discover').disable();
                $('.btn-bt-connect').disable();
                $('.btn-bt-disconnect').disable();
                break;

            case App.Model.BluetoothState.Ready:
                $('#btn-bt-on').disable();
                $('#btn-bt-off').enable();
                $('#btn-bt-discover').enable();
                $('.btn-bt-connect').enable();
                $('.btn-bt-disconnect').enable();
                break;

            case App.Model.BluetoothState.Connected:
                $('#btn-bt-on').disable();
                $('#btn-bt-off').disable();
                $('#btn-bt-discover').disable();
                $('.btn-bt-connect').disable();
                $('.btn-bt-disconnect').enable();
                break;
        }
    },

    afterRender: function(){
        this.refreshBTState();
    }

});