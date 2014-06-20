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
    Model: {}
};

var BTManager;
var DeviceCollection;
var DeviceListView;
var ConnectionView;
var Logger;
var LoggerView;
var BluetoothState;
var User;

var onDeviceReady = function() {
    console.log("Device Ready!");

    // Create state and BTManager
    BluetoothState = new App.Model.BluetoothState({
        state: App.Model.BluetoothState.Busy
    });
    BTManager = new App.Model.BTManager();

    // Create logger and its view
    Logger = new App.Model.Logger();
    LoggerView = new App.View.LoggerView({model: Logger});

    // Create Device Collection and its view
    DeviceCollection = new App.Collection.DeviceCollection();
    DeviceListView = new App.View.DeviceListView({collection: DeviceCollection});

    // Create connection view
    ConnectionView = new App.View.ConnectionView();
    ConnectionView.setView("#list-devices", DeviceListView);
    ConnectionView.setView("#logger", LoggerView);

    // Append connection to the container and render
    ConnectionView.$el.appendTo('#page-container');
    ConnectionView.render();

    // Set jquery states and event bindings
    ConnectionView.init();

    // Log start message
    Logger.log("Started!");
};

$(document).on('deviceready', onDeviceReady);

// Include bluetooth plugin and initialize window.bluetooth object
window.bluetooth = cordova.require("cordova/plugin/bluetooth");

// Print start message.
console.log("*******************************************************************;");
console.log("SISAD started!");
