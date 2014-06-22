App.Model.Logger = Backbone.Model.extend({
    defaults: {
        text: "Logger:"
    },
    log: function(data){
        this.set('text', this.get('text') + "<br>" + data);
    },
    logbyte: function(data){
        this.set('text', this.get('text') + data);
    }
});
