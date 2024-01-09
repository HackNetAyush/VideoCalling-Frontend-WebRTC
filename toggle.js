window.onload = function(){
  var localVideo = document.getElementById("localVideo");
  var localVideo2 = document.getElementById("localVideo2");

  var cam = document.getElementById("cam");
  var mic = document.getElementById("mic");
    
  cam.onclick = toggleCam;
  mic.onclick = toggleMic;

  console.log(localVideo);
  console.log(localVideo2);

  function toggleCam(){
    if (!localVideo.srcObject || !localVideo2.srcObject) {
      return;
    }
    localVideo.srcObject.getVideoTracks()[0].enabled = !localVideo.srcObject.getVideoTracks()[0].enabled;
    
    if (localVideo.srcObject.getVideoTracks()[0].enabled){
      document.getElementById('cam_icon').setAttribute("name","videocam");
    } else {
      document.getElementById('cam_icon').setAttribute("name","videocam-off");
    }
  }

  function toggleMic(){
    if (!localVideo.srcObject || !localVideo2.srcObject) {
      return;
    }
    localVideo.srcObject.getAudioTracks()[0].enabled = !localVideo.srcObject.getAudioTracks()[0].enabled;
    
    if (localVideo.srcObject.getAudioTracks()[0].enabled){
      document.getElementById('mic_icon').setAttribute("name","mic");
    } else {
      document.getElementById('mic_icon').setAttribute("name","mic-off");
    }
  }

  
};