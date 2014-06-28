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
var Logger, LoggerView;
var BluetoothState;
var User, UserView;
var Communication;
var ControlState, ControlView;
var UserViewCollection;
var UserListView;
var Router;

var onBTError = function(error){
    console.log(error.message);
    if(Logger != undefined)
        Logger.log(error.message);
};

$(function() {
        Communication = new App.Model.Communication();

        // Create logger and its view
        Logger = new App.Model.Logger();
        LoggerView = new App.View.LoggerView({model: Logger});

        // Create user view
        UserView = new App.View.UserView();

        // Create Device Collection and its view
        DeviceCollection = new App.Collection.DeviceCollection();
        DeviceListView = new App.View.DeviceListView({collection: DeviceCollection});

        // Create connection view
        ConnectionView = new App.View.ConnectionView();

        // Control view
        ControlState = new App.Model.ControlState();
        ControlView = new App.View.ControlView({model: ControlState});

        UserViewCollection = new App.Collection.UserViewCollection();
        UserListView = new App.View.UserListView({collection: UserViewCollection});

        Router = new App.Router();

        // TODO: Debug. pushState should be true for native app
        Backbone.history.start({pushState: false});
    }
);

var onDeviceReady = function() {
    console.log("Device Ready!");

    // Create state and BTManager
    BluetoothState = new App.Model.BluetoothState({
        state: App.Model.BluetoothState.Busy
    });
    // Bind BluetoothState
    BluetoothState.on('change', ConnectionView.refreshBTState);
    BTManager = new App.Model.BTManager();

    ConnectionView.init();
};

$(document).on('deviceready', onDeviceReady);


// Include bluetooth plugin and initialize window.bluetooth object
window.bluetooth = cordova.require("cordova/plugin/bluetooth");

// Print start message.
console.log("**************");
console.log("SISAD started!");
