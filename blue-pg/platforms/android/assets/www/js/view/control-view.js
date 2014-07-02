App.View.ControlView = Backbone.View.extend({
    template: '#control-template',

    events: {
        'click .btn-show-users'         : 'showUsers',
        'switchChange.bootstrapSwitch .chk-lock-opened' : 'toggleLock',
        'switchChange.bootstrapSwitch .chk-light-enabled' : 'toggleLight'
    },

    initialize: function(){
        this.model.on('change', this.updateModel, this);
    },

    updateModel: function(){
        $(".chk-lock-opened").bootstrapSwitch('state', this.model.get('lock_opened'), true);

        $(".chk-light-enabled").bootstrapSwitch('state', this.model.get('light_enabled'), true);

        // Set light image
        if(this.model.get('light_on')){
            $("#light_on").show();
            $("#light_off").hide();
        } else {
            $("#light_on").hide();
            $("#light_off").show();
        }

        // Set temperature label
        $('#temperature_text').html(this.model.get('temperature'));

        // Set temperature image
        if(this.model.get('temperature') > 23){
            $("#temp_high").show();
            $("#temp_low").hide();
        } else {
            $("#temp_high").hide();
            $("#temp_low").show();
        }

        // Set humidity label
        $('#humidity_text').html(this.model.get('humidity'));

    },

    serialize: function(){
        return {
            user: ControlState.get('user').toJSON(),
            lock_opened: this.model.get('lock_opened'),
            light_on: this.model.get('light_on'),
            light_enabled: this.model.get('light_enabled'),
            temperature: this.model.get('temperature'),
            humidity: this.model.get('humidity')
        };
    },

    afterRender: function(){
        $(".chk-lock-opened").bootstrapSwitch('state', this.model.get('lock_opened'), true);

        $(".chk-light-enabled").bootstrapSwitch('state', this.model.get('light_enabled'), true);

        Router.addLoggedHeader(this.model.get('user').get('username'));
    },

    showUsers: function(){
        Communication.requestUsers(this.model.get('user').get('username'));
    },

    toggleLock: function(event, state) {
        Communication.toggleLock(ControlState.get('user').get('username'));
    },

    toggleLight: function(event, state) {
        Communication.toggleLight(ControlState.get('user').get('username'));
    }
});