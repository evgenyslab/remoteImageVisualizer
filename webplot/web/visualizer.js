/*
TODO:

- [x] move all html generation into JS
- [ ] test ws.message send back
- [ ] add button for presentation window thru msgpack
- [x] create port input at top of page to set WS connection port
- [x] bind 'enter' key & button to port input box to attempt connection
- [x] add toolbar under WS connection bar with toggle switch/button for Image/Plot/MISC
- [ ] add button to open new page
- [ ] add image polygon parsing & plotting from msgpack
- [x] add ploltly directive for plot laytou
- [ ] test orthogonal projection speed
- [ ] redraw last received image -> how to actaully store image locally?
- [x] plotly dict parser intengration
- [x] basic plotly integration
- [x] AUTO RESIZE PLOT
- [ ] NOTIFICATION THAT DATA WAS RECEIVED AT TOP!

- [ ] __FUTURE__ auto build with json object
- [ ] __FUTURE__ Auto create multiple graphs/images based on ID, up to max

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


let tabButtonStyle =
    "background-color: GRAY;" +
    "border: none;" +
    "color: white;" +
    "text-align: center;" +
    "text-decoration: none;" +
    "display: inline-block;" +
    "font-size: 16px;" +
    "margin: 4px 2px;" +
    "padding: 10px 24px;"
"cursor: pointer;";

let connectButtonStyle =
    "background-color: GREEN;" +
    "border: none;" +
    "color: white;" +
    "text-align: center;" +
    "text-decoration: none;" +
    "display: inline-block;" +
    "font-size: 16px;" +
    "margin: 4px 2px;" +
    "padding: 10px 24px;"
"cursor: pointer;";

let disconnectButtonStyle =
    "background-color: RED;" +
    "border: none;" +
    "color: white;" +
    "text-align: center;" +
    "text-decoration: none;" +
    "display: inline-block;" +
    "font-size: 16px;" +
    "margin: 4px 2px;" +
    "padding: 10px 24px;"
"cursor: pointer;";


let state = {
    pageSettings:{
        tabs:["image","plot","misc"],
        tabButtons:[
            {name:"Image",
                id:"enableImageView",
                fx:setPageToImage},
            {name:"Plot",
                id:"enablePlotView",
                fx:setPageToPlot},
            {name:"Other",
                id:"enableOtherView",
                fx:setPageToOther},
        ],
        controlButtons:[
            {name:"Start/Stop",
                id:"buttonStartStop",
                fx:sendMessageStartStopDataFeed},
            {name:"Reverse",
                id:"buttonReverse",
                fx:sendMessageDataFeedToReverse},
        ],
        tabContainers:
            ["imageContainer",
            "figureContainer",
            // "otherContainer",
            ],

    },
    pageState:{
        currentView:"Image",
        enablePlotUpdate:true,
        canvasWidthAvailable:0,
        canvasHeightAvailable:0,
    },
    wsData:{
        port: "7777",
        connected: false,
        ws: null,
    },
    mode: "image",
    imageData:{
        width:0,
        height:0,
        canvasWidth:0,
        canvasHeight:0,
        canvasWidthAvailable:0,
        canvasHeightAvailable:0,
        displayScale:1,
        loaded:false,
        data: null,
        image:new Image,
    },
    plotData:{
        configure:false,
        width:0,
        height:0,
        canvasWidth:0,
        canvasHeight:0,
        canvasWidthAvailable:0,
        canvasHeightAvailable:0,
        data: null,
        layout: null,
        hasPlotted: false,
    }
}

function registerImageOnLoad(){
    state.imageData.image.onload= function() { //this doesnt work when this is an arrow function...
        console.log( 'image received, size: '+this.width+' '+ this.height );
        // document.getElementById('imageContainer').style.display = "block";
        // OLD: (will display full size)
        // document.querySelector("#image").src = this.src;
        // NEW WITH CANVAS: (will display canvas sized)

        let canvas = document.getElementById('imageCanvasContainer');
        let context = canvas.getContext('2d');
        let prevImageWidth = state.imageData.width
        let prevImageHeight = state.imageData.height
        state.imageData.width = this.width;
        state.imageData.height = this.height;
        let prevCanvasWidthAvailable = state.imageData.canvasWidthAvailable
        let prevCanvasHeightAvailable = state.imageData.canvasHeightAvailable
        updateCanvasDimensionsAvailable()
        // short circuit to configure canvas (so it doesnt happen on every single image!
        if ((prevCanvasWidthAvailable !== state.imageData.canvasWidthAvailable) ||
            (prevCanvasHeightAvailable !== state.imageData.canvasHeightAvailable) ||
            (prevImageWidth !== state.imageData.width) ||
            (prevImageHeight !== state.imageData.height))
            configureImageCanvas()
        context.drawImage(state.imageData.image, 0, 0,  state.imageData.canvasWidth,
            state.imageData.canvasHeight);
        state.imageData.loaded = true;
        console.log(state.imageData)
    };
}

function sendMessageStartStopDataFeed(){
    if (state.wsData.connected){
        let msg = msgpack.encode({
            control: 'togglePausePlay'
        });
        state.wsData.ws.send(
            "blah"
        );
        state.wsData.ws.send(
            ["blah", "blah"]
        );
    }
}
function sendMessageDataFeedToReverse(){
    if (state.wsData.connected){
        let msg = msgpack.encode({
            control: 'toggleReverse'
        });
        state.wsData.ws.send(
            msg
        );
    }
}

function initializePlotlyLayout(){
    updateCanvasDimensionsAvailable()
    state.plotData.layout = {
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
        height: state.pageState.canvasHeightAvailable*(0.7),
        width: state.pageState.canvasWidthAvailable,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
    };
}

function hideAllContainers(){
    state.pageSettings.tabContainers.forEach((tabName)=>{
        let c = document.getElementById(tabName);
        c.style.display = "none";
    })
}

function resetPageButtons(){
    state.pageSettings.tabButtons.forEach((buttonSpec)=>{
        let btn = document.getElementById(buttonSpec.id)
        btn.style.backgroundColor = "GRAY"
    })
}

function setPageToImage(){
    // TODO: reload image if one exists!
    console.log("setPageToImage")
    state.pageState.currentView = "Image";
    document.getElementById('figureContainer').style.display = "none";
    document.getElementById('imageContainer').style.display = "block";
    resetPageButtons()
    let btn = document.getElementById("enableImageView")
    btn.style.backgroundColor = "GREEN"
    // try to redraw last image:
    // updateImageOnResize()
}

function setPageToPlot(){
    console.log("setPageToPlot")
    state.pageState.currentView = "Plot";
    document.getElementById('imageContainer').style.display = "none";
    document.getElementById('figureContainer').style.display = "block";
    resetPageButtons()
    let btn = document.getElementById("enablePlotView")
    btn.style.backgroundColor = "GREEN"
}
function setPageToOther(){
    console.log("setPageToOther")
}

function getCursorPosition(canvas, event) {
    if(state.imageData.loaded) {
        let rect = canvas.getBoundingClientRect();
        // TODO: clamp to image size + apply scaling!
        let x = (event.clientX - rect.left)*state.imageData.displayScale;
        let y = (event.clientY - rect.top)*state.imageData.displayScale;
        if (y < 0)
            y = 0
        if (x < 0)
            x = 0
        if (y > state.imageData.height)
            y = state.imageData.height
        if (x > state.imageData.width)
            x = state.imageData.width
        document.getElementById('mouseCoordinates').innerHTML = "x: " + x + " y: " + y;
    }

}

function clearImage(){
    var canvas = document.getElementById('imageCanvasContainer');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function tryToConnectToWS(){
    state.wsData.ws = new WebSocket("ws://0.0.0.0:" + state.wsData.port);
}

function registerWDCallbacks(){
    state.wsData.ws.onopen = ()=>{
        state.wsData.connected = true;
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
                if (state.pageState.currentView==="Image")
                    updateImage(decoded["image"]);
            }
            if (decoded["figure"] !== undefined){
                if (state.pageState.currentView==="Plot")
                    updateFigure(decoded['figure']);
            }
            if (decoded["figureConfiguration"] !== undefined){
                if (state.pageState.currentView==="Plot")
                    updateFigureConfiguration(decoded['figureConfiguration']);
            }
        };
        // call function to decode data:
        reader.readAsArrayBuffer(event.data);
    };

    state.wsData.ws.onclose = () =>{
        state.wsData.connected = false;
        document.getElementById("header").innerHTML = 'Visualizer::Disconnected';
    };
}

function registerResizingCallbacks(){
  window.addEventListener('resize', updateCanvasOnResize)
}

function updateCanvasDimensionsAvailable(){
    // this should only be called if an image was drawn
    let body = document.getElementById("main")
    // visible width:
    let w = body.offsetWidth
    // visible height:
    if (state.pageState.currentView==="Image")
        var canvas = document.getElementById('imageCanvasContainer');
    else if (state.pageState.currentView==="Plot")
        var canvas = document.getElementById('figureCanvasContainer');
    let elemRect = canvas.getBoundingClientRect()
    // what to do if no image loaded yet?
    state.imageData.canvasWidthAvailable = w-20;
    state.imageData.canvasHeightAvailable = window.innerHeight - elemRect.y - 20;
    state.pageState.canvasWidthAvailable = w-20;
    state.pageState.canvasHeightAvailable = window.innerHeight - elemRect.y - 20;
}

function configureImageCanvas(){
    var canvas = document.getElementById('imageCanvasContainer');
    var context = canvas.getContext('2d');
    // find scaling:
    let _rx = state.imageData.width/state.imageData.canvasWidthAvailable
    let _ry = state.imageData.height/state.imageData.canvasHeightAvailable
    let aspectRatio = state.imageData.height/state.imageData.width
    let scale = 1
    if (_rx > 1 && _rx > _ry){
        // resize canvas based on width
        context.canvas.width = state.imageData.canvasWidthAvailable;
        context.canvas.height = state.imageData.canvasWidthAvailable*aspectRatio;
        scale = _rx
    }
    else if (_ry > 1 && _ry > _rx){
        // resize canvas absed on hieght
        context.canvas.width = state.imageData.canvasHeightAvailable/aspectRatio;
        context.canvas.height = state.imageData.canvasHeightAvailable;
        scale = _ry
    }
    else{
        // fit canvas to image size, since canvas can accomodate
        context.canvas.width = state.imageData.width;
        context.canvas.height = state.imageData.height;
    }
    state.imageData.displayScale = scale
    state.imageData.canvasWidth = context.canvas.width
    state.imageData.canvasHeight = context.canvas.height
}

function redrawImage(){
    var canvas = document.getElementById('imageCanvasContainer');
    var context = canvas.getContext('2d');
    console.log(state.imageData)
    context.drawImage(state.imageData.image, 0, 0,  state.imageData.canvasWidth,
        state.imageData.canvasHeight);
}

function updateCanvasOnResize(){
    if ((state.pageState.currentView==="Image") && (state.imageData.loaded)){
        updateCanvasDimensionsAvailable()
        configureImageCanvas()
        redrawImage()
    }else if ((state.pageState.currentView==="Plot") && (state.plotData.hasPlotted)){
        updateCanvasDimensionsAvailable()
        let layout = {
            height: state.pageState.canvasHeightAvailable*(0.7),
            width: state.pageState.canvasWidthAvailable,
        }
        updateFigureConfiguration(layout)
    }
}

updateImage = (data) =>{
    let blob = new Blob ([data]);
    state.imageData.image.src = URL.createObjectURL(blob);

};


function updateCanvasSize(){
    // try to get window width/height on load
    var w = window.innerWidth; // this doesn't work in sphinx
    // create listener for window resize:
    // sphinx ONLY
    let page = document.getElementById('imageContainer');
    let canvas = document.getElementById('imageCanvasContainer');
    if (document.getElementById('imageContainer')!==null){
        offsetWidth = canvas.offsetWidth;
        offsetHeight = canvas.offsetHeight;
        console.log("sphinx page width: ", page.offsetWidth);
        // width is set by browser, height is set by camera
        canvas.width = page.offsetWidth;
        canvas.height = offsetHeight;
    }else{
        // width is set by browser, height is set by camera
        canvas.width = offsetWidth;
        canvas.height = offsetHeight;
        if (w >= 800){
            canvas.width = 800;
        }else{
            canvas.width = 0.8*w;
        }
    }
}

updateFigure = (data) =>{
    let plot = document.getElementById('figureCanvasContainer')
    console.log(data)

    if (!state.plotData.hasPlotted){
        Plotly.newPlot(plot, [data], state.plotData.layout);
        state.plotData.hasPlotted = true;
    }
    else{
        // No update available, and delete only works when theres more than 1!
        Plotly.addTraces(plot, [trace]);
        Plotly.deleteTraces(plot, [0]);
    }
};

updateFigureConfiguration = (data) =>{
    let plot = document.getElementById('figureCanvasContainer')
    Plotly.relayout(plot, data)
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


    let btn = null;
    // Auto create buttons:
    state.pageSettings.tabButtons.forEach((buttonSpec)=>{
        btn = document.createElement("BUTTON");   // Create a <button> element
        btn.id = buttonSpec.id
        btn.innerHTML = buttonSpec.name
        // btn.onclick = clearImage;
        btn.onclick = buttonSpec.fx;
        btn.style.cssText = tabButtonStyle
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
    btn.style.cssText = connectButtonStyle
    divHeaderButtonToolBar.appendChild(btn);

    btn = document.createElement("BUTTON");   // Create a <button> element
    btn.innerHTML = "Disconnect"
    btn.addEventListener('click', function () {
        console.log("disconnecting")
        state.wsData.ws.close()
    });
    btn.style.cssText = disconnectButtonStyle
    divHeaderButtonToolBar.appendChild(btn);

    state.pageSettings.controlButtons.forEach((buttonSpec)=>{
        btn = document.createElement("BUTTON");   // Create a <button> element
        btn.id = buttonSpec.id
        btn.innerHTML = buttonSpec.name
        // btn.onclick = clearImage;
        btn.onclick = buttonSpec.fx;
        btn.style.cssText = tabButtonStyle
        divHeaderButtonToolBar.appendChild(btn);
    })

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
    
    let canvas = document.createElement("canvas");   // Create a <button> element
    canvas.id = "imageCanvasContainer";
    divCanvasContainer.appendChild(canvas);

    let divInformationBar = document.createElement("div")
    divInformationBar.id = "imageInformationBar";

    var btn = document.createElement("BUTTON");   // Create a <button> element
    btn.innerHTML = "Clear Image";
    btn.onclick = clearImage;
    divButtonToolBar.appendChild(btn);

    divCanvasContainer.addEventListener('mousemove', function(e) {
        getCursorPosition(canvas, e)
    });

    var mcoord = document.createElement("P");   // Create a <button> element
    mcoord.id = "mouseCoordinates";
    divInformationBar.appendChild(mcoord);

    divImageContainer.appendChild(divButtonToolBar)
    divImageContainer.appendChild(divCanvasContainer)
    divImageContainer.appendChild(divInformationBar)

    document.getElementsByTagName("body")[0].appendChild(divImageContainer);
}

function buildFigureContainer(){
    let divFigureContainer = document.createElement("div")
    divFigureContainer.id = "figureContainer";

    let divButtonToolBar = document.createElement("div")
    divButtonToolBar.id = "figureButtonToolBar";

    let divCanvasContainer = document.createElement("div")
    divCanvasContainer.id = "figureCanvasContainer";

    let divInformationBar = document.createElement("div")
    divInformationBar.id = "figureInformationBar";

    divFigureContainer.appendChild(divButtonToolBar)
    divFigureContainer.appendChild(divCanvasContainer)
    divFigureContainer.appendChild(divInformationBar)
    document.getElementsByTagName("body")[0].appendChild(divFigureContainer);

    divCanvasContainer.addEventListener('mousedown', function(e) {
        state.pageState.enablePlotUpdate = false
        console.log("disabling plot updates")
    });

    divCanvasContainer.addEventListener('mouseup', function(e) {
        state.pageState.enablePlotUpdate = true
        console.log("enabling plot updates")
    });
}
//TODO
function buildMiscContainer(){

}

function buildWebPage(){
    buildHeader()
    buildImageContainer()
    buildFigureContainer()
    buildMiscContainer()
    hideAllContainers()
}

// Main call function
(function() {

    buildWebPage();
    registerResizingCallbacks();
    registerImageOnLoad();
    initializePlotlyLayout();
    // create ws connection:
    tryToConnectToWS();
    registerWDCallbacks();


})();


