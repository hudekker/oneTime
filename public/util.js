const myPeerOpen = (myPeer) => {
    return new Promise((resolve, reject) => {
        myPeer.on('open', id => resolve(id))
    })
}

const addVideoStream = (peerId, stream, videoGrid) => {
    if (document.querySelector(`video[data-peer-id="${peerId}"]`)) return

    const video = document.createElement('video')
    video.srcObject = stream
    video.dataset.peerId = peerId;
    video.setAttribute("playsinline", true);
    videoGrid.append(video)

    video.addEventListener('loadedmetadata', () => video.play())
}

const removeVideoElement = (peerId) => {
    [...document.querySelectorAll(`[data-peer-id = "${peerId}"]`)]?.map(el => {
        el.remove()
    })
}
