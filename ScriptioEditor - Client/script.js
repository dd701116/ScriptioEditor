/**
*	Import module
*/
import * as Tab from "./modules/tab/tab.js";
import * as Document from "./modules/document/document.js";
import {getCookie} from "./modules/cookie/cookies.js";
import {openPopup,closePopup} from "./modules/popup/popup.js";

$(() => {

	//	On instancie les actions sur le menu

	$("#btnMyDrive").on("click", (event) => {
		Tab.openView(event,"mydrive");
	});

	$("#btnNewDocument").on("click", (event) => {
		
		//	On cree un nouveau document
		let onCreateNewDocument = new Event("onCreateNewDocument");
		document.dispatchEvent(onCreateNewDocument);
	});

	$("#btnAbout").on("click", (event) =>{
		Tab.openView(event, "mydrive");
	});

	$("#btnHelp").on("click",(event) =>{
		Tab.openView(event, "mydrive");
	});



	//	Les boutons

	$("#input_username_submit").on("click",(event)=>{
		let username = $("#input_username").val();
		if (username!="" && username!=null) {
			if (username.length>=4) {
				$("#username").text(username);
				closePopup(null,"set_username");
				$("#disable").addClass("hide");

				//	On declanche le register
				let onUserRegister = new Event("onUserRegister");
				document.dispatchEvent(onUserRegister);
			}
		}
	});

	$("#btnAlert_ok").on("click",(event)=>{
		
		closePopup(null,"alert");
		$("#disable").addClass("hide");
	});

	$("#btnDocumentInvite").on("click",(event)=>{

		//	On declanche l'event de chargement de la liste des membres
		//let onDocumentInviteMemberListLoad = new Event("onDocumentInviteMemberListLoad");
		$("#document_invite_member_list").trigger("onDocumentInviteMemberListLoad");

		//	On affiche la liste
		
		openPopup(null,"document_invite_member");
		$("#disable").removeClass("hide");
	});

	$("#btnDocumentInvite_ok").on("click",(event)=>{
		
		closePopup(null,"document_invite_member");
		$("#disable").addClass("hide");
		

		//	On recupere les membres selectionne
        let invited = new Array();

        $.each($("#document_invite_member_list option:selected"), function(){            

            invited.push($(this).val());

		});
		
		let str_message = invited.join(",");

		//alert(str_message);

		//	On envoie l'evenement
		let onInviteMember = new CustomEvent("onInviteMember",{
			detail:{
				invited:invited
			}
		});

		document.dispatchEvent(onInviteMember);

	});


	//	On rename le document
	$("#document_name").keypress((event)=>{
		var keycode = (event.keyCode ? event.keyCode : event.which);

		if(keycode == '13'){

			let onRenameDocument = new Event("onRenameDocument");
			document.dispatchEvent(onRenameDocument);

		}else{
			$("#document_name").css("background-color","#eb4034");
		}
	});

	//	On init tout l'evenement clic sur les documents
	let documents = $(".file");

	Document.init_arr(documents);


	//	On verifie l'utilisateur
	let username = $("#username").text();

	if (username!=null && username!="") {
		$("#username").text(username); 
	}else{
		//	On demande son nom :
		openPopup(null,"set_username");

	}


	//	On met a jour la liste des documents

	document.addEventListener("onUpdateDocumentList", (event)=>{

		let mdocuments = event.detail.documents;
		let documents_listUI = $("#mydrive_files");

		for(let i = 0; i<mdocuments.length; i++){

			if(!documents_listUI.hasClass(mdocuments[i].uid)){

				let documentUI = '<article  id="'+mdocuments[i].uid+'" class="file	icon">'+
									'<img src="files/img/txt-icon.png">'+
									'<p class="mydrive_document_name">'+mdocuments[i].name+'</p>'+
								'</article>';

				documents_listUI.append(documentUI);
				documents_listUI.addClass(mdocuments[i].uid);
				Document.init_doc($("#"+mdocuments[i].uid),mdocuments[i].uid);
			}
		}
	});

	//	On met a jour la liste des documents partagé
	document.addEventListener("onUpdateDocumentList", (event)=>{

		let mdocuments = event.detail.shared;
		let documents_listUI = $("#shareDrive_files");

		for(let i = 0; i<mdocuments.length; i++){

			if(!documents_listUI.hasClass(mdocuments[i].uid)){

				let documentUI = '<article  id="'+mdocuments[i].uid+'" class="file	icon">'+
									'<img src="files/img/txt-icon.png">'+
									'<p class="mydrive_document_name">'+mdocuments[i].name+'</p>'+
								'</article>';

				documents_listUI.append(documentUI);
				documents_listUI.addClass(mdocuments[i].uid);
				Document.init_doc($("#"+mdocuments[i].uid),mdocuments[i].uid);
			}
		}
	});

	//	On met a jour la liste des utilisateurs à inviter

	document.addEventListener("onUpdateDocumentInviteList", (event)=>{

		let mdocuments = event.detail.documents;
		let documents_listUI = $("#mydrive_files");

		for(let i = 0; i<mdocuments.length; i++){

			if(!documents_listUI.hasClass(mdocuments[i].uid)){

				let documentUI = '<article  id="'+mdocuments[i].uid+'" class="file	icon">'+
									'<img src="files/img/txt-icon.png">'+
									'<p class="mydrive_document_name">'+mdocuments[i].name+'</p>'+
								'</article>';

				documents_listUI.append(documentUI);
				documents_listUI.addClass(mdocuments[i].uid);
				Document.init_doc($("#"+mdocuments[i].uid),mdocuments[i].uid);
			}
		}
	});
});
