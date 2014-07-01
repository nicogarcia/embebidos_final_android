var STATE_REQUEST_INTERVAL = 1000;
var TTL_REFRESH_INTERVAL = 30000;

App.Model.ConnectionState = Backbone.Model.extend({
    deviceDetected: false,
    connected: false,
    connectionManaged: false,
    loggedIn: false,

    ttlCallerId: '',
    stateCallerId: '',

    initialize: function(){
        this.on('change:connected', this.connectedChanged);
        this.on('change:connectionManaged', this.connectionManagedChanged);
        this.on('change:deviceDetected', this.deviceDetectedChanged);
        this.on('change:loggedIn', this.loggedInChanged);
    },

    connectedChanged: function(){
        if(this.get('connected')) {
            Logger.log("Connected with Device!");
        } else {
            Logger.log("Device disconnected.");
        }
    },

    connectionManagedChanged: function(){
        Logger.log("Connection Managed!");
        Router.navigate('login', true);
    },

    deviceDetectedChanged: function(){
        Logger.log('Device detected. Connecting...');
    },

    loggedInChanged: function(){
        if(this.get('loggedIn')){
            Logger.log("Logged In.");
            var username = ControlState.get('user').get('username');

            // Initialize ttl refreshing interval
            this.set({
                ttlCallerId : setInterval(function(){
                    Communication.refreshTtl(username)
                }, TTL_REFRESH_INTERVAL)
            });

            // Initialize state refreshing interval
            this.set({
                stateCallerId : setInterval(function() {
                    Communication.requestState(username)
                }, STATE_REQUEST_INTERVAL)
            });

            Router.navigate("control", true);
        } else{
            Logger.log("Logged Out.");

            clearInterval(this.get('ttlCallerId'));
            clearInterval(this.get('stateCallerId'));

            Router.navigate('login', true);
        }
    }
});
