var GuiMusicPlayer = {	
		pluginMusic : null,
		pluginAudioMusic : null,
		
		currentPlayingItem : 0,
		
		Status : "STOPPED",
		currentTime : 0,
		updateTimeCount : 0,

		videoURL : null,
		
		selectedItem : 0,
		playedFromPage : null,
		selectedDivId : 0,
		selectedDivClass : "",
		previousImagePlayerOverlay : 0,
		
		queuedItems : [],
		shuffledItems : [],
		
		isThemeMusicPlaying : false,
		showThemeId : null,
		
		repeat : "off",
		shuffle : "off",
}

GuiMusicPlayer.onFocus = function() {
	GuiHelper.setControlButtons(null,null,null,null,"Return");
}

GuiMusicPlayer.init = function() {
	GuiPlayer.stopOnAppExit();

	this.pluginMusic = document.getElementById("pluginPlayer");
	this.pluginAudioMusic = document.getElementById("pluginObjectAudio");
	
	//Set up Player
	this.pluginMusic.OnConnectionFailed = 'GuiMusicPlayer.handleConnectionFailed';
	this.pluginMusic.OnAuthenticationFailed = 'GuiMusicPlayer.handleAuthenticationFailed';
	this.pluginMusic.OnNetworkDisconnected = 'GuiMusicPlayer.handleOnNetworkDisconnected';
	this.pluginMusic.OnRenderError = 'GuiMusicPlayer.handleRenderError';
	this.pluginMusic.OnStreamNotFound = 'GuiMusicPlayer.handleStreamNotFound';
	this.pluginMusic.OnRenderingComplete = 'GuiMusicPlayer.handleOnRenderingComplete';
	this.pluginMusic.OnCurrentPlayTime = 'GuiMusicPlayer.setCurrentTime';
    this.pluginMusic.OnStreamInfoReady = 'GuiMusicPlayer.OnStreamInfoReady'; 
    
    //Set Display Size to 0
    this.pluginMusic.SetDisplayArea(0, 0, 0, 0);
}

