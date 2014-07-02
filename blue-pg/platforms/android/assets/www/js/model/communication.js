var Response = {
    ERROR   : '0',
    SUCCESS : '1'
};

var RequestCode = {
    ADD_USER        : '0',
    CHANGE_PASSWORD : '1',
    LOGIN_CODE      : '2',
    LOGOUT          : '3',
    REFRESH_TTL     : '4',
    REMOVE_USER     : '5',
    REQUEST_STATE   : '6',
    REQUEST_USERS   : '7',
    TOGGLE_LIGHT    : '8',
    TOGGLE_LOCK     : '9'
};

var MessageParameters = {
    LIGHT_DISABLED          : '1',
    LIGHT_ENABLED           : '2',
    LIGHT_OFF               : '3',
    LIGHT_ON                : '4',
    LOCKED_CLOSED           : '5',
    LOCKED_OPENED           : '6',
    LOGGED_IN               : '7',
    LOGIN_TABLE_FULL        : '8',
    NOT_LOGGED_IN           : '9',
    UNAUTHORIZED            : '10',
    USER_ALREADY_EXISTS     : '11',
    USER_NOT_FOUND          : '12',
    USER_TABLE_FULL         : '13'
};

App.Model.Communication = Backbone.Model.extend({

    readBuffer: '',

    parsingFunctionsQueue: [],

    sentMessageQueue: [],

    /*
     MESSAGE PROCESSING UTILITIES
     */
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

            if(Communication.parsingFunctionsQueue.length == 0){
                Logger.log("Data recieved, but ignored.");
            }else{
                // Dequeue next parsing function
                var parsingFunction = Communication.parsingFunctionsQueue.shift();

                // Dequeue corresponding sent message
                Communication.sentMessageQueue.shift();

                // Parse arguments
                var parameters = Communication.splitMessage(message);

                if(parameters.length < 6)
                    Logger.log("Read: " + message);

                // Call parsing function
                setTimeout(function() {
                    parsingFunction(parameters)
                }, 10);

                if(Communication.sentMessageQueue.length > 0){
                    setTimeout(function(){
                            BTManager.send(Communication.sentMessageQueue[0])
                        }, 10
                    );
                }
            }

            Communication.readBuffer = Communication.readBuffer.slice(Communication.readBuffer.indexOf('*') + 1);
        }
    },

    send: function(data, parsingFunction){
        if(ConnectionState.get('connectionManaged')) {
            // Enqueue parsing and sending function
            this.parsingFunctionsQueue.push(parsingFunction);
            this.sentMessageQueue.push(data);

            if(DebugMode)
                $('#send_queue_lenght').html(this.sentMessageQueue.length);

            // If the only function in queue is the recently added, send data
            if (this.parsingFunctionsQueue.length == 1) {
                BTManager.send(data);
            }

        }else{
            Logger.log("Error sending data. Connection isn't managed.")
        }
    },

    clearQueues: function(){
        this.parsingFunctionsQueue.length = 0;
        this.sentMessageQueue.length = 0;
        Logger.log("Send and Recieve queues emptied.");
    },

    /*
     PROTOCOL METHODS
     */
    addUser: function(creator_username, new_user){
        var message = this.buildMessage(
            RequestCode.ADD_USER,
            creator_username,
            new_user.get('username'),
            new_user.get('password')
        );

        var parsingFunction = function(parameters){
            Communication.requestUsers(creator_username);
        };

        Communication.send(message, parsingFunction);
    },

    changePassword: function(username, new_password){
        var message = this.buildMessage(
            RequestCode.CHANGE_PASSWORD,
            username,
            new_password
        );

        var parsingFunction = function (parameters) {
            if(parameters[0] == Response.SUCCESS){
                Logger.log("Password changed successfully.");
            }
        };

        Communication.send(message, parsingFunction);
    },

    login: function(user){
        var message;
        message = this.buildMessage(
            RequestCode.LOGIN_CODE,
            user.get('username'),
            user.get('password')
        );

        var parsingFunction = function(parameters){
            if((parameters[0] == Response.ERROR) && (parameters[1] != MessageParameters.UNAUTHORIZED)){
                Logger.log("Login Error");
            } else {
                UserView.onLogin(true);
            }
        };

        Communication.send(message, parsingFunction);
    },

    logout: function(username){
        var message = this.buildMessage(
            RequestCode.LOGOUT,
            username
        );

        var parsingFunction = function(parameters){
            // TODO: Add error mgmt
            if(parameters[0] == Response.SUCCESS ||
                parameters[1] == MessageParameters.UNAUTHORIZED){
                UserView.model = new App.Model.User();

                Router.navigate('login', true);
            }
        };

        Communication.send(message, parsingFunction);
    },

    refreshTtl: function(username){
        var message = this.buildMessage(
            RequestCode.REFRESH_TTL,
            username
        );

        var parsingFunction = function (parameters) {
            if(parameters[0] == Response.ERROR){
                Logger.log("Error Refreshing TTL");
            }
        };

        Communication.send(message, parsingFunction);
    },

    removeUser: function(petitioner_username, target_username){
        var message = this.buildMessage(
            RequestCode.REMOVE_USER,
            petitioner_username,
            target_username
        );

        var parsingFunction = function (parameters) {
            Communication.requestUsers(petitioner_username);
        };

        Communication.send(message, parsingFunction);
    },

    requestState: function(username) {
        var message = this.buildMessage(
            RequestCode.REQUEST_STATE,
            username
        );

        var parsingFunction = function (parameters) {
            // TODO: Add error mgmt
            if (parameters[0] == Response.SUCCESS) {
                ControlState.set({
                    lock_opened: parameters[1] == MessageParameters.LOCKED_OPENED,
                    light_on: parameters[2] == MessageParameters.LIGHT_ON,
                    light_enabled: parameters[3] == MessageParameters.LIGHT_ENABLED,
                    temperature: parameters[4],
                    humidity: parameters[5]
                });
            }
        };

        Communication.send(message, parsingFunction);
    },

    requestUsers: function(username){
        if(username == undefined)
            Router.navigate('', true);

        var message = this.buildMessage(
            RequestCode.REQUEST_USERS,
            username
        );

        var parsingFunction = function(parameters){
            // TODO: Add error mgmt
            UserListView.collection.reset();
            if(parameters[0] == Response.SUCCESS){
                $.each(parameters.slice(2), function (i, parameter) {
                    UserListView.collection.add(new App.View.UserListItemView({
                            model: new App.Model.User({ username: parameter })
                        })
                    );
                });
                UserListView.render();
                Router.navigate('users', true);
            }
        };

        Communication.send(message, parsingFunction);
    },

    toggleLight: function(username){
        var message = this.buildMessage(
            RequestCode.TOGGLE_LIGHT,
            username
        );

        var parsingFunction = function (parameters) {
            if(parameters[0] == Response.SUCCESS){
                Logger.log('Light toggled Successfully');
            }
        };

        Communication.send(message, parsingFunction);
    },

    toggleLock: function(username){
        var message = this.buildMessage(
            RequestCode.TOGGLE_LOCK,
            username
        );

        var parsingFunction = function (parameters) {
            if(parameters[0] == Response.SUCCESS){
                Logger.log('Lock toggled Successfully');
            }
        };

        Communication.send(message, parsingFunction);
    }

});