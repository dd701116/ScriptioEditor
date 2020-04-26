

const IdentifierClass = require('../libs/Identifier.js');
const FS = require('fs');

class Document {

    constructor(name,author) {
        this.uid = IdentifierClass.Identifier.genuid(10);
        this.name = name;
        this.author = author;
        this.created = new Date();
        this._path = "/documents/"+this.author.uid+"/"+this.uid+"/";

        //  On cree le dossier
        FS.mkdirSync(process.cwd()+this._path,{},(error)=>{
            if (error)
                console.log("ERROR DOCUMENT");
        });

        this.versions = new Array();

        let me = this;
        //  On cree la premiere version
        let latest = new Version(this.uid,this.author,this.created);

        me.versions.push(latest);

        this.whitelist = new Array();
        this.whitelist.push(this.author.uid);
    }

    update(content){

        //  On met en place la promesse

        //  On recupere la derniere version
        let old = this.latest();
        let me = this;

        if (old!=null){
            console.log(old);
            if (old.content()!=content){
                let latest = new Version(this.uid,this.author, new Date());

                this.versions.push(latest);

                return latest.write(content);


            }else{
                return old.get();
            }
        }


    }

    createVersion(date, author){
        this.versions.push(new Version(this.name,author, date));
    }

    getVersion(date){

    }

    latest(){
        if (this.versions.length>0){
            return this.versions[this.versions.length-1];
        }
        return null;
    }

    getDiff(documents){

    }
}


class Version {

    constructor(name, author, date) {
        this.uid = name;
        this.author = author;
        this.created = date;
        let date_str = date.getTime();
        this._path = "/documents/"+this.author.uid+"/"+this.uid+"/"+date_str+".txt";

        //  On cree le fichier
        FS.writeFile(process.cwd()+this._path,"",(err)=>{
            if (err){
                console.log("ERROR FILE");
            }
        });
    }

    content(){

        let txt = FS.readFileSync(process.cwd()+this._path,'utf8');

        return txt;
    }

    write(content){
        FS.writeFileSync(process.cwd()+this._path,content,'utf8');

        return new Promise(resolve => {
            resolve(this);
        });
    }

    get(){
        return new Promise(resolve => {
            resolve(this);
        });
    }
}

module.exports.Document = Document;
module.exports.Version = Version;