GuiMusicPlayer.showMusicPlayer = function(playedFromPage,selectedDivId,selectedDivClass) {
	if (this.Status != "STOPPED") {

		this.playedFromPage = playedFromPage;
		this.selectedDivId = selectedDivId;
		
		//Unhighlight the page's selected content
		if (selectedDivId != null) {
			if (selectedDivClass === undefined) {
				this.selectedDivClass = "UNDEFINED";
			} else {
				this.selectedDivClass = selectedDivClass;
			}
			
			if (document.getElementById(selectedDivId) != null) {
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("GuiPage_Setting_Changing arrowUpDown","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("highlightMezzmoBackground","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("highlightMezzmoText","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("seriesSelected","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("highlightMezzmoBackground","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("Selected","");
			}
		}
		
		if (playedFromPage == "GuiImagePlayer") {
			clearTimeout(GuiImagePlayer.infoTimer);
			document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility="hidden";
			document.getElementById("guiButtonShade").style.visibility = "";
		}
		document.getElementById("guiMusicPlayerDiv").style.bottom = "-60px";
		document.getElementById("guiMusicPlayerDiv").style.visibility = "";
		$('.guiMusicPlayerDiv').animate({
			bottom: 0
		}, 300, function() {
			//animate complete.
		});
		document.getElementById("Counter").style.visibility = "hidden";
		document.getElementById("GuiMusicPlayer").focus();
	}
}

GuiMusicPlayer.start = function(title,currentIndex,playedFromPage,isQueue,showThemeId,itemData) { 
	this.selectedItem = 0;
	
	//Initiate Player for Music if required.
	//Set to null on end of playlist or stop.
	if (this.pluginMusic == null) {
		this.init();
	}
	
	this.currentPlayingItem = currentIndex;

	//get info from URL
	this.ItemData = itemData;
	if (this.ItemData == null) { Support.processReturnURLHistory(); }	
	
	/*var backsrc = "images/musicbg.jpg";
	if (this.ItemData.backdrop != "") {
		backsrc = this.ItemData.backdrop;
	}
	
	Support.fadeImage(backsrc);*/
	
	//See if item is to be added to playlist or not - if not reset playlist
	if (this.Status != "STOPPED" && (this.isThemeMusicPlaying == true || isQueue == false)) {
		this.stopPlayback();			
	}

	if (title != "Song") { 	
    	for (var index = 0; index < this.ItemData.length; index++) {
    		this.queuedItems.push(this.ItemData[index]);
			this.shuffledItems.push(this.ItemData[index]);
    	}
		
		if (this.shuffle == 'on') {
			this.shuffleArray(this.shuffledItems);
		}
    } else {
    	//Is Individual Song
        this.queuedItems.push(this.ItemData);
		this.shuffledItems.push(this.ItemData);
    }
	
	//Only start if not already playing!
	//If reset this will be true, if not it will be added to queued items
	if (this.Status == "STOPPED") {
		//this.currentPlayingItem = 0;
		if (this.shuffle == 'off') {
			this.videoURL = this.queuedItems[this.currentPlayingItem].contentUrl;
		}
		else {
			this.videoURL = this.shuffledItems[this.currentPlayingItem].contentUrl;
		}

		
	    //Update selected Item
	    this.updateSelectedItem();
	    
		//Start Playback
		this.handlePlayKey();
		
		//Show Content
		if (this.shuffle == 'off') {
			this.showMusicPlayer(playedFromPage,this.queuedItems[this.currentPlayingItem].id,"Music seriesSelected");
		}
		else {
			this.showMusicPlayer(playedFromPage,this.shuffledItems[this.currentPlayingItem].id,"Music seriesSelected");
		}
	}

	this.shuffle = File.getUserProperty("shuffle");
	if (this.shuffle === undefined) {
		this.shuffle = 'off';
	}
	
	this.repeat = File.getUserProperty("repeat");
	if (this.repeat === undefined) {
		this.repeat = 'off';
	}
	
	if (this.shuffle == 'on') {
		document.getElementById("guiMusicPlayerShuffle").style.backgroundImage="url('images/musicplayer/shuffle_on.png')";
	}
	else if (this.shuffle == 'off') {
		document.getElementById("guiMusicPlayerShuffle").style.backgroundImage="url('images/musicplayer/shuffle_off.png')";
	}
	
	if (this.repeat == 'on') {
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_on.png')";
	}
	else if (this.repeat == 'one') {
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_one.png')";
	}
	else if (this.repeat == 'off') {
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_off.png')";
	}
	this.updateSelectedItem();
}

GuiMusicPlayer.updateSelectedItem = function() {			
	document.getElementById("guiMusicPlayerShuffle").className = "guiMusicPlayerShuffle";
	document.getElementById("guiMusicPlayerRepeat").className = "guiMusicPlayerRepeat";
	
	switch (this.selectedItem ) {
/*		case 0:
			document.getElementById("guiMusicPlayerNowPlaying").style.color = "#8dc63f";
			break;*/
		case 0:
			document.getElementById("guiMusicPlayerShuffle").className = "guiMusicPlayerShuffle highlightMezzmoBoarder";
			break;
		case 1:
			document.getElementById("guiMusicPlayerRepeat").className = "guiMusicPlayerRepeat highlightMezzmoBoarder";
			break;
		}
}

//--------------------------------------------------------------------------------------------------

GuiMusicPlayer.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	
	//Returning from blank screen
	if (document.getElementById("everything").style.visibility=="hidden") {
		document.getElementById("everything").style.visibility="";
		
		//Turn On Screensaver
	    Support.screensaverOn();
		Support.screensaver();
		
		//Don't let Return exit the app.
		switch(keyCode) {
		case tvKey.KEY_RETURN:
			widgetAPI.blockNavigation(event);
			break;
		}
		keyCode = "VOID";
	}
	
	//Update Screensaver Timer
	Support.screensaver();
	
	//If screensaver is running 
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		
		//End Screensaver
		GuiImagePlayer_Screensaver.stopScreensaver();
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}

	switch(keyCode) {
		case tvKey.KEY_LEFT:
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem = 0;
			}
			this.updateSelectedItem();
			break;
		case tvKey.KEY_RIGHT:
			this.selectedItem++;
			if (this.selectedItem > 1) {
				this.selectedItem = 1;
			}
			this.updateSelectedItem();
			break;
		case tvKey.KEY_ENTER:	
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER-player");
			switch (this.selectedItem) {
				case 0:
					this.handleShuffle();
					break;	
				case 1:
					this.handleRepeat();
					break;	
			}
			break;	
		case tvKey.KEY_PLAY:
			this.handlePlayKey();
			break;	
		case tvKey.KEY_PAUSE:	
			this.handlePauseKey();
			break;
		case tvKey.KEY_STOP:	
			this.handleStopKey();
			break;
		case tvKey.KEY_FF:	
			this.handleNextKey();
			break;
		case tvKey.KEY_RW:	
			this.handlePreviousKey();
			break;
		case tvKey.KEY_UP:
		case tvKey.KEY_DOWN:
		case tvKey.KEY_RETURN:
		case tvKey.KEY_BLUE:	
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			if (this.status == "PAUSED") {
				this.handleStopKey();
			} else {
				if (this.playedFromPage == "GuiImagePlayer" && document.getElementById("guiButtonShade") != null) {
					document.getElementById("guiButtonShade").style.visibility = "hidden";
					document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility="";
				}
				//Hide the music player.
				document.getElementById("guiMusicPlayerDiv").style.visibility = "hidden";
				document.getElementById("guiMusicPlayerDiv").style.bottom = "0";
				document.getElementById("Counter").style.visibility = "";
				
				//Hide colour buttons if a slideshow is running.
				if (GuiImagePlayer.ImageViewer != null){
					GuiHelper.setControlButtons(null,null,null,null,null);
				}
				
				//Set Page GUI elements Correct & Set Focus
				if (this.selectedDivId != null) {
					if (this.selectedDivClass == "UNDEFINED") {
						document.getElementById(this.selectedDivId).className = document.getElementById(this.selectedDivId).className + " Selected";		
					} else {
						document.getElementById(this.selectedDivId).className = this.selectedDivClass;
					}
				}
				document.getElementById(this.playedFromPage).focus();
			}
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
}

GuiMusicPlayer.handlePlayKey = function() {
	if (this.Status != "PLAYING") {	
		this.pluginAudioMusic.SetUserMute(0);   
		
		if (this.Status == "PAUSED") {
			this.pluginMusic.Resume();
		} else {
			//Clear down any variables
			this.currentTime = 0;
		    this.updateTimeCount = 0;
		    
			//Calculate position in seconds
		    this.pluginMusic.Play(this.videoURL);
		}
		document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-active-29x37.png')";
		document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-32x37.png')";
		this.Status = "PLAYING";
	}
}

GuiMusicPlayer.handlePauseKey = function() {
	this.pluginMusic.Pause();
	//Server.videoPaused(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].id,this.currentTime,"DirectStream");
	document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-29x37.png')";
	document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-active-32x37.png')";
	this.Status = "PAUSED";
}

GuiMusicPlayer.stopPlayback = function() {
	//Reset everything
	this.Status = "STOPPED";
	alert (this.currentPlayingItem);
	//Server.videoStopped(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].id,this.currentTime,"DirectStream");
	this.showThemeId = null;
	this.isThemeMusicPlaying = false;
	//this.currentPlayingItem = 0;
	this.queuedItems.length = 0;
	this.shuffledItems.length = 0;
	this.pluginMusic.Stop();
	
	document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-29x37.png')";
	document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-32x37.png')";
	document.getElementById("guiMusicPlayerStop").style.backgroundImage="url('images/musicplayer/stop-active-37x37.png')";
	setTimeout(function(){
		document.getElementById("guiMusicPlayerStop").style.backgroundImage="url('images/musicplayer/stop-37x37.png')";
	}, 400);
}

GuiMusicPlayer.handleStopKey = function() {
	alert ("STOPPING PLAYBACK");
	this.stopPlayback();
	GuiHelper.setControlButtons(0,0,0,null,0);
	this.returnToPage();
}

GuiMusicPlayer.returnToPage = function() {
	//Reset NAVI - Works
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_NONE);
    pluginAPI.registKey(tvKey.KEY_VOL_UP);
    pluginAPI.registKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.registKey(tvKey.KEY_MUTE);
	
	
	//Set queued Items to 0
    this.isThemeMusicPlaying = false;
	this.queuedItems.length = 0;
	this.shuffledItems.length = 0;
	
    if (document.getElementById("guiMusicPlayerDiv").style.visibility == "") {
		document.getElementById("guiMusicPlayerDiv").style.visibility = "hidden";
		document.getElementById("guiMusicPlayerDiv").style.bottom = "0";	
    }
    
	//Set Page GUI elements Correct & Set Focus
	if (this.selectedDivId != null) {
		if (this.selectedDivClass == "UNDEFINED") {
			document.getElementById(this.selectedDivId).className = document.getElementById(this.selectedDivId).className + " Selected";		
		} else if (document.getElementById(this.selectedDivId) != null) {
			document.getElementById(this.selectedDivId).className = this.selectedDivClass;
		}
	}
	document.getElementById(this.playedFromPage).focus();
}

