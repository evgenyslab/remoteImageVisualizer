msgpack = require("msgpack-lite");

var wsport = "8890";

var ws = new WebSocket("ws://0.0.0.0:" + wsport);

var connected = false;


var imageData = {
    "width":0,
    "height":0,
    "loaded":false
};

// use Js to insert button, otherwise HTML won't link correctly (won't see the onclick defined here)
var btn = document.createElement("BUTTON");   // Create a <button> element
btn.innerHTML = "Clear Image";
btn.onclick = clearImage;
document.getElementById("imageContainer").appendChild(btn);


var cvs = document.createElement("canvas");   // Create a <button> element
cvs.id = "viewport";
document.getElementById("imageContainer").appendChild(cvs);

var mcoord = document.createElement("P");   // Create a <button> element
mcoord.id = "mouseCoordinates";
document.getElementById("imageContainer").appendChild(mcoord);


var canvas = document.getElementById('viewport');
var context = canvas.getContext('2d');

function getCursorPosition(canvas, event) {
    if(imageData.loaded) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        document.getElementById('mouseCoordinates').innerHTML = "x: " + x + " y: " + y;
    }

}

function clearImage(){
    var canvas = document.getElementById('viewport');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('imageContainer').style.display = "none";

}

canvas.addEventListener('mousemove', function(e) {
    getCursorPosition(canvas, e)
});

console.log("Attempting connection");
ws.onopen = ()=>{
    connected = true;
    document.getElementById("header").innerHTML = 'Visualizer::Connected';
};

ws.onmessage = function (event) {
    var reader = new FileReader();
    // arrow function to retain 'this' & handle byte array conversion + pass to decoder:
    reader.onload = (e) =>{
        // buffer = new Uint8Array(e.target.result);  // <-- OLD!
        // binary decoding works! just need to pack correctly...
        var decoded = msgpack.decode(new Uint8Array(e.target.result));
        //  send image to its own function:
        // console.log("Decoded msgpack: ");
        if (decoded["image"] !== undefined){
            updateImage(decoded["image"]);
        }
        if (decoded["figure"] !== undefined){
            updateFigure(decoded);
        }
    };
    // call function to decode data:
    reader.readAsArrayBuffer(event.data);
};

ws.onclose = () =>{
    connected = false;
    document.getElementById("header").innerHTML = 'Visualizer::Disconnected';
};

// register on mouse coordinates over canvas:


updateImage = (data) =>{
    var blob = new Blob ([data]);

    var img = new Image;
    img.onload = function() { //this doesnt work when this is an arrow function...
        console.log( 'image received, size: '+this.width+' '+ this.height );
        document.getElementById('imageContainer').style.display = "block";
        // OLD: (will display full size)
        // document.querySelector("#image").src = this.src;
        // NEW WITH CANVAS: (will display canvas sized)
        var canvas = document.getElementById('viewport');
        var context = canvas.getContext('2d');
        imageData.width = this.width;
        imageData.height = this.height;
        context.canvas.width = this.width;
        context.canvas.height = this.height;
        context.drawImage(img, 0, 0, this.width, this.height);
        imageData.loaded = true;
    };
    img.src = URL.createObjectURL(blob);


};

updateFigure = (data) =>{
    // inject html + script from mpld3
    // expects dict with 'html', and 'js' fields
    document.getElementById("figureContainer").innerHTML = data['html'];
    eval(data['js']);
};

// HIDE AFTER LOADING:
document.getElementById('imageContainer').style.display = "none";