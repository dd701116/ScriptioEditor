
const HtmlentitiesClass = require('../libs/Htmlentities.js');

class User {

    constructor(uid, username) {
        this.uid = uid;
        this.username = HtmlentitiesClass.Htmlentities.encode(username);

        this.created = new Date();

    }

    getUID(){
        return this.uid;
    }


    getCreated(){
        return this.created;
    }

    clone(){
        return new User(this.uid,this.username);
    }



    equals(user){
        return (user.uid == this.uid && user.username==this.username && user.created == this.created);
    }

    registerEquals(user){

        let uidCheck = user.uid == this.uid;
        let usernameCheck = HtmlentitiesClass.Htmlentities.encode(user.username)==this.username;

        console.log("[REGISTER_EQUALS] user 1 : ----------------------");
        console.log(user);
        console.log("[REGISTER_EQUALS] user 2 : ----------------------");
        console.log(this);

        console.log("[REGISTER_EQUALS] {\n uidCheck : "+uidCheck+"\n usernameCheck : "+usernameCheck);

        return ( uidCheck && usernameCheck );
    }

}

module.exports.User = User;