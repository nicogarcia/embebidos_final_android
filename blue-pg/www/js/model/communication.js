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
    LOCKED_OPENED = '6',

    LOGOUT = '3',

    REQUEST_USERS = '7',

    UNAUTHORIZED = '10',
    ADD_USER = '0',
    REMOVE_USER = '5';


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

        if(Communication.readBuffer.indexOf('*') != -1){
            var message = Communication.readBuffer.slice(0, Communication.readBuffer.indexOf('*') + 1);
            Logger.log("Read: " + message);

            if(Communication.parsingFunctionsQueue.length == 0){
                Logger.log("Data recieved, but ignored.");
            }else{
                // Dequeue next parsing function
                var parsingFunction = Communication.parsingFunctionsQueue.shift();

                // Parse arguments
                var parameters = Communication.splitMessage(message);

                // Call parsing function
                parsingFunction(parameters);
            }

            Communication.readBuffer = Communication.readBuffer.slice(Communication.readBuffer.indexOf('*') + 1);
        }
    },

    login: function(user){
        var message;
        message = this.buildMessage(
            LOGIN_CODE,
            user.get('username'),
            user.get('password')
        );

        var parsingFunction = function(parameters){
            if(parameters[0] == ERROR && parameters[1] != UNAUTHORIZED){
                Logger.log("Login Error");
            } else {
                UserView.onLogin(true);
            }
        };

        BTManager.send(message, parsingFunction);
    },

    getState: function(username) {
        var message = this.buildMessage(
            REQUEST_STATE,
            username
        );

        var parsingFunction = function (parameters) {
            // TODO: Add error mgmt
            if (parameters[0] == SUCCESS) {
                ControlState.set({
                    lock_opened: parameters[1] == LOCKED_OPENED,
                    light_on: parameters[2] == LIGHT_ON,
                    light_enabled: parameters[3] == LIGHT_ENABLED,
                    temperature: parameters[4],
                    humidity: parameters[5]
                });
            }
            ControlView.render();
        };

        BTManager.send(message, parsingFunction);
    },

    logout: function(user){
        var message = this.buildMessage(
            LOGOUT,
            user.get('username')
        );

        var parsingFunction = function(parameters){
            // TODO: Add error mgmt
            if(parameters[0] == SUCCESS){
                UserView.model = new App.Model.User();

                Router.navigate('login', true);
            }
        };

        BTManager.send(message, parsingFunction);
    },

    requestUsers: function(username){
        if(username == undefined)
            Router.navigate('', true);

        var message = this.buildMessage(REQUEST_USERS, username);

        var parsingFunction = function(parameters){
            // TODO: Add error mgmt
            if(parameters[0] == SUCCESS){
                UserListView.collection.reset();
                $.each(parameters.slice(2), function (i, parameter) {
                    UserListView.collection.add(new App.View.UserListItemView({
                            model: new App.Model.User({ username: parameter })
                        })
                    );
                });
                UserListView.render();
            }
        };

        BTManager.send(message, parsingFunction);
    },

    addUser: function(creator_username, new_user){
        var message = this.buildMessage(
            ADD_USER,
            creator_username,
            new_user.get('username'),
            new_user.get('password')
        );

        var parsingFunction = function(parameters){
            Communication.requestUsers(creator_username);
        };

        BTManager.send(message, parsingFunction);
    },

    removeUser: function(petitioner_username, target_username){
        var message = this.buildMessage(
            REMOVE_USER,
            petitioner_username,
            target_username
        );

        var parsingFunction = function (parameters) {
            Communication.requestUsers(petitioner_username);
        };

        BTManager.send(message, parsingFunction);
    }
});