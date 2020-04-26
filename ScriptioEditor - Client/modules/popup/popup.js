
export function openPopup(evt, popupName){
  // Declare all variables
  var i, popupContent, tablinks;

  // Get all elements with class="popupContent" and hide them
  popupContent = $(".popup");
  for (i = 0; i < popupContent.length; i++) {
    $("#"+popupContent[i].id).removeClass("show");
  }

	// Show the current tab, and add an "active" class to the button that opened the tab
	$("#"+popupName).addClass("show");

  if (evt!=null) {
    $(evt.currentTarget).addClass("active");
  }
}

export function closePopup(evt, popupName){

	// Show the current tab, and add an "active" class to the button that opened the tab
	$("#"+popupName).removeClass("show");

  if (evt!=null) {
    $(evt.currentTarget).removeClass("active");
  }
	

}
