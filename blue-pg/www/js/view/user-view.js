App.View.UserView = Backbone.View.extend({
    template: '#login-template',

    events: {
        'click .btn-login':    'login'
    },

    login: function(){
        this.model = new App.Model.User();
        this.model.set({
            username: $('.username').val(),
            password: $('.password').val()
        });

        Communication.login(this.model);
    },

    onLogin: function(loggedIn){

        if(loggedIn){
            this.model.set({
                connected: true
            });

            ControlState.set({
                user: this.model.clone()
            });
            Router.navigate("control/" + this.model.get('username'), true);
        }else {
            Logger.log("Login Error");
        }
    },

    afterRender: function(){
    }
});