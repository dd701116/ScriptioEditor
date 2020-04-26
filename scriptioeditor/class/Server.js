
const UserClass = require("./User.js");
const UserCollectionClass = require('./UserCollection.js');
const DocumentClass = require('./Document.js');

class Server {

    constructor() {
        this.users = new UserCollectionClass.UserCollection();
        this.usersRemoved = new UserCollectionClass.UserCollection();
        this.documents = new Array();
    }

    getUsersSize(){
        return this.users.length;
    }

    getRemovedUsersSize(){
        return this.usersRemoved.length;
    }

    createDocument(documentName,author){

        let doc = new DocumentClass.Document(documentName,author);

        this.documents.push(doc);

        //console.log(u);

        return doc;
    }

    renameDocument(documentUid, documentName,author){

        //  On recupere le document

        for (let i = 0; i<this.documents.length; i++){
            if (this.documents[i].uid == documentUid && this.documents[i].author.uid==author.uid){
                this.documents[i].name = documentName;
                return this.documents[i];
            }
        }

        return null;
    }

    createUser(user){

        let u = new UserClass.User(user.uid, user.username);

        this.users.push(u);

        //console.log(u);

        return u;
    }



    update(me,socket){
        //console.log("[UPDATE] start for : "+USERS.length+" user(s)");


        //  Liste des documents de l'utilisateur
        var userdoc = new Array();
        var shareddoc = new Array();
        var users = new Array();

        //  On recupere les doc qui lui appartient
        //  sinon : On recupere seulement les doc ou il est dans la whitelist (shared)
        for (let i = 0; i<this.documents.length; i++){
            if (this.documents[i].author.uid==me.uid){
                userdoc.push(this.documents[i]);
            }else if(this.documents[i].whitelist.find(u => u==me.uid)!==undefined){
                shareddoc.push(this.documents[i]);
            }
        }

        //  On recupere la liste des utilisateurs
        //  Connecte et deconnecte
        for (let i = 0; i<this.users.length; i++){

            let u = {
                uid: this.users[i].uid,
                username: this.users[i].username,
                connected: true
            };
            users.push(u);
        }
        for (let i = 0; i<this.usersRemoved.length; i++){

            let u = {
                uid: this.usersRemoved[i].uid,
                username: this.usersRemoved[i].username,
                connected: false
            };
            users.push(u);
        }


        socket.emit('onUpdate',{
            me: me,
            documents:userdoc,
            shared:shareddoc,
            members:users,
            date: new Date()
        });

        //console.log("[UPDATE] : end !");
    }

    stopUpdate(updateor){
        clearInterval(updateor);
    }

    removeUser(user){
        console.log("remove user "+user.uid);

        for (let i = 0; i<this.getUsersSize(); i++){

            console.log("try "+user.uid+" == "+this.users[i].uid+" : "+this.users[i].equals(user));

            if (this.users[i].equals(user)){
                console.log(user);


                this.usersRemoved.push(user);
                this.users.splice(i,1);

            }
        }
    }

    unRemoveUser(user){
        console.log("unRemove user "+user.uid);

        for (let i = 0; i<this.getRemovedUsersSize(); i++){

            console.log("try "+user.uid+" == "+this.usersRemoved[i].uid+" : "+this.usersRemoved[i].equals(user));

            if (this.usersRemoved[i].equals(user)){
                console.log(this.usersRemoved[i]);
                this.users.push(this.usersRemoved[i]);
                this.usersRemoved.splice(i,1);
            }
        }

        return user;
    }

}

module.exports.Server = Server;