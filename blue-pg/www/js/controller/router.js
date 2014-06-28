App.Router = Backbone.Router.extend({

    routes: {
        ''                  :   'connection',
        'login'             :   'login',
        'control/:username' :   'control',
        'users/:username'   :   'users'
    },

    connection: function(){
        // Append connection to the container and render
        ConnectionView.setView("#list-devices", DeviceListView);
        ConnectionView.setView(".logger", LoggerView);
        $('#page-container').empty().append(ConnectionView.$el);
        ConnectionView.render();
    },

    login: function(){
        UserView.setView('.logger', LoggerView);
        $('#page-container').empty().append(UserView.$el);
        UserView.render();
    },

    control: function(username){
        Communication.getState(username);
        ControlView.setView('.logger', LoggerView);
        $('#page-container').empty().append(ControlView.$el);
        ControlView.render();
    },

    users: function(username){
        Communication.requestUsers(username);

        $('#page-container').empty().append(UserListView.$el);
        UserListView.setView('.logger', LoggerView);
        UserListView.render();
    }
});