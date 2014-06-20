App.View.DeviceView = Backbone.View.extend({
    template: '#item-template',

    events: {
        'click .btn-bt-connect':    'connect',
        'click .btn-bt-disconnect': 'disconnect',
        'click .btn-bt-send': 'send'
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

        self.$('.btn-bt-connect').button('loading');

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
                }
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
        window.bluetooth.write(function(){}, function(error){
            console.log(error.message);
        }, $(".send-text").val());
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

    refreshBTState: function(){
        var self = this;
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