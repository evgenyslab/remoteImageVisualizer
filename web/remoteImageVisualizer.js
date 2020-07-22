msgpack = require("msgpack-lite");


var ws = new WebSocket("ws://0.0.0.0:8890");

console.log("Attempting connection");
ws.onopen = ()=>{
    console.log("Connected")
};

ws.onmessage = function (event) {
      var reader = new FileReader();
            // arrow function to retain 'this' & handle byte array conversion + pass to decoder:
            reader.onload = (e) =>{
                // buffer = new Uint8Array(e.target.result);  // <-- OLD!
                // binary decoding works! just need to pack correctly...
                var decoded = msgpack.decode(new Uint8Array(e.target.result));
                //  send image to its own function:
                console.log("Decoded msgpack: ");
                for(p in decoded) {
                    if (p == "image")
                        updateImage(decoded["image"]);
                    else
                        console.log (p, decoded[p])
                }
            };
            // call function to decode data:
            reader.readAsArrayBuffer(event.data);
};

updateImage = (data) =>{
    // console.log("Made it here");
    // console.log(typeof(data));
    // console.log(data);
    var blob = new Blob ([data]);
    // console.log(blob);
    document.querySelector("#image").src = URL.createObjectURL(blob);
};