console.log('Welcome in spotify clone');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formatedMinutes}:${formatedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //Show all the songs in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li>
                 <div class="info gap-10 flex items-center">
                 <img src="Images/MusicControls/Music.svg" alt="Music">
                     <div>${song.replaceAll("%20", " ")} </div>
                 </div>
                 <div class="playnow">
                     <span>Play now</span>
                     <span class="play-control-button flex justify-center items-center"><img
                             src="Images/MusicControls/play.svg" alt="Play button"></span>
                 </div>
         </li>`;
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").lastElementChild.innerHTML.trim());
        })
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "Images/MusicControls/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/songs/").slice(-1)[0];

            //get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card1 card2 bg-gray available">
                        <div class="play-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60">
                                <circle cx="12" cy="12" r="10" fill="#00C853" /> <!-- Green circle -->
                                <path d="M9.5 8.8L15.5 12L9.5 15.2V8.8Z" fill="#000000" /> <!-- Black play icon -->
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpg">
                        <p class="card-text1">${response.title}</p>
                        <p class="card-text2">${response.description}</p>
                    </div>`;
        }
    }
}

async function main() {
    //Get the list of all song
    await getSongs("songs/krishna-songs");
    playMusic(songs[0], true);

    //Display all the albums on the page
    displayAlbums()

    //Attach an event listener to play and pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "Images/MusicControls/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "Images/MusicControls/play.svg"
        }
    })

    //Listen for time update function
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".seekbar-circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add event listener to seekbar  
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".seekbar-circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //Add event listener to previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) > 1) {
            playMusic(songs[index - 1]);
        }

    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute", "sound")
        }
    })

    //Load Playlist whenever clicked album and artist section
    document.querySelector(".cardContainer").addEventListener("click", async event => {
        if (event.target.closest(".available")) {
            const item = event.target.closest(".available");
            songs = await getSongs(`Songs/${item.dataset.folder}`);
            playMusic(songs[0])
        }
    });

    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("sound.svg")) {
            e.target.src = e.target.src.replace("sound", "mute");
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute", "sound");
            currentSong.volume = .20
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })

    // Automatically play next song when current song ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });
    document.addEventListener("keydown", (event) => {
        switch (event.code) {
            case "Space": // Play/Pause with the Space key
                event.preventDefault(); // Prevent the page from scrolling
                if (currentSong.paused) {
                    currentSong.play();
                    play.src = "Images/MusicControls/pause.svg";
                } else {
                    currentSong.pause();
                    play.src = "Images/MusicControls/play.svg";
                }
                break;

            case "ArrowRight": // Next song with the Right Arrow key
                let nextIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]) + 1;
                if (nextIndex < songs.length) {
                    playMusic(songs[nextIndex]);
                }
                break;

            case "ArrowLeft": // Previous song with the Left Arrow key
                let prevIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]) - 1;
                if (prevIndex >= 0) {
                    playMusic(songs[prevIndex]);
                }
                break;

            case "ArrowUp": // Increase volume with the Up Arrow key
                event.preventDefault();
                currentSong.volume = Math.min(currentSong.volume + 0.1, 1); // Increase volume by 10%, max 100%
                document.querySelector(".range").getElementsByTagName("input")[0].value = currentSong.volume * 100;
                document.querySelector(".volume>img").src = "Images/MusicControls/sound.svg"; // Update volume icon if muted
                break;

            case "ArrowDown": // Decrease volume with the Down Arrow key
                event.preventDefault();
                currentSong.volume = Math.max(currentSong.volume - 0.1, 0); // Decrease volume by 10%, min 0%
                document.querySelector(".range").getElementsByTagName("input")[0].value = currentSong.volume * 100;
                if (currentSong.volume === 0) {
                    document.querySelector(".volume>img").src = "Images/MusicControls/mute.svg"; // Update volume icon if volume is 0
                }
                break;
        }
    });
}

main()