App.Router = Backbone.Router.extend({

    routes: {
        ''                  :   'connection',
        'login'             :   'login',
        'control'           :   'control',
        'users'             :   'users'
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

    control: function(){
        if(ConnectionState.get('loggedIn')){
            //Communication.requestState(ControlState.get('user').get('username'));
            ControlView.setView('.logger', LoggerView);
            $('#page-container').empty().append(ControlView.$el);
            ControlView.render();
        } else {
            Router.navigate('');
        }
    },

    users: function(){
        UserListView.setView('.logger', LoggerView);
        $('#page-container').empty().append(UserListView.$el);
        UserListView.render();
    }
});