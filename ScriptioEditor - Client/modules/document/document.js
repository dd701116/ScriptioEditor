
export function init_arr(documents) {
	for (let i = documents.length - 1; i >= 0; i--) {

		let id = documents[i].id;

		init_doc($(documents[i]), id);
	}
}

export function init_doc(mdocument, id) {

	mdocument.on("click", (event)=>{
		
		let onOpenDocument = new CustomEvent("onOpenDocument", {
			detail:{
				document:{
					uid:id
				}
			}
		});

		document.dispatchEvent(onOpenDocument);
		
	});
}

export function save(){

	let uid = $("#document_uid").val();

	let content = tinymce.get("document").getContent();

	let onSave = new CustomEvent("onDocumentSaveUpdate", {
		detail:{
			document:{
				uid:uid
			},
			content:content
		}
	});

	document.dispatchEvent(onSave);

}


export function startAutoSave(){
	return setInterval(()=>{
		//save();
		console.log("Save Document PAUSE");
	},1000);
}

export function stopAutoSave(task){
	clearInterval(task);
}