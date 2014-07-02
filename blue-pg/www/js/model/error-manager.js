var ERROR_CONNECTION_LOST = '8';

var onBTError = function(error){

    if(Logger != undefined)
        Logger.log(error.message);

    if(error.code == ERROR_CONNECTION_LOST){
        ConnectionState.set({
            connected: false
        });
    }
};
