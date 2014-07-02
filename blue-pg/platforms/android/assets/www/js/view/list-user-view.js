

App.View.UserListItemView = Backbone.View.extend({
   template: '#user-item-template',

   events: {
       'click .btn-remove-user' :   'removeUser'
   },

   serialize: function(){
       return {
            username: this.model.get('username')
       };
   },

   removeUser: function(){
       Communication.removeUser(
           ControlState.get('user').get('username'),
           this.model.get('username')
       );
   }
});

App.Collection.UserViewCollection = Backbone.Collection.extend({
    model: App.View.UserListItemView
});

App.View.UserListView = Backbone.View.extend({
    template: '#user-list-template',

    events: {
        'click .btn-add-user'   :   'addUser'
    },

    views: {
        '': []
    },

    beforeRender: function() {
        this.collection.each(function(view) {
            this.insertView('.user-item-container', view);
        }, this);
        this.setView('.logger', LoggerView);
    },

    addUser: function(){
        Communication.addUser(
            ControlState.get('user').get('username'),
            new App.Model.User({
                username: $('.new-user .username').val(),
                password: $('.new-user .password').val()
            })
        );
    }

});
