let countDownDate = new Date("Aug 7, 2024 14:00:00").getTime(); // will change the date accordingly

let timer = setInterval(() => {
    let now = new Date().getTime();
    let diff = countDownDate - now;

    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timerText = `${days}d:${hours}h:${minutes}m:${seconds}s`;
    document.querySelector("#timer span").innerHTML = timerText;
    
    if (diff < 0) {
        clearInterval(timer);
        document.querySelector("#timer span").innerHTML = "Starting Soon";
    }
}, 1000);
