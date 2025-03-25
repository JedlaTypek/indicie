console.log('Hello world!');

let wrongIndexes = [];
let status = 1; // 1 = entering clues, 2 = loading, 3 = end
let timeLeft = 1800000; // 30 minut

const clues = [
    "orchidej muze za chyby v systemu",/*
    "jestli me odvedou jdete po mych stopach",
    "je tady vic jdete vic do hloubi",
    "budu mit novy domov",
    "jdu do bunkru snad me nenajdou",
    "vim o nich vse",
    "jsou tu vsude",
    "svet vs orchidej",
    "musim koncit",
    "vim kde jsou"*/
];

let storedClues, times;

window.onload = () => {
    update(localStorage.getItem("percentage"));
}

submit.addEventListener('click', addClue);

function addClue() {
    let input = document.getElementById('input');
    errorMessage.innerText = ''
    if (input.value) {
        // případně přidat validaci indicie
        if(storedClues.includes(input.value)){
            errorMessage.innerText = 'Tuto indicii už jsi zadal. Zadej jinou.'
        } else{
            storedClues.push(input.value.toLowerCase());
            localStorage.setItem("clues", JSON.stringify(storedClues));
            // přidání času
            let now = new Date();
            let hours = now.getHours();   // Hodiny (0-23)
            let minutes = now.getMinutes(); // Minuty (0-59)
            times.push(`${hours}:${String(minutes).padStart(2, "0")}`);
            localStorage.setItem("times", JSON.stringify(times));
            update();
        }
    }
}

function reset(){
    localStorage.clear();
    window.location.reload()
    return 'Data byla smazána';
}

function update(percentage = ""){
    let statusLocal = localStorage.getItem("status");
    if(statusLocal){
        status = parseInt(statusLocal);
    } else {
        localStorage.setItem("status", 1);
        status = 1;
    }
    if(status === 1){
        input.focus();
        input.value = '';
        storedClues = JSON.parse(localStorage.getItem("clues"));
        if(!storedClues){
            localStorage.setItem("clues", "[]");
            storedClues = JSON.parse(localStorage.getItem("clues"));
        }
        times = JSON.parse(localStorage.getItem("times"));
        if (!times) {
            localStorage.setItem("times", "[]");
            times = JSON.parse(localStorage.getItem("times"));
        }
        document.getElementById('allClues').innerText = clues.length;
        document.getElementById('clueCount').innerText = storedClues.length;
        document.getElementById('clueList').innerHTML = '';
        if(storedClues.length > 0){
            storedClues.forEach((clue, index) => {
                document.getElementById('clueList').innerHTML += `<div class="${wrongIndexes.includes(index) ? "wrong" : ""}"><p>${times[index]}</p><p class="clueText">${clue}</p><button onClick="remove(${index})">Smazat</button></div>`;
            });
        }
        if(storedClues.length === clues.length){
            analyze.disabled = false;
            submit.disabled = true;
        } else if(storedClues.length < clues.length){
            analyze.disabled = true;
            submit.disabled = false;
        }
        if(wrongIndexes.length == 0){
            errorMessage.innerText = '';
        }
    } else if(status === 2){
        main.innerHTML = `<h1>Načítání...</h1><h2>${percentage}%</h2>`;
    } else if(status === 3){
        main.innerHTML = `
            <h1>Povedlo se!</h1>
            <p class="align-center">Na místo jsem poslal Seektrona, což je geneticky upravený brouk, který každou půl minutu vydává tři zvukové signály.
            Až budete připraveni, můžete kliknout na tlačítko níže pro spuštění zvukových signálů. Hodně štěstí při hledání!</p>
            <button onClick="main.innerHTML += '<p class=align-center>Seektron spuštěn</p>'">Spustit Seektrona</button>`
    }
    
}

function loading(time){
        setTimeout(() => {
            // zobrazit závěrečnou zprávu
            console.log('Závěrečná zpráva');
        }, time);
}

function remove(index){
    storedClues.splice(index, 1);
    localStorage.setItem("clues", JSON.stringify(storedClues));
    times.splice(index, 1);
    localStorage.setItem("times", JSON.stringify(times));
    if (wrongIndexes.includes(index)) {
        wrongIndexes.splice(wrongIndexes.indexOf(index), 1);
    }
    wrongIndexes = wrongIndexes.map(wrongIndex => 
        wrongIndex > index ? wrongIndex - 1 : wrongIndex
    );
    update();
}

// Zkontroluj stav načítání po reloadu
function checkLoadingState() {
    let savedStatus = localStorage.getItem("status");
    let savedTime = localStorage.getItem("loadingStart");
    let savedPercentage = localStorage.getItem("percentage");

    if (savedStatus == 2 && savedTime) {
        let elapsed = Date.now() - parseInt(savedTime);
        let newPercentage = Math.min(100, Math.floor(elapsed / (timeLeft / 100))); // Půl hodiny -> 100%

        if (newPercentage >= 100) {
            status = 3;
            localStorage.setItem("status", status);
            update();
        } else {
            status = 2;
            localStorage.setItem("status", status);
            update(newPercentage);
            resumeLoading(newPercentage);
        }
    }
}

// Obnovení načítání po reloadu
function resumeLoading(startPercentage) {
    let count = startPercentage;
    let interval = setInterval(() => {
        count++;
        localStorage.setItem("percentage", count);
        update(count);
        if (count >= 100) {
            clearInterval(interval);
            status = 3;
            localStorage.setItem("status", status);
            update();
        }
    }, timeLeft / 100); // Každou sekundu přidá 1 % (30 minut / 100)
}

function analyzeClues() {
    wrongIndexes = [];
    storedClues.forEach((clue, index) => {
        if (!clues.includes(clue)) {
            wrongIndexes.push(index);
        }
    });

    if (wrongIndexes.length === 0) {
        console.log('Všechny indicie jsou správně');
        status = 2;
        localStorage.setItem("status", status);
        localStorage.setItem("loadingStart", Date.now()); // Uložit start loadingu
        update(0);
        resumeLoading(0);
    } else {
        errorMessage.innerText = `Některé indicie jsou špatně!`;
        update();
    }
}

analyze.addEventListener('click', analyzeClues);
checkLoadingState();