GuiMusicPlayer.handleNextKey = function() {
	
	//Stop Any Playback
	//Server.videoStopped(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].MediaSources[0].id,this.currentTime,"DirectStream");
	this.pluginMusic.Stop();
	this.Status = "STOPPED";
		
	if (this.repeat != 'one') {
		this.currentPlayingItem++;
	}
	
	if (this.queuedItems.length <= this.currentPlayingItem &&
		this.repeat == 'on') {	
		this.currentPlayingItem = 0;
	}
	
	if (this.queuedItems.length <= this.currentPlayingItem) {	
		this.returnToPage();
	} else {
		//Play Next Item
		if (this.shuffle == 'off') {
			this.videoURL = this.queuedItems[this.currentPlayingItem].contentUrl;
		}
		else {
			this.videoURL = this.shuffledItems[this.currentPlayingItem].contentUrl;
		}
		alert ("Next " + this.videoURL);
		//Start Playback
		this.handlePlayKey();
	}
	
	document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-29x37.png')";
	document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-32x37.png')";
	document.getElementById("guiMusicPlayerNext").style.backgroundImage="url('images/musicplayer/skip-next-active-36x37.png')";
	setTimeout(function(){
		document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-active-29x37.png')";
		document.getElementById("guiMusicPlayerNext").style.backgroundImage="url('images/musicplayer/skip-next-36x37.png')";
	}, 300);
}

