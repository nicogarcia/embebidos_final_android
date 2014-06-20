
App.View.LoggerView = Backbone.View.extend({
    template: '#logger-template',

    initialize: function(){
        this.model.on('change', this.render, this);
        this.render();
    },
    // Override this method to provide the right data to your template.
    serialize: function() {
        return {
            data: this.model.get('text')
        };
    }
});