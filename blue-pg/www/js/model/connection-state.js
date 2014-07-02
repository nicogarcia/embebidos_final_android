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
        this.on('change:loggedIn', this.loggedInChanged);
    },

    connectedChanged: function(){
        if(this.get('connected')) {
            ConnectionState.set({
                deviceDetected: true,
                connectionManaged: true,
                loggedIn: false
            }, {silent: true});

            if(window.localStorage.getItem('username') != null){
                console.log("User and pass retrieved!");

                UserView.savedLogin(
                    window.localStorage.getItem('username'),
                    window.localStorage.getItem('password')
                );
            }else{
                Router.navigate('login', true, true);
            }

        } else {
            ConnectionState.set({
                deviceDetected: false,
                connectionManaged: false,
                loggedIn: false
            }, {silent: true});
            Router.navigate('connection', true, true);
            Logger.log("Device disconnected.");
        }
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

            Communication.requestState(username);

            Router.navigate("control", true, true);
        } else{
            Logger.log("Logged Out.");

            window.localStorage.removeItem('username');
            window.localStorage.removeItem('password');

            Communication.clearQueues();

            clearInterval(this.get('ttlCallerId'));
            clearInterval(this.get('stateCallerId'));

            Router.navigate('login', true);
        }
    }
});
