App.Model.Logger = Backbone.Model.extend({
    log: function(data){
        this.set('text', this.get('text') + "<br>" + data);
        console.log(data);
    }
});
