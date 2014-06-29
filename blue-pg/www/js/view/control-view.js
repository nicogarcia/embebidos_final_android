App.View.ControlView = Backbone.View.extend({
    template: '#control-template',

    events: {
        'click .btn-refresh-state': 'refreshState',
        'click .btn-logout': 'logout',
        'switchChange.bootstrapSwitch .chk-lock-opened' : 'toggleLock',
        'switchChange.bootstrapSwitch .chk-light-enabled' : 'toggleLight'
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
        Communication.requestState(this.model.get('user').get('username'));
    },

    afterRender: function(){
        $(".chk-lock-opened").bootstrapSwitch('state', this.model.get('lock_opened'), true);

        $(".chk-light-enabled").bootstrapSwitch('state', this.model.get('light_enabled'), true);
    },

    logout: function(){
        Communication.logout(this.model.get('user'));
    },

    toggleLock: function(event, state) {
        Communication.toggleLock(ControlState.get('user').get('username'));
    },

    toggleLight: function(event, state) {
        Communication.toggleLight(ControlState.get('user').get('username'));
    }
});