/*
TODO:

- [ ] move all html generation into JS
- [ ] test ws.message send back
- [ ] add button for presentation window thru msgpack
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

let state = {
    pageSettings:{
        tabs:["image","plot","misc"],
        tabButtons:[
            {name:"Image",
                fx:setPageToImage},
            {name:"Plot",
                fx:setPageToPlot},
            {name:"Other",
                fx:setPageToOther},
        ]
    },
    pageState:{
        currentView:"image"
    },
    wsData:{
        port: "7777",
        connected: false,
        ws: null,
    },
    mode: "image",
    imageData:{
        "width":0,
        "height":0,
        "loaded":false
    },
    plotData:{

    }

}

function test(){
    console.log("ButtonPressed")
}

function setPageToImage(){
    console.log("setPageToImage")
}
function setPageToPlot(){
    console.log("setPageToPlot")
}
function setPageToOther(){
    console.log("setPageToOther")
}

function getCursorPosition(canvas, event) {
    if(state.imageData.loaded) {
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

function tryToConnectToWS(){
    state.wsData.ws = new WebSocket("ws://0.0.0.0:" + state.wsData.port);
}

function registerWDCallbacks(){
    state.wsData.ws.onopen = ()=>{
        connected = true;
        document.getElementById("header").innerHTML = 'Visualizer::Connected';
    };

    state.wsData.ws.onmessage = function (event) {
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

    state.wsData.ws.onclose = () =>{
        connected = false;
        document.getElementById("header").innerHTML = 'Visualizer::Disconnected';
    };
}


/*

<div main>
    <div header>
    <div buttonToolBar>

<div imageContainer>
    <div imageButtonToolBar>
    <div canvasContainer>
    <div imageInformation>

<div figureContainer>
    <div figureButtonToolBar>
    <div canvasContainer>
    <div imageInformation>

* */

function buildHeader(){
    // create divs
    let divMain = document.createElement("div")
    divMain.id = "main";

    let divHeader = document.createElement("div")
    divHeader.id = "hero";

    let divHeaderStatus = document.createElement("H1");
    divHeaderStatus.id = "header";
    let text = document.createTextNode("Visualizer::Disconnected");
    divHeaderStatus.appendChild(text);
    divHeader.appendChild(divHeaderStatus);


    let divHeaderButtonToolBar = document.createElement("div")
    divHeaderButtonToolBar.id = "headerButtonToolBar";
    let buttonStyle =
    "    background-color: #4CAF50;" +
    "    border: none;" +
    "    color: white;" +
    "    text-align: center;" +
    "    text-decoration: none;" +
    "    display: inline-block;" +
    "    font-size: 16px;" +
    "    margin: 4px 2px;" +
    "    cursor: pointer;";

    let btn = null;
    // Auto create buttons:
    state.pageSettings.tabButtons.forEach((buttonSpec)=>{
        btn = document.createElement("BUTTON");   // Create a <button> element
        btn.innerHTML = buttonSpec.name
        // btn.onclick = clearImage;
        btn.onclick = buttonSpec.fx;
        btn.style.cssText = buttonStyle
        divHeaderButtonToolBar.appendChild(btn);
    })

    // add connection info:
    divHeaderButtonToolBar.append("\tPORT::");
    let portInput = document.createElement("INPUT");
    portInput.id = "portConnectionInfo"
    portInput.type="text";
    portInput.size = 5;
    portInput.value = state.wsData.port
    portInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            state.wsData.port = document.getElementById("portConnectionInfo").value
            tryToConnectToWS()
            registerWDCallbacks()
        }
    });
    divHeaderButtonToolBar.appendChild(portInput);

    btn = document.createElement("BUTTON");   // Create a <button> element
    btn.innerHTML = "Connect"
    btn.addEventListener('click', function () {
        if (!state.wsData.connected){
            state.wsData.port = document.getElementById("portConnectionInfo").value
            tryToConnectToWS()
            registerWDCallbacks()
        }
    });
    btn.style.cssText = buttonStyle
    divHeaderButtonToolBar.appendChild(btn);

    btn = document.createElement("BUTTON");   // Create a <button> element
    btn.innerHTML = "Disconnect"
    btn.addEventListener('click', function () {
        console.log("disconnecting")
        state.wsData.ws.close()
    });
    btn.style.cssText = buttonStyle
    divHeaderButtonToolBar.appendChild(btn);

    let spacer = document.createElement("P")

    divHeaderButtonToolBar.appendChild(spacer);

    divMain.appendChild(divHeader)
    divMain.appendChild(divHeaderButtonToolBar)

    document.getElementsByTagName("body")[0].appendChild(divMain);
}

function buildImageContainer(){
    let divImageContainer = document.createElement("div")
    divImageContainer.id = "imageContainer";

    let divButtonToolBar = document.createElement("div")
    divButtonToolBar.id = "imageButtonToolBar";

    let divCanvasContainer = document.createElement("div")
    divCanvasContainer.id = "canvasContainer";

    let divInformationBar = document.createElement("div")
    divInformationBar.id = "imageInformationBar";

    var btn = document.createElement("BUTTON");   // Create a <button> element
    btn.innerHTML = "Clear Image";
    btn.onclick = clearImage;
    divButtonToolBar.appendChild(btn);

    var canvas = document.createElement("canvas");   // Create a <button> element
    canvas.id = "viewport";
    divCanvasContainer.appendChild(canvas);

    var mcoord = document.createElement("P");   // Create a <button> element
    mcoord.id = "mouseCoordinates";
    divInformationBar.appendChild(mcoord);

    divImageContainer.appendChild(divButtonToolBar)
    divImageContainer.appendChild(divCanvasContainer)
    divImageContainer.appendChild(divInformationBar)

    document.getElementsByTagName("body")[0].appendChild(divImageContainer);
}

function buildWebPage(){
    buildHeader()
    buildImageContainer()


    divContainer = document.createElement("div");
    divContainer.id = "figureContainer";
    document.getElementsByTagName("body")[0].appendChild(divContainer);

    // use Js to insert button, otherwise HTML won't link correctly (won't see the onclick defined here)






    // HIDE AFTER LOADING:
    // document.getElementById('imageContainer').style.display = "none";
}

// Main call function
(function() {

    buildWebPage()
    //  linking functions:
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

    // create ws connection:
    tryToConnectToWS()
    registerWDCallbacks()



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
            state.imageData.width = this.width;
            state.imageData.height = this.height;
            context.canvas.width = this.width;
            context.canvas.height = this.height;
            context.drawImage(img, 0, 0, this.width, this.height);
            state.imageData.loaded = true;
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


