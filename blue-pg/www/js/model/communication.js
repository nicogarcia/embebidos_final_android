var LOGIN_CODE = '2',
    LOGGED_IN = '7',
    NOT_LOGGED_IN = '9',

    ERROR = '0',
    SUCCESS = '1',

    REQUEST_STATE = '6',
    LIGHT_DISABLED = '1',
    LIGHT_ENABLED = '2',
    LIGHT_OFF = '3',
    LIGHT_ON = '4',
    LOCKED_CLOSED = '5',
    LOCKED_OPENED = '6';


App.Model.Communication = Backbone.Model.extend({

    readBuffer: '',

    parsingFunctionsQueue: [],

    initialize: function(){
        this.parsingFunctionsQueue = new Array();
    },

    buildMessage: function(){
        var message = '$';
        var separator = '';
        for (var i = 0; i < arguments.length; i++) {
            message += separator + arguments[i];
            separator = '#';
        }
        message += '*';
        return message;
    },

    splitMessage: function(message){
        message = message.slice(1, message.length - 1);
        return message.split('#');
    },

    onDataRead: function(data){
        Communication.readBuffer += data;

        if(Communication.readBuffer.slice(-1) == '*') {
            Logger.log("Read: " + Communication.readBuffer);

            if(Communication.parsingFunctionsQueue.length == 0){
                Logger.log("Data recieved, but ignored.");
            }else{
                // Dequeue next parsing function
                var parsingFunction = Communication.parsingFunctionsQueue.shift();

                // Parse arguments
                var parameters = Communication.splitMessage(Communication.readBuffer);

                // Call parsing function
                parsingFunction(parameters);
            }

            Communication.readBuffer = '';
        }
    },

    startLogin: function(user){
        var message;
        message = this.buildMessage(LOGIN_CODE,user.get('username'), user.get('password'));

        var parsingFunction = function(parameters){
            if(parameters[0] == ERROR){
                Logger.log("Login Error");
            } else {
                UserView.onLogin(parameters[0] == SUCCESS);
            }
        };

        BTManager.send(message, parsingFunction);
    },

    getState: function(user){
        var message = this.buildMessage(REQUEST_STATE, user.get('username'));

        var parsingFunction = function(parameters){
            // TODO: Add error mgmt
            if(parameters[0] == SUCCESS){
                ControlState.set({
                    lock_opened: parameters[1] == LOCKED_OPENED,
                    light_on: parameters[2] == LIGHT_ON,
                    light_enabled: parameters[3] == LIGHT_ENABLED,
                    temperature: parameters[4],
                    humidity: parameters[5]
                });
            }
        };

        BTManager.send(message, parsingFunction);
    }
});