App.View.UserView = Backbone.View.extend({
    template: '#login-template',

    events: {
        'click .btn-login':    'startLogin'
    },

    login: function(){
        this.model = new App.Model.User();
        this.model.set({
            username: $('.username').val(),
            password: $('.password').val()
        });
        Communication.startLogin(this.model);
    }
});