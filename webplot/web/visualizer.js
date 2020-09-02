/*
TODO:

- [ ] move all html generation into JS
- [ ] create port input at top of page to set WS connection port
- [ ] bind 'enter' key & button to port input box to attempt connection
- [ ] add toolbar under WS connection bar with toggle switch/button for Image/Plot/MISC
- [ ] add button to open new page
- [ ] add image polygon parsing & plotting from msgpack
- [ ] add ploltly directive for plot laytou
- [ ] test orthogonal projection speed

- package page parameters into a dict
- package page createElement calls into function, call 'build' function at the
end of JS load

- add boarder to canvas

- add special callback on canvas:
  - if mouse down in bottom right corner (in coordinates), start resizing
  at fixed aspect ratio
  - stop resizing canvas on mouse up
  - save resize %, use to display in coordinates

- Auto resize canvas if image width > page width to be page width, save
resize factor
*/

// msgpack = require("msgpack-lite");

var wsport = "7777";

var ws = new WebSocket("ws://0.0.0.0:" + wsport);

var connected = false;


var imageData = {
    "width":0,
    "height":0,
    "loaded":false
};

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

function buildWebPage(){
    // create divs
    let divElement = document.createElement("div")
    divElement.id = "main";

    let divStatus = document.createElement("H1");
    divStatus.id = "header";
    let text = document.createTextNode("Visualizer::Disconnected");
    divStatus.appendChild(text);
    divElement.appendChild(divStatus);

    document.getElementsByTagName("body")[0].appendChild(divElement);

    // Image Container:
    let divContainer = document.createElement("div");
    divContainer.id = "imageContainer";
    document.getElementsByTagName("body")[0].appendChild(divContainer);

    divContainer = document.createElement("div");
    divContainer.id = "figureContainer";
    document.getElementsByTagName("body")[0].appendChild(divContainer);

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

    // HIDE AFTER LOADING:
    document.getElementById('imageContainer').style.display = "none";
}

// Main call function
(function() {

    buildWebPage()
    var canvas = document.getElementById('viewport');
    var context = canvas.getContext('2d');



    canvas.addEventListener('mousemove', function(e) {
        getCursorPosition(canvas, e)
    });

    var plot = document.getElementById('figureContainer')
    var enablePlotUpdate = true

    plot.addEventListener('mousedown', function(e) {
        enablePlotUpdate = false
        console.log("disabling plot updates")
    });

    plot.addEventListener('mouseup', function(e) {
        enablePlotUpdate = true
        console.log("enabling plot updates")
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
            if (decoded["plotly"] !== undefined){
                if (enablePlotUpdate) {
                    // console.time('updatePlotly')
                    updatePlotly(decoded);
                    // console.timeEnd('updatePlotly')
                }
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



    var plotlyData;
    var layout = {
        scene:{
            xaxis:{range: [0, 1]},
            yaxis:{range: [0, 1]},
            zaxis:{range: [0, 1]},
            aspectmode:'manual',
            aspectratio:{
                x:1,
                y:1,
                z:1,
            }

        },
        // TODO: link height to page
        height: 600,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
    };

    var plotlyOnce = false;

    updatePlotlyEmpty = (data) => {};

    updatePlotly = (data) =>{
        console.log(data)
        // use this to decode byte array to string:
        // console.log(decodeURIComponent(escape(data['config']['mode'])))
        var trace1 = {
            // INPUT DATA MUST BE FLAT!
            x:data['x'], y:data['y'], z:data['z'],
            mode: 'markers',
            marker: {
                size: 1,
                // line: {
                //     color: 'rgba(217, 217, 217, 0.14)',
                //     width: 0.5},
                opacity: 1},
            type: 'scatter3d',
            showscale: false
        }
        // console.log(trace1)
        plotlyData = [trace1];

        if (!plotlyOnce){
            Plotly.newPlot(plot, [trace1], layout);
            plotlyOnce = true;
        }
        else{
            // No update available, and delete only works when theres more than 1!
            Plotly.addTraces(plot, [trace1]);
            Plotly.deleteTraces(plot, [0]);
            // Plotly.relayout(plot, layout)

        }
    };



})();