GuiMusicPlayer.handlePreviousKey = function() {
	//Stop Any Playback
	var timeOfStoppedSong = Math.floor((this.currentTime % 60000) / 1000);
		
	//Server.videoStopped(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].MediaSources[0].id,this.currentTime,"DirectStream");
	this.pluginMusic.Stop();
	this.Status = "STOPPED";
		
	//If song over 5 seconds long, previous song returns to start of current song, else go back to previous
	this.currentPlayingItem = (timeOfStoppedSong > 5 ) ? this.currentPlayingItem : this.currentPlayingItem-1;
		
	alert ("Queue Length : " + this.queuedItems.length);
	alert ("Current Playing ID : " + this.currentPlayingItem);
			
	if (this.queuedItems.length <= this.currentPlayingItem &&
		this.repeat == 'on') {	
		this.currentPlayingItem = this.queuedItems.length - 1;
	}
	
	if (this.queuedItems.length <= this.currentPlayingItem) {	
		this.returnToPage();
	} else {
		//Play Next Item
		if (this.shuffle == 'off') {
			this.videoURL = this.queuedItems[this.currentPlayingItem].contentUrl;
		}
		else {
			this.videoURL = this.shuffledItems[this.currentPlayingItem].contentUrl;
		}
		alert ("Next " + this.videoURL);
		//Start Playback
		this.handlePlayKey();
	}
	
	document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-29x37.png')";
	document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-32x37.png')";
	document.getElementById("guiMusicPlayerPrevious").style.backgroundImage="url('images/musicplayer/skip-previous-active-36x37.png')";
	setTimeout(function(){
		document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-active-29x37.png')";
		document.getElementById("guiMusicPlayerPrevious").style.backgroundImage="url('images/musicplayer/skip-previous-36x37.png')";
	}, 300);
}

GuiMusicPlayer.shuffleArray = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
	if (this.currentPlayingItem == currentIndex) {
		this.currentPlayingItem = randomIndex;
	}
	else if (this.currentPlayingItem == randomIndex) {
		this.currentPlayingItem = currentIndex;
	}
  }

  return array;
}

GuiMusicPlayer.handleShuffle = function() {
	if (this.shuffle == 'on') {
		this.shuffle = 'off';
		document.getElementById("guiMusicPlayerShuffle").style.backgroundImage="url('images/musicplayer/shuffle_off.png')";
	}
	else if (this.shuffle == 'off') {
		GuiMusicPlayer.shuffleArray(this.shuffledItems);
		this.shuffle = 'on';
		document.getElementById("guiMusicPlayerShuffle").style.backgroundImage="url('images/musicplayer/shuffle_on.png')";
	}
	File.setUserProperty("shuffle", this.shuffle);
	this.updateSelectedItem();
}

GuiMusicPlayer.handleRepeat = function() {
	document.getElementById("guiMusicPlayerRepeat").className = "guiMusicPlayerRepeat";
	if (this.repeat == 'on') {
		this.repeat = 'one';
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_one.png')";
	}
	else if (this.repeat == 'one') {
		this.repeat = 'off';
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_off.png')";
	}
	else if (this.repeat == 'off') {
		this.repeat = 'on';
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_on.png')";
	}
	File.setUserProperty("repeat", this.repeat);
	this.updateSelectedItem();
}

