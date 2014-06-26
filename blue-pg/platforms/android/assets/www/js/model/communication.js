var LOGIN_CODE = '2';
var LOGGED_IN = '7';
var NOT_LOGGED_IN = '9';
var ERROR = '0';
var SUCCESS = '1';

App.Model.Communication = Backbone.Model.extend({

    onError: function(error){
      console.log("Communication error: " + error.message);
    },

    startLogin: function(user){
        var message;

        message = '$' + LOGIN_CODE + '#' + user.get('username') + '#' + user.get('password') + '*';

        console.log("Message sent: " + message);

        var onConnectionLost = function () {
            self.model.set({
                isConnected: false
            });
            this.onError();
        };

        var onReadData = function(data){
            console.log(data);
            Logger.log(data);

            if(data.slice(-1) == '*') {
                window.bluetooth.stopConnectionManager();
                var parameter = data.slice(1, data.indexOf('#'));
                Logger.log(parameter);
                UserView.onLogin(parameter == SUCCESS);
            }
        };

        window.bluetooth.startConnectionManager(
            onReadData, onConnectionLost);

        BTManager.send(message);
    }
});