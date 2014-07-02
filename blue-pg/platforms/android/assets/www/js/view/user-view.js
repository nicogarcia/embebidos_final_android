App.View.UserView = Backbone.View.extend({
    template: '#login-template',

    events: {
        'click .btn-login':    'login'
    },

    login: function(){
        this.model.set({
            username: $('.username').val(),
            password: $('.password').val()
        });

        if($('.chk-remember-user').prop('checked')){
            window.localStorage.setItem('username', this.model.get('username'));
            window.localStorage.setItem('password', this.model.get('password'));
        }

        Communication.login(this.model);
    },

    onLogin: function(loggedIn){
        if(loggedIn){
            ControlState.set({
                user: this.model.clone()
            });
            ConnectionState.set({
                loggedIn : true
            });
        }else {
            Logger.log("Login Error");
        }
    }
});