GuiMusicPlayer.handlePlaylistKey = function() {
	//Redo another day
	/*
	if (document.getElementById("guiMusicPlayerShowPlaylist").style.visibility == "hidden") {
		document.getElementById("guiMusicPlayerShowPlaylist").style.visibility = "";
	} else {
		document.getElementById("guiMusicPlayerShowPlaylist").style.visibility = "hidden";
	}
	
	document.getElementById("guiMusicPlayerShowPlaylistContent").innerHTML = "";
	for (var index = 0; index < this.queuedItems.length; index++) {
		document.getElementById("guiMusicPlayerShowPlaylistContent").innerHTML += this.queuedItems[index].title;
	}
	*/
}

//--------------------------------------------------------------------------------------------------

GuiMusicPlayer.handleOnRenderingComplete = function() {
	alert ("File complete");
	this.handleNextKey();
}

GuiMusicPlayer.handleOnNetworkDisconnected = function() {
	alert ("Network Disconnect");
}

GuiMusicPlayer.handleConnectionFailed = function() {
	alert ("Connection Failed");
}

GuiMusicPlayer.handleAuthenticationFailed = function() {
	alert ("Authentication Failed");
}

GuiMusicPlayer.handleRenderError = function(RenderErrorType) {
	alert ("Render Error");
}

GuiMusicPlayer.handleStreamNotFound = function() {
	alert ("Stream not found");
}

GuiMusicPlayer.setCurrentTime = function(time){
	if (this.Status == "PLAYING") {
		this.currentTime = time;
		this.updateTimeCount++;
		
	
		//Update Server every 8 ticks
		if (this.updateTimeCount == 8) {
			this.updateTimeCount = 0;
			//Update Server
			//Server.videoPaused(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].MediaSources[0].id,this.currentTime,"DirectStream");
		}
		var hms = null;
		if (this.shuffle == 'off') {
			hms = this.queuedItems[this.currentPlayingItem].duration;   // your input string
		}
		else {
			hms = this.shuffledItems[this.currentPlayingItem].duration;   // your input string
		}
		
		if (hms != null && hms != "") {
			var a = hms.split(':'); // split it at the colons

			// minutes are worth 60 seconds. Hours are worth 60 minutes.
			var totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			document.getElementById("guiMusicPlayerTime").innerHTML = Support.convertTicksToTime(this.currentTime, totalseconds * 1000);
		}
		else {
			document.getElementById("guiMusicPlayerTime").innerHTML = "Live";
		}
	}
}

GuiMusicPlayer.OnStreamInfoReady = function() {
	var playingTitle = "";
	var itemData = null;
	if (this.shuffle == 'off') {
		itemData = this.queuedItems[this.currentPlayingItem];
	}
	else {
		itemData = this.shuffledItems[this.currentPlayingItem];
	}
	
	if (this.isThemeMusicPlaying == false) {
		if (itemData.IndexNumber){
			if (itemData.IndexNumber < 10) {
				playingTitle = " - " + "0"+itemData.IndexNumber+" - ";
			} else {
				playingTitle = " - " + itemData.IndexNumber+" - ";
			}	
		}
		var songName = itemData.title;
		var title = "";
		if (itemData.Artists) {
			title += itemData.Artists + " ";
		}
		if (playingTitle) {
			title += playingTitle;
		}
		if (itemData.title) {
			title += itemData.title;
		}
		//Truncate long title.
		if (title.length > 67){
			title = title.substring(0,65) + "..."; 
		}
		
		document.getElementById("guiMusicPlayerTitle").innerHTML = title;
		document.getElementById("guiMusicPlayerAlbumArt").style.backgroundImage = "url(" + itemData.poster + ")";
	} else {
		document.getElementById("guiMusicPlayerTitle").innerHTML = "Theme Music";	
	}

	var totalseconds = Support.getSeconds(itemData.duration); 
	
	document.getElementById("guiMusicPlayerTime").innerHTML = Support.convertTicksToTime(this.currentTime, (totalseconds * 1000));
	
	//Playback Checkin
	//Server.videoStarted(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].MediaSources[0].id,"DirectStream");
	
    //Volume & Mute Control - Works!
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);
    pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
    pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.unregistKey(tvKey.KEY_MUTE);
}

GuiMusicPlayer.stopOnAppExit = function() {
	if (this.pluginMusic != null) {
		this.pluginMusic.Stop();
		this.pluginMusic = null;
		this.pluginAudioMusic = null;
	}		
}
