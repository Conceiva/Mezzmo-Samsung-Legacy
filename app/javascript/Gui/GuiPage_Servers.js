var GuiPage_Servers = {
	ServerData : null,
	
	selectedItem : 0,
	topLeftItem : 0,
	isAddButton : false,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
}

GuiPage_Servers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiPage_Servers.start = function(runAutoLogin) {
	alert("Page Enter : GuiPage_Servers");
	GuiHelper.setControlButtons("Default ",null,null,"Delete","Exit");
	
	GuiMainMenu.changeVisibility("hidden");
	
	//Reset Properties
	this.selectedItem = 0;
	this.topLeftItem = 0; 
	this.isAddButton = false;
	
	//Load Data
	this.ServerData = JSON.parse(File.loadFile());

	this.ServerData.Servers.unshift({'Name':'Add a New Server', 'poster':'images/add.png'});
	
	Support.removeSplashScreen();
	
	//Change Display
	document.getElementById("pageContent").innerHTML = "<div style='padding-top:60px;text-align:center'> \
		<div id=GuiPage_Servers_allusers></div></div>" +
				"<div style='text-align:center' class='loginOptions' >" +
				"<p style='margin-top:15px'>Use the  <span style='color: red'>RED</span> button to set the selected server as the default auto connect server</p>" +
				"<p>Use the <span style='color: #2ad'>BLUE</span> button to delete the selected server</p></div>";
			
	this.updateDisplayedUsers();
	this.updateSelectedUser();
	
	//Set Backdrop
	Support.fadeImage("images/bg1.jpg");
	
	//Set focus to element in Index that defines keydown method! This enables keys to work :D
	document.getElementById("GuiPage_Servers").focus();	


}

GuiPage_Servers.updateDisplayedUsers = function() {
	var htmltoadd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(),this.ServerData.Servers.length)); index++) {
		this.ServerData.Servers[index].id = index;
		if (this.ServerData.Servers[index].poster === undefined) {
			this.ServerData.Servers[index].poster = 'images/server.png';
		}
		htmltoadd += "<div id=" + this.ServerData.Servers[index].id + " style=background-image:url(" + this.ServerData.Servers[index].poster + ")><div class=menuItem>"+ this.ServerData.Servers[index].Name + "</div></div>";
    }
		
	//Set Content to Server Data
	var allusers = document.getElementById("GuiPage_Servers_allusers");
	if (allusers != null) {
		document.getElementById("GuiPage_Servers_allusers").innerHTML = htmltoadd;
	}
}

//Function sets CSS Properties so show which user is selected
GuiPage_Servers.updateSelectedUser = function () {	
	Support.updateSelectedNEW(this.ServerData.Servers,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + GuiPage_Servers.getMaxDisplay(),this.ServerData.Servers.length),"User Selected highlightMezzmoBoarder","User","");
}

//Function executes on the selection of a user - should log user in or generate error message on screen
GuiPage_Servers.processSelectedUser = function () {
	if (this.selectedItem == 0) {
		//GuiPage_NewServer.start();
		GuiDisplay_Servers.start();
	} else {
		File.setServerEntry(this.selectedItem - 1); // offset by 1
		Support.processHomePageMenu("Home");
		//Server.testConnectionSettings(this.ServerData.Servers[this.selectedItem].Path,true);
	}
}

GuiPage_Servers.keyDown = function()
{
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode)
	{
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processHomePageMenu("Home");
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");	
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem = this.ServerData.Servers.length - 1;
				if(this.ServerData.Servers.length > this.MAXCOLUMNCOUNT) {
					this.topLeftItem = (this.selectedItem-2);
					this.updateDisplayedUsers();
				} else {
					this.topLeftItem = 0;
				}
			} else {
				if (this.selectedItem < this.topLeftItem) {
					this.topLeftItem--;
					if (this.topLeftItem < 0) {
						this.topLeftItem = 0;
					}
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");	
			this.selectedItem++;
			if (this.selectedItem >= this.ServerData.Servers.length) {
				this.selectedItem = 0;
				this.topLeftItem = 0;
				this.updateDisplayedUsers();
			} else {
				if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
					this.topLeftItem++;
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case tvKey.KEY_DOWN:
			break;
		case tvKey.KEY_UP:
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			GuiPage_Servers.processSelectedUser();
			break;	
		case tvKey.KEY_RED:
			if (this.selectedItem != 0) {
				File.setDefaultServer(this.selectedItem - 1);
			}
			break;
		case tvKey.KEY_YELLOW:
			File.deleteSettingsFile();
			widgetAPI.sendExitEvent();
		case tvKey.KEY_BLUE:
			if (this.selectedItem != 0) {
				File.deleteServer(this.selectedItem - 1);
			}
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
		default:
			alert("Unhandled key");
			break;
	}
};