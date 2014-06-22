App.View.ControlView = Backbone.View.extend({
    template: '#control-template',

    serialize: function(){
        Logger.log(JSON.stringify(this.model.get('user')));
        return {
            user: this.model.get('user').toJSON(),
            temperature: this.model.get('temperature')
        };
    },

    afterRender: function(){
    }
});