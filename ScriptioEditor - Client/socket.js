
/**
*	Import module
*/

import * as Identifier from "./modules/random/identifier.js";
import {getCookie,setCookie} from "./modules/cookie/cookies.js";
import {openPopup,closePopup} from "./modules/popup/popup.js";
import * as Tab from "./modules/tab/tab.js";
import * as Document from "./modules/document/document.js";


/**
*	Intitialisation
*/

var client = {};
client.uid= Identifier.genuid(3);
client.documents = new Array();
client.autoSave = null;
client.members = [];

/**
*	On document ready
*/
$(()=>{
	

	//	Connection au serveur
	var socket = io.connect('http://localhost:7888');


	


	//	Inscrition de l'utilisateur

	document.addEventListener("onUserRegister", (event)=>{

		//	On recupere le username

		console.log("OK");

		client.username = $("#username").text();

		//	On recupere le uid
		let uid = getCookie("uid");
		if(uid!=null && uid!=""){
			client.uid = uid;
		}else{
			setCookie("uid",client.uid,5);
		}

		//	On s'enregistre au pret du serveur
		socket.emit('onUserRegister',{
			uid:client.uid,
			username:client.username
		});

		

	});

	socket.on("onUserRegisterResponse",(response)=>{

		if(response){
			//	On affiche le uid et le username
			$("#username").text(client.uid+"/"+client.username);
		}else{

			//	On relance l'inscrioption
			openPopup(null,"set_username");
			$("#disable").removeClass("hide");
		}
	});


	//	A la creation d'un document

	document.addEventListener("onCreateNewDocument", (event)=> {

		//	On cree un nom temporaire pour ce document
		let doc = {};
		doc.name = Identifier.genuid(10);

		socket.emit('onCreateNewDocument',{
			client:client,
			document:doc
		});

	});

	socket.on("onCreateNewDocumentResponse",(response)=>{

		if(response!=false){
			//	On affiche le uid et le nom du document
			$("#document_name").val(response.name);
			$("#document_uid").val(response.uid);
			$("#document").val("");

			

			//	On charge aussi TinyMCE
			tinymce.init({
				selector: '#document',
				height: 550,
				setup: function(editor) {
					editor.on( "keyup", function( event ) { 
						Document.save();
					});
				}
			}).then((editors)=>{

				
				//	On set le contenu
				tinymce.get("document").setContent("");


				Tab.openView(event, "new");
				//	On lance l'autosave
				client.autoSave = Document.startAutoSave();
			});
			

		}else{
			//	On set le message
			$("#alert_message").text("Le document n'a pas été créé ! (Response : "+response+")");
			//	On lance le message d'erreur
			openPopup(null,"alert");
			$("#disable").removeClass("hide");
		}
	});


	//	Au renomage d'un document

	document.addEventListener("onRenameDocument", (event)=>{

		//	On recupere le nouveau nom du document
		let doc = {};
		doc.name = $("#document_name").val();
		doc.uid = $("#document_uid").val();

		if(doc.name!="" && doc.name!=null){
			socket.emit('onRenameDocument',{
				client:client,
				document:doc
			});
		}

	});


	socket.on("onRenameDocumentResponse", (response)=>{
		
		if(response!=false){

			//	On remet la couleur de l'input a blanc
			$("#document_name").css("background-color","white");

			//	On recupere le uid
			let uid = $("#document_uid").val();

			//	On change le nom dans la liste des fichiers
			$("#"+uid).find("p").text($("#document_name").val());
		}else{
			//	On set le message
			$("#alert_message").text("Le document n'a pas ete renommé ! (Response : "+response+")");
			//	On lance le message d'erreur
			openPopup(null,"alert");
			$("#disable").removeClass("hide");
		}
	});


	//	Ouvrir un document

	document.addEventListener("onOpenDocument", (event)=>{

		//	On recupere le nouveau nom du document
		let doc = {};
		doc.uid = event.detail.document.uid;

		if(doc.uid!="" && doc.uid!=null){
			socket.emit('onOpenDocument',{
				client:client,
				document:doc
			});
		}

	});

	socket.on("onOpenDocumentResponse",(data)=>{
		
		if(data!=false){
			//	On set le titre
			$("#document_name").val(data.document.name);
			$("#document_uid").val(data.document.uid);


			//	On charge aussi TinyMCE
			tinymce.init({
				selector: '#document',
				height: 550,
				setup: function(editor) {
					editor.on( "keyup", function( event ) { 
						Document.save();
					});
				}
			}).then((editors)=>{

				//	On set le contenu
				tinymce.get("document").setContent(data.content);
				
				//	On lance l'autosave
				client.autoSave = Document.startAutoSave();

			});
			
			

			//	On affiche la tab New Document
			Tab.openView(null,"new");
		}
	});

	//	On gere le autosave

	//	On arrete le autosave des qu'il n'est pas sur la view : new
	//	On arrete le auto save dans tt les cas car dans le cas ou il reappui sur new 
	document.addEventListener("onOpenView",(event)=>{
		if(client.autoSave!=null){
			Document.stopAutoSave(client.autoSave);
			
		}
	});

	//	On envoi la sauvegarde au serveur
	document.addEventListener("onDocumentSaveUpdate",(event)=>{
		console.log(event.detail);
		socket.emit("onDocumentSaveUpdate",{
			client:client,
			document:event.detail.document,
			content:event.detail.content
		});
	});

	socket.on("onDocumentSaveUpdateResponse",(data)=>{
		if(data.status){
			//	On set le contenu
			tinymce.get("document").setContent(data.content);
			console.log("set content "+data.content);
		}
	});
	


	//	Quand on reçoit les mise a jours

	socket.on("onUpdate", (update)=>{

		//	On recupere la liste des document
		if(client.documents.length!=update.documents.length){


			client.documents = update.documents;
			client.shared = update.shared;
			client.members = update.members;

			let onUpdateDocumentList = new CustomEvent("onUpdateDocumentList",{
				detail:{
					documents:client.documents,
					shared:client.shared
				}
			});
			
			document.dispatchEvent(onUpdateDocumentList);
		}

		console.log(update);

	});

	//	On charge la liste des membres a inviter
	$("#document_invite_member_list").on("onDocumentInviteMemberListLoad", (event)=>{

		//	On recupere la liste UI
		let listUI = $("#document_invite_member_list");
		//listUI.empty();

		//	On lui ajoute les membres
		client.members.forEach(member => {
			if(!listUI.hasClass(member.uid) && member.uid!=client.uid){
				listUI.append('<option value="'+member.uid+'">'+member.username+' <i>['+member.uid+']</i></option>');
				listUI.addClass(member.uid);
			}
		});

	});

	//	On invite des membres
	document.addEventListener("onInviteMember", (event)=>{

		let uid = $("#document_uid").val();

		let doc = {
			uid:uid
		};

		socket.emit("onInviteMember",{
			client:client,
			document:doc,
			invited:event.detail.invited
		});

	});

	//	La deconnection

	window.addEventListener('beforeunload', (event) => {

		//	on deconnecte
		socket.emit('onUserDisconnect',true);
	});

	
});



