

var Wall = {

	lastKnownSize: 0,
	lastScrollX: 0,

    // Request "wall" update from server and display it...
    update: function () {
        const xhr = new XMLHttpRequest();
        xhr.open('get', 'getChatRoomContent', true);                       
	    xhr.onreadystatechange = function(){
		if (xhr.readyState === 4 && xhr.status === 200) {
            		
			let messages = JSON.parse(xhr.responseText);
			let messagesLength = messages[0].size;
			
			if(messagesLength > Wall.lastKnownSize) {
				// i starts from Wall.lastKnowSize +1 because it also means the index...
            			for(let i = Wall.lastKnownSize + 1; i <= messagesLength; i++){
					let t = document.createTextNode(messages[i].name + ": " + messages[i].message);
            				let p = document.createElement("p");
            				p.appendChild(t);
            				document.getElementById("ChatRoom").appendChild(p);
				}
				Wall.lastKnownSize = messagesLength;
			
			// Also scroll the "chat box" down if we can...
			try{
				window.scrollTo(Wall.lastScrollX, document.body.scrollHeight);
			}catch(err){
			}
			}
        	}
    	}
	xhr.send(null);
    },

    // Attempt to post message...
    postMessage: function (name, message) {
        const xhr = new XMLHttpRequest();
        xhr.open('post', 'postMessage', true);
        xhr.send(name + "/" + message);
    }

};
