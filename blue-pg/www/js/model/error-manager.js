var ERROR_CONNECTION_LOST = '6';

var onBTError = function(error){
    console.log(error.message);
    if(Logger != undefined)
        Logger.log(error.message);

    if(error.code == ERROR_CONNECTION_LOST){
        Router.navigate('login');
    }
};
