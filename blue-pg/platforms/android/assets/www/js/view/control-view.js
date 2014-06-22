App.View.ControlView = Backbone.Model.extend({
    template: '#control-template',

    serialize: function(){
        return {
            user: this.model.get('user'),
            temperature: this.model.get('temperature')
        };
    },

    afterRender: function(){
        $('')
    }
});