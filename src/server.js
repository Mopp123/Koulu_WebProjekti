
const PORT_NUM = 6551;

var http = require('http');
var fs = require('fs');
var qs = require('querystring')

// We have a container of all the messages in the chat room as json object
var CHAT_ROOM__messages__string = '[{"size":1},' + 
	'{"name":"none","message":"Terrrvettuloa jauhamaan paskaa!"}]';
var CHAT_ROOM__messages = JSON.parse(CHAT_ROOM__messages__string);



function sendResponse_404(response){
	response.writeHead(404, {"Content-Type":"text/plain"});
	response.write("Erro 404: page not found...");
	response.end();
}

function sendResponse_HTML(response, fileLocation){
	response.writeHead(200, {"Content-Type":"text/html"});
	fs.createReadStream(fileLocation).pipe(response);
}

function sendResponse_CSS(response, fileLocation){
	response.writeHead(200, {"Content-Type":"text/css"});
	fs.createReadStream(fileLocation).pipe(response);
}

function sendResponse_PNG(response, fileLocation){
	response.writeHead(200, {"Content-Type":"image/png"});
	fs.createReadStream(fileLocation).pipe(response);
}

function sendResponse_JS(response, fileLocation){
	response.writeHead(200, {"Content-Type":"application/javascript"});
	fs.createReadStream(fileLocation).pipe(response);
}

function sendResponse_getChatContent(response){
	response.writeHead(200, {"Context-Type":"text/plain"});
	response.write(JSON.stringify(CHAT_ROOM__messages));
	response.end();
}

// Handling user's "posts"
// If user sends a "postMessage" request
function handleRequest_postMessage(request, response){
	let postBody = "";
	let postName = ""; // Name of the poster
	let postMessage = ""; // ... the message itself..

	response.writeHead(200, {"Context-Type":"text/plain"});

	// Do something with the data that was sent with the 'post'
	request.on('data', function(data){
		
		// Add data we can get to the "postBody"
		// postBody currently holds the message that the user wanted post... just as string .. nothing else
		postBody += data;
		
		// Then for "safety reasons" kill the connection, if the post holds too much data...
		// 1e6 = 10^6 <- should be around 1MB
		if(postBody.length > 1e6){
			request.connection.destroy();
		}
	});
		// ...when we are at the 'end' of the post...
	request.on('end', function(){
		
		// separate the name from the message in the "post body"
		for(let i = 0; i < postBody.length; i++) {
			if(postBody.charAt(i) != "/")
				postName += postBody.charAt(i);
			else // Theres no reason for putting message together like this <- takes too long
				break;
		}
		// Put the message together here..
		postMessage = postBody.replace(postName + "/", "");


		let newMessage = ',{"name":"' + postName + '","message":"' + postMessage + '"}';
		let oldMessages = '';
		let newMessagesSize = String(CHAT_ROOM__messages[0].size + 1);

		for(let i = 1; i <= CHAT_ROOM__messages[0].size; i++)
			oldMessages += ',' + JSON.stringify(CHAT_ROOM__messages[i]);
		
		let newMessages = '[{"size":' + newMessagesSize + '}' + oldMessages + newMessage + ']';
		
		CHAT_ROOM__messages = JSON.parse(newMessages);

	});

	response.end();
}



function onRequest(request, response){


	// User requesting the main page without specific .html request...
	if(request.method == 'GET' && request.url == '/'){
		sendResponse_HTML(response, "./index.html");
	// If requested a specific html page...
	}else if(request.method == 'GET' && request.url.includes(".html")){
		sendResponse_HTML(response, "./" + request.url);
	// If user requesting the "main css file"
	}else if(request.method == 'GET' && request.url == '/css/style.css'){
		sendResponse_CSS(response, "./css/style.css");
	// If user requested javascript...
	}else if(request.method == 'GET' && request.url.includes(".js")){
		sendResponse_JS(response, "./" + request.url);
	// If user requesting png image...
	}else if(request.method == 'GET' && request.url.includes(".png")){
		sendResponse_PNG(response, "./" + request.url);
	

	// All 'GET' stuff related to the chatroom "wall" 
	}else if(request.method == 'GET' && request.url == "/getChatRoomContent"){
		sendResponse_getChatContent(response);
	
	}else if(request.method == 'POST' && request.url == "/postMessage"){
		handleRequest_postMessage(request, response);

	// If unable to find what user requested...
	} else {
		sendResponse_404(response);
	}
} 

http.createServer(onRequest).listen(PORT_NUM);

console.log("Server running! Port : " + PORT_NUM);
