var LOGIN_CODE = '2';
App.Model.Communication = Backbone.Model.extend({

    login: function(user){
        var message = '$';

        message += LOGIN_CODE + '#' + user.get('username') + '#' + user.get('password');

        BTManager.send(message + '*');
        console.log("Message sent: %s", message);
        // TODO: Wait for response
    }
});