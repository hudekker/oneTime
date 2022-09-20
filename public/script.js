// import { myPeerOpen, addVideoStream, removeVideoElement } from './util.js';

// The room id is created by the server and redirects to this subdirectory which is the 'room'
// console.log(`ROOM_ID is ${ROOM_ID}`);
const roomId = document.URL.split('/')[3];
const videoGrid = document.getElementById('video-grid');
const peers = {};

// Use async wrapper because there are awaits
(async () => {

  // Get my peer object
  let myPeer = new Peer(null, {
    host: "evening-atoll-16293.herokuapp.com",
    port: 443,
    secure: true,
  });

  await myPeerOpen(myPeer);

  const myPeerId = myPeer.id;

  // Open up my video stream and add it to the screen
  let stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
    audio: true
  })

  addVideoStream(myPeerId, stream, videoGrid)

  // Initialize socket.  Server will receive a 'connection' event and wait on your 'join-room' event
  const socket = io('/');

  // Send server 'join-room' event, server will broadcast a 'peer-joined-room'
  socket.emit('join-room', roomId, myPeerId)

  // When a partner 'joins-room', you will receive a broacast'peer-joined-room'
  // Call that new peer using peerjs and send them your stream
  socket.on('peer-joined-room', ptnrPeerId => {

    // peerjs 'call' the new peer that just joined the room and send them your stream
    const call = myPeer.call(ptnrPeerId, stream)

    // peerjs on event 'stream', partner peer send you his stream
    call.on('stream', ptnrStream => addVideoStream(ptnrPeerId, ptnrStream, videoGrid))

    // peerjs on event 'close'
    call.on('close', () => removeVideoElement(ptnrPeerId))

    // log the ptrnPeerIds so you can remove them later
    peers[ptnrPeerId] = call
  })

  // Receive call from your peer(s).  This is due to your 'join-room' and peers receiving broadcast 'peer-joined-room'
  myPeer.on('call', call => {

    // partner Peer Id
    const ptnrPeerId = call.peer;

    // Answer the call and give them your stream
    call.answer(stream)

    // When partner sends you their stream, add it
    call.on('stream', ptnrStream => addVideoStream(ptnrPeerId, ptnrStream, videoGrid))

    // If peer closes, remove video element
    call.on('close', () => removeVideoElement(ptnrPeerId))

    // log the ptrnPeerIds so you can remove them later
    peers[ptnrPeerId] = call
  })

  // Socket sends 'peer-exited-room' event so call the peerjs close event for that ptnrPeer
  socket.on('peer-exited-room', ptnrPeerId => {
    console.log(`${ptnrPeerId} exited the room`);
    peers[ptnrPeerId]?.close()
  })

})();