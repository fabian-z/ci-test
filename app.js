const http = require('http');
const fs = require('fs');
const sqlite3 = require('sqlite3');

fs.mkdirSync("storage", { recursive: true })

const SQLite3 = sqlite3.verbose();
const db = new SQLite3.Database('storage/content.db');

const hostname = '0.0.0.0';
const port = 80;

let contents = [];

const query = (command, method = 'all') => {
  return new Promise((resolve, reject) => {
    db[method](command, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

db.serialize(async () => {
	await query("CREATE TABLE IF NOT EXISTS content (content text)", 'run');
});

async function loadContent() {
	const values = await query('SELECT content FROM content');
	for (const value of values) {
		console.log("loaded", value.content);
		contents.push(value.content);
	}
}

async function saveContent() {
	await query("DELETE FROM content", 'run');
	for (const content of contents){
		db.run(`INSERT INTO content VALUES (?)`, content);
	}
}

function getContent() {
	
let contentString = "";
	
for (const content of contents){
    contentString = contentString + "<p>" + content + "</p>";
}
	
return `<!DOCTYPE html>
<html lang="en">
<meta charset="UTF-8">
<title>Super Web 2.0 page</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
</style>
<body>
<h1>This is an example Web 2.0</h1>
<form id="inputform" action="/" method="POST" enctype="text/plain">
<input name="text" type="text" placeholder="Enter text here.."/>
<input id="submit" type="submit" value="Submit"/>
</form>
<div id="content">
 <h3>User generated content making us rich:</h1>
` + contentString + `<div id="target"></div>
<script>

function callback(event) {

event.preventDefault();
let val = document.getElementsByName("text")[0].value;

fetch('/', {
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain'
    },
    body: "text="+val
}).then((data) => {
    
let content = document.getElementById("content");
let target = document.getElementById("target");

let div = document.createElement('p');
div.innerHTML = val;

// Insert the element before our target element
target.parentNode.insertBefore(div, target);

});

}

let ele = document.getElementById("inputform");
ele.addEventListener("submit", callback, true);

</script>
</body>
</html>`

}

function processRequest(res) {
res.statusCode = 200;
   res.setHeader('Content-Type', 'text/html');
   res.end(getContent());
}

const server = http.createServer((req, res) => {
  let body = '';
  if (req.method == "POST") {
	   req.on('data', function(data) {
       body += data
    })
    req.on('end', function() {
		
	   let newContent = body.replace(/^text=/,'');
       
       contents.push(newContent);
       saveContent();
       body = '';
	   processRequest(res);
    })
  } else {
       processRequest(res);
  }
});

loadContent();

server.listen(port, hostname, () => {
  console.log("Server running at http://${hostname}:${port}/");
});
