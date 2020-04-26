const UserClass = require('./User.js');
const UserCollectionClass = require('./UserCollection.js');
const HtmlentitiesClass = require('../libs/Htmlentities.js');
const ServerClass = require('./Server.js');
const FS = require('fs');


class MySocketAdaptor {

    /**
     * ON CREE LA SOCKET ADAPTOR
     * Elle va nous permettre de controller la socket original en se basant sur nos protocole
     * @param socket
     * @param server
     */
    constructor(socket, server) {
        this.socket = socket;
        this.me = null;
        this.updator = null;
        this.server = server;

        //  calibrage
        let x = new Date("2020-04-11T00:00:00");
        let y = new Date("2020-04-11T00:00:01");
        let uneSeconde = (y-x);


    }

    /**
     *  ENREGISTRE UN UTILISATEUR SUR LE SERVEUR
     *  Si l'utilisateur a un compte, il le recupere dans les utilisateurs supprime
     *  Sinon il le recree
     *  Tout les utilisateus sont abonne au channel par defaut
     * @param user
     */
    register(user){


        console.log("[REGISTER] - START for user :");
        console.log(user);

        //  On regarde si il a deja un compte
        if (this.server.usersRemoved.find(u => u.uid==user.uid)!=undefined){

            console.log("[REGISTER] - Find : user "+user.uid+" is removed ? YES");

            for (let i = 0; i < this.server.getRemovedUsersSize(); i++){
                if (this.server.usersRemoved[i].registerEquals(user)){

                    this.me = this.server.unRemoveUser(this.server.usersRemoved[i]);

                }else{
                    //  On refuse la connection
                    this.me = null;
                }

            }
        }else{
            console.log("[REGISTER] - Find : user "+user.uid+" is removed ? NO");
            this.me = this.server.createUser(user);

            //  On cree son dossier

            this.me._path = "/documents/"+this.me.uid+"/";

            //  On cree le dossier
            FS.mkdirSync(process.cwd()+this.me._path,{},(error)=>{
                if (error)
                    console.log("ERROR DOCUMENT");
            });
        }

        console.log("[REGISTER] - CONTINUE with user :");
        console.log(this.me);


        if (this.me!=null){



            //  On cree l'updator
            var server = this.server;
            var me = this.me;
            var socket = this.socket;

            //  On enregistre l'updator
            this.updator = setInterval(function () {
                server.update(me, socket);
            }, 1000);

            this.socket.emit("onUserRegisterResponse",true);
            console.log("[REGISTER] - Registration : user "+user.uid+" SUCCESS");

        }else{
            console.log("[REGISTER] - Registration : user "+user.uid+" FAILED");
            this.socket.emit("onUserRegisterResponse",false);
        }
    }



    create(client, mdocument){


        if (client.uid==this.me.uid){
            let result = this.server.createDocument(mdocument.name, this.me.clone());

            this.socket.emit("onCreateNewDocumentResponse",result);

            console.log("[DOCUMENT] - Create : "+mdocument.name+" SUCCESS");
            console.log(result);
            console.log("------------------------------------------------\n");
        }else{
            this.socket.emit("onCreateNewDocumentResponse",false);
            console.log("[DOCUMENT] - Create : "+mdocument.name+" FAIL");
        }
    }

    rename(client, mdocument){


        if (client.uid==this.me.uid){
            let result = this.server.renameDocument(mdocument.uid, mdocument.name, this.me.clone());



            if (result==null){
                console.log("[DOCUMENT] - Rename : "+mdocument.name+" FAIL");
                this.socket.emit("onRenameDocumentResponse",false);
            }else{
                console.log("[DOCUMENT] - Rename : "+mdocument.name+" SUCCESS");
                this.socket.emit("onRenameDocumentResponse",result);
            }

            console.log(result);
            console.log("------------------------------------------------\n");
        }else{
            this.socket.emit("onRenameDocumentResponse",false);
            console.log("[DOCUMENT] - Rename : "+mdocument.name+" FAIL");
        }
    }

    open(client, mdocument){


        if (client.uid==this.me.uid){

            let result;


            this.server.documents.forEach(doc=>{
                if (doc.uid == mdocument.uid){
                    result = doc;
                }
            });

            if (result!=null){

                let latest = result.latest();

                let content = latest.content();

                let response = {
                  document:result,
                  content:content
                };

                this.socket.emit("onOpenDocumentResponse",response);

                console.log("[DOCUMENT] - Open : "+mdocument.name+" SUCCESS");
            }else{
                this.socket.emit("onOpenDocumentResponse",false);
                console.log("[DOCUMENT] - Open : "+mdocument.name+" FAIL");
            }


            console.log(result);
            console.log("------------------------------------------------\n");
        }else{
            this.socket.emit("onOpenDocumentResponse",false);
            console.log("[DOCUMENT] - Open : "+mdocument.name+" FAIL");
        }
    }

    saveUpdate(client, mdocument, content){


        if (client.uid==this.me.uid){

            let result;


            this.server.documents.forEach(doc=>{
                if (doc.uid == mdocument.uid){
                    result = doc;
                }
            });

            if (result!=null){

                result.update(content).then(latest=>{

                    console.log("OK UPDATE")

                    let contentUpdate = latest.content();

                    this.socket.emit("onDocumentSaveUpdateResponse",{
                        status:true,
                        content:contentUpdate
                    });
                });



                //console.log("[DOCUMENT] - SaveUpdate : "+mdocument.uid+" SUCCESS");
            }else{
                this.socket.emit("onDocumentSaveUpdateResponse",{status:false});
                console.log("[DOCUMENT] - SaveUpdate : "+mdocument.uid+" FAIL[find document]");
            }

            //console.log(result);
            console.log("------------------------------------------------\n");
        }else{
            this.socket.emit("onDocumentSaveUpdateResponse",{status:false});
            console.log("[DOCUMENT] - SaveUpdate : "+mdocument.uid+" FAIL[uid]");
        }
    }

    invite(client, mdocument, invited){


        if (client.uid==this.me.uid){

            let result;


            this.server.documents.forEach(doc=>{
                if (doc.uid == mdocument.uid){
                    result = doc;
                }
            });

            if (result!=null){

                invited.forEach(inv=>{
                    if (result.whitelist.find(u => u==inv)==undefined){
                        result.whitelist.push(inv);
                    }
                });

                this.socket.emit("onInviteMember",{status:true});
                console.log("[DOCUMENT] - Invite : "+mdocument.uid+" SUCCESS");
            }else{
                this.socket.emit("onInviteMember",{status:false});
                console.log("[DOCUMENT] - Invite : "+mdocument.uid+" FAIL[find document]");
            }

            console.log(result);
            console.log("------------------------------------------------\n");
        }else{
            this.socket.emit("onInviteMember",{status:false});
            console.log("[DOCUMENT] - Invite : "+mdocument.uid+" FAIL[uid]");
        }
    }

    disconnect(){
        if (this.me!=null){
            this.server.stopUpdate(this.updator);
            this.server.removeUser(this.me);
        }
    }
}

module.exports.MySocketAdaptor = MySocketAdaptor;