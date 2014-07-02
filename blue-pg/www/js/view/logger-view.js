
App.View.LoggerView = Backbone.View.extend({
    template: '#logger-template',

    initialize: function(){
        if(DebugMode) {
            this.model.set({
                text: "Logger:"
            });
            this.model.on('change', this.render, this);
            this.render();
        }
    },
    // Override this method to provide the right data to your template.
    serialize: function() {
        if(!DebugMode)
            return { data: '' }

        return {
            data: this.model.get('text')
        };
    }
});