
var Identifier = {


     genuid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;


        var currentdate = new Date();
        var datetime = currentdate.getDate() + ""
            + currentdate.getHours() + ""
            + currentdate.getMinutes();


        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return datetime+result;
    }
}


module.exports.Identifier = Identifier;