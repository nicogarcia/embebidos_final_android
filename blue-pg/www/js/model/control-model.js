App.Model.ControlState = Backbone.Model.extend({
    defaults: {
        user: {},
        lock_opened: false,
        light_on: false,
        light_enabled: false,
        temperature: 'N/A',
        humidity: 'N/A'
    }
});