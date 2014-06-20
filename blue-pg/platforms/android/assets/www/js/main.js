
Backbone.Layout.configure({manage: true});

$.fn.extend({
	enable: function() {
		this.removeAttr('disabled');
	},
	disable: function() {
		this.attr('disabled', 'disabled');
	}
});

var App = {
    Controller: {},
    Collection: {},
    View: {},
    Model: {},
    Page: {}
};


var BTManager;
var DeviceCollection;
var DeviceListView;
var ConnectionView;
var Logger;
var LoggerView;
var BluetoothState;

var onDeviceReady = function() {
    console.log("Device Ready!");

    BluetoothState = new App.Model.BluetoothState({
        state: App.Model.BluetoothState.Busy
    });
    BTManager = new App.Model.BTManager();

    Logger = new App.Model.Logger();
    LoggerView = new App.View.LoggerView({model: Logger});

    DeviceCollection = new App.Collection.DeviceCollection();
    DeviceListView = new App.View.DeviceListView({collection: DeviceCollection});
    ConnectionView = new App.View.ConnectionView();
    ConnectionView.setView("#list-devices", DeviceListView);
    ConnectionView.setView("#logger", LoggerView);

    ConnectionView.$el.appendTo('#page-container');
    ConnectionView.render();
    var onEnable = function(){
        BTManager.enable();
    };

    var onDisable = function(){
        BTManager.disable();
        console.log('disabling!');
    };

    $('#btn-bt-on').on('click', onEnable);
    $('#btn-bt-off').on('click', onDisable);

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
            window.bluetooth.stopDiscovery(function(){
                Logger.log("Successfully Stopped!");
            }, function(error){});
            onDiscoveryFinished();
        };

        $('#btn-bt-discover').button('loading');

        DeviceCollection.reset();

        BTManager.discover(onDeviceDiscovered, onDiscoveryFinished,
            function (error) {
                console.log(error.message);
            });
    };
    $('#btn-bt-discover').on('click', onDiscover);


    $('.navbar-brand').on('click',function(){
        console.log($('#btn-bt-off').html());
        Logger.log("test!");
    });

	BluetoothState.on('change', ConnectionView.refreshBTState);

    Logger.log("Started!");

	window.bluetooth.isEnabled(function(isEnabled) {
		BluetoothState.set({
			state: isEnabled ? App.Model.BluetoothState.Ready : App.Model.BluetoothState.Off
		});
	});
};

$(document).on('deviceready', onDeviceReady);
window.bluetooth = cordova.require("cordova/plugin/bluetooth");
console.log("*******************************************************************;");
console.log("SISAD started!");
