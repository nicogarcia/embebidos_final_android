App.View.ControlView = Backbone.View.extend({
    template: '#control-template',

    events: {
        'click .btn-refresh-state': 'refreshState'
    },

    initialize: function(){
        this.model.on('change', this.render, this);
    },

    serialize: function(){
        return {
            user: this.model.get('user').toJSON(),
            lock_opened: this.model.get('lock_opened'),
            light_on: this.model.get('light_on'),
            light_enabled: this.model.get('light_enabled'),
            temperature: this.model.get('temperature'),
            humidity: this.model.get('humidity')
        };
    },

    refreshState: function(){
        Communication.getState(this.model.get('user'));
    }
});