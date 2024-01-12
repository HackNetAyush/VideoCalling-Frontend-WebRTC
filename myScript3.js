const signalingServerUrl = 'https://signaling-server-um62.onrender.com';
const socket = io.connect(signalingServerUrl);
let pc; //PeerConnection
var localVideo = document.getElementById("localVideo");
var localVideo2 = document.getElementById("localVideo2");
localVideo.style.transform = "scaleX(-1)";
localVideo2.style.transform = "scaleX(-1)";
var remoteVideo = document.getElementById("remoteVideo")
var remoteVideo2 = document.getElementById("remoteVideo2")
var stat = document.getElementById("hash_code")

stat.innerText = "Connecting to server"



socket.on('connect', () => {
  console.log('Connected to signaling server');
  stat.innerText = "Connected to server"


  if (!location.hash) {
    socket.emit("checkAvailableRooms")
    socket.on("availableRooms", (roomsList) => {
      console.log(roomsList)
      if (roomsList.length > 0) {
        const randomIndex = Math.floor(Math.random() * roomsList.length);
        location.hash = roomsList[randomIndex]
        var roomHash = location.hash.substring(1);
        socket.emit('joinRoom', roomHash);
        console.log("Location Hash: ", location.hash, "Room List Index Elem: ", roomHash)
        // document.getElementById("hash_code").innerHTML = "Code: #" + location.hash.slice(1);
        startWebRTC(true)

      } else {
        location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
        var roomHash = location.hash.substring(1);
        socket.emit('joinRoom', roomHash);
        // document.getElementById("hash_code").innerHTML = "Code: #" + location.hash.slice(1);
        startWebRTC(true)

      }
    })

  } else {
    startWebRTC(true)
    var roomHash = location.hash.substring(1);
    socket.emit("joinRoom", roomHash)
    // document.getElementById("hash_code").innerHTML = "Code: #" + location.hash.slice(1);
  }

});

socket.on('userJoined', (userId) => {
  console.log(`User ${userId} joined the room`);
});

socket.on("roomFull", (room) => {
  console.log(`Room ${room} is full!`);
  alert(`Room ${room} is full! Now you are being redirected to some other room.`);
  window.location.replace("./")
})


function remove(arr, elementToRemove) {
  const indexToRemove = arr.indexOf(elementToRemove);

  if (indexToRemove !== -1) {
    arr.splice(indexToRemove, 1);
    // console.log(`Removed element ${elementToRemove} from the array:`, arr);
  } else {
    console.log(`Element ${elementToRemove} not found in the array.`);
  }
}




var memberCount = 1;

// socket.on("availableRooms", (roomsList) => {
//   var roomHash = location.hash.substring(1);
//   remove(roomsList, roomHash)
//   console.log(roomsList);
// });

// function getMemberCount(memberCount) {
//   if (memberCount === 1) {
//     socket.emit("checkAvailableRooms");
//     console.log("Only one member!");
//   }
// }

// setInterval(()=>{getMemberCount(memberCount)}, 4000);


socket.on("lastConnected",()=>{
  // console.log("Last Connected User!")
  console.log("Partner Joined!")
  memberCount = memberCount + 1;
  startWebRTC(true)
  // init()
  var roomHash = location.hash.substring(1);
  socket.emit("lastUserConnected",roomHash)
  stat.innerText = "You are now talking to a stranger!"

})


const configuration = {
  iceServers: [{
    urls: 'stun:stun.l.google.com:19302'
  }]
};

socket.on('disconnect', () => {
  console.log('Connection to signaling server closed');
  stat.innerText = "Server disconnected :("
});

socket.on('userDisconnected', (userId) => {
  console.log(`User ${userId} disconnected`);
  stat.innerText = "User disconnected";
  memberCount = memberCount - 1;
  window.location.replace("./")
});

// From Legacy script, their room = our socket

function onSuccess() {
  // window.alert('Connection Success!');
}

function onError(error) {
  console.error(error);
  // window.alert('Connection Error: '+error);
}

function sendMessage(msg) {
  socket.emit("messageFromClient", msg)
}




async function startWebRTC(isOfferer) {
    pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = event => {
        if (event.candidate) {
            sendMessage({ type: "candidate", value: event.candidate });
        }
    };

    if (isOfferer) {
        pc.onnegotiationneeded = async () => {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                sendMessage({ type: "sdp", value: pc.localDescription });
            } catch (error) {
                onError(error);
            }
        };
    }

    pc.onaddstream = event => {
        remoteVideo.srcObject = event.stream;
        remoteVideo2.srcObject = event.stream;
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });

        // const stream = await adapter.browserShim.shimGetUserMedia({
        //   audio: true,
        //   video: true
        // });

        localVideo.srcObject = stream;
        localVideo2.srcObject = stream;

        pc.addStream(stream);
    } catch (error) {
        onError(error);
    }

    socket.on("message", async (msg) => {
        // if (msg[0] === socket.id) {
        //     return;
        // }

        if (msg[1].type === "sdp") {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(msg[1].value));

                if (pc.remoteDescription.type === 'offer') {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sendMessage({ type: "sdp", value: pc.localDescription });
                }
            } catch (error) {
                onError(error);
            }
        } else if (msg[1].type === "candidate") {
            try {
                if (pc.remoteDescription) {
                    await pc.addIceCandidate(new RTCIceCandidate(msg[1].value));
                    onSuccess();
                } else {
                    console.warn("Remote description not set yet. Ignoring ICE candidate.");
                }
            } catch (error) {
                onError(error);
            }
        }
    });
}



function localDescCreated(desc) {
  pc.setLocalDescription(desc,() => sendMessage({type:"sdp",value:pc.localDescription}),
      onError
  );
}




var lv = document.getElementById("localVideo")
var rv = document.getElementById("remoteVideo")
var lv2 = document.getElementById("lv2_div")
var rv2 = document.getElementById("rv2_div")

lv2.onclick = function(){
  lv2.style.display = "none"
  rv2.style.display = "flex"

  rv.style.display = "none"
  lv.style.display = "flex"
}

rv2.onclick = function(){
  rv2.style.display = "none"
  lv2.style.display = "flex"

  rv.style.display = "flex"
  lv.style.display = "none"
}


var resize_btn = document.getElementById("resize_btn")
var resize_status = 0

resize_btn.onclick = function(){
  if (resize_status == 0){
    lv.style.width = "auto"
    rv.style.width = "auto"
    resize_status = 1
  } else if (resize_status == 1){
    lv.style.width = "100%"
    rv.style.width = "100%"
    resize_status = 0
  }
}





// document.getElementById("endcall").onclick = function(){
//   window.close();
// }


document.getElementById("swap").onclick = function(){
  window.location.replace("./");
}
