App.View.DeviceView = Backbone.View.extend({
    template: '#item-template',

    events: {
        'click .btn-bt-connect':    'connect',
        'click .btn-bt-disconnect': 'disconnect',
        'click .btn-bt-send': 'send',
        'click .btn-bt-login': 'gotologin'
    },

    initialize: function() {
        this.model.on('change', this.render, this);
        this.disconnect();
    },

    serialize: function(){
        return {
            name: this.model.get('name'),
            isConnected: this.model.get('isConnected')
        };
    },

    connect: function() {
        var self = this;

        $('.btn-bt-connect').button('loading');

        // If it was connected, disconnect
        var isConnected = function(connected){
            if(connected) {
                Logger.log("There's an opened connection.");
                window.bluetooth.disconnect(function () {
                }, function (error) {
                    Logger.log(error.message);
                });
            }
        };
        window.bluetooth.isConnected(isConnected, function(error){
            Logger.log(error.message);
        });

        var onFail = function (error) {
            Logger.log("Connection failed! :( "+  error.message);
            BluetoothState.set({
                state: App.Model.BluetoothState.Ready
            });
            self.$('.btn-bt-connect').button('reset');
        }

        var gotUuids = function (device) {
            var onConnection = function () {
                self.model.set({
                    isConnected: true
                });

                var onConnectionLost = function () {
                    self.model.set({
                        isConnected: false
                    });
                    onFail();
                };
                var onReadData = function(data){
                    console.log(JSON.stringify(data));
                    Logger.logbyte(data);
                };

                window.bluetooth.startConnectionManager(
                    onReadData, onConnectionLost);
            }

            window.bluetooth.connect(onConnection, onFail, {
                uuid: device.uuids[0],
                address: self.model.get('address')
            });
        }

        window.bluetooth.getUuids(gotUuids, onFail, self.model.get('address'));
    },

    disconnect: function(){
        BTManager.disconnect(function(){});
    },

    send: function(){
        BTManager.send($(".send-text").val());
    },

    gotologin: function(){
        UserView = new App.View.UserView();
        $('#page-container').empty().append(UserView.$el);
        UserView.render();
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
            console.log('disabling!');
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
                window.bluetooth.stopDiscovery(function(){}, function(error){});
                onDiscoveryFinished();
            };

            $('#btn-bt-discover').button('loading');

            DeviceCollection.reset();

            BTManager.discover(onDeviceDiscovered, onDiscoveryFinished, onDiscoveryFinished);
        };
        $('#btn-bt-discover').on('click', onDiscover);

        // Bind BluetoothState
        BluetoothState.on('change', this.refreshBTState);
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