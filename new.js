console.log('lets start javascript');
let currentSong = new Audio();
let songs;
let currFolder;

// Prevent default double-click behavior on the entire document
document.addEventListener("dblclick", function (e) {
    e.preventDefault();
});

document.querySelectorAll("img, a, .myClass").forEach((element) => {
    element.addEventListener("dblclick", function (e) {
        e.preventDefault();
    });
});

// Format time into "MM:SS"
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch list of songs
async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let text = await response.text();
        console.log(text);

        let div = document.createElement("div");
        div.innerHTML = text;
        let links = div.getElementsByTagName("a");
        songs = [];
        
        for (let link of links) {
            if (link.href.endsWith(".mp3")) {
                songs.push(link.href.split(`/${folder}/`)[1]);
            }
        }
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

// Play music track
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".song-info").innerHTML = track.replaceAll("%20", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Main function
async function main() {
    // Fetch and play songs
    songs = await getSongs("songs/ncs");
    playMusic(songs[1], true);

    // Populate song list
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    let songHTML = "";
    for (const song of songs) {
        songHTML += `<li>
                        <img class="invert" src="music.svg" alt="music">
                        <div class="info">
                            <div class="songn">${song.replaceAll("%20", " ")}</div>
                            <div class="songar">Atif Aslam</div>
                        </div>
                        <img src="play.svg" class="invert" alt="">
                     </li>`;
    }
    songUL.innerHTML = songHTML;

    // Add click event listeners for song selection
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    // Play, pause, previous, and next button references
    const play = document.getElementById("play");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");

    // Play/pause toggle
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Update song time and seek bar
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = formatTime(currentSong.currentTime);
        const duration = isNaN(currentSong.duration) ? "00:00" : formatTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${duration}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seek bar click event
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Show/hide sidebar on hamburger and close click
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous track
    previous.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Next track
    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Volume control
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        console.log("Setting volume to", e.target.value, "/ 100");
    });
}

main();