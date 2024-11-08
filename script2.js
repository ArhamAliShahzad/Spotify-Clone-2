console.log('lets start javascript');
let currentSong = new Audio();
let songs;
let currFolder;

// document.addEventListener("contextmenu", function (e) {
//     e.preventDefault();
// });

document.addEventListener("dblclick", function (e) {
    e.preventDefault();  // Prevents any default double-click behavior
});

document.querySelectorAll("img, a, .myClass").forEach((element) => {
    element.addEventListener("dblclick", function (e) {
        e.preventDefault();
    });
});

// document.addEventListener('contextmenu', function (event) {
//     event.preventDefault();
// });

function formatTime(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`;

}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/ ${folder}/`)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".song-info").innerHTML = track.replaceAll("%20", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function main() {
    // get the list of all these songs
    songs = await getSongs("songs/ncs")
    playMusic(songs[1], true)
    // show all songs in the playlist 
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="music">
                            <div class="info">
                                <div class="songn">${song.replaceAll("%20", " ")}</div>
                                <div class="songar">Atif Aslam</div>
                            </div>
                            <img src="play.svg" class="invert" alt=""></li>`;
    }

    // Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    // Attach an event listner to play next & previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listner on the seek bar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listner for hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listner on close icon
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listner to previous 
    previous.addEventListener("click", () => {

        // console.log("previous clicked")
        // console.log(currentSong.src)

        let index = songs.indexOf(currentSong.src.split("/").slice("-1")[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    // Add an event listner to next
    next.addEventListener("click", () => {
        // currentSong.pause()
        // console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice("-1")[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event listner to the volume seek bar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        console.log("setting volume to", e.target.value, "/ 100")
    })

    // Load the Album when anyone click on it
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })


}

main()