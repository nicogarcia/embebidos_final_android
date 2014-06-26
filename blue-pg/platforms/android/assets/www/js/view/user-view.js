App.View.UserView = Backbone.View.extend({
    template: '#login-template',

    events: {
        'click .btn-login':    'login'
    },

    tryingLogin: false,

    login: function(){
        this.model = new App.Model.User();
        this.model.set({
            username: $('.username').val(),
            password: $('.password').val()
        });

        this.tryingLogin = true;

        Communication.startLogin(this.model);
    },

    onLogin: function(loggedIn){
        this.tryingLogin = false;

        if(loggedIn){
            ControlState = new App.Model.ControlState();
            this.model.set({
                connected: true
            });

            ControlState.set({
                user: this.model.clone()
            });
            ControlView = new App.View.ControlView({model: ControlState});

            console.log(JSON.stringify(ControlView.model.get('user')));

            $('#page-container').empty().append(ControlView.$el);
            ControlView.setView('.logger', LoggerView);
            ControlView.render();
        }else {
            Logger.log("Login Error");
        }
    },

    afterRender: function(){
        if(this.tryingLogin){
            $(".btn-login").disable();
        }else {
            $(".btn-login").enable();
        }
    }
});