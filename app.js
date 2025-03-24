console.log('Hello world!');

let wrongIndexes = [];
let status = 1; // 1 = entering clues, 2 = loading, 3 = end
let timeLeft = 1800000; // 30 minut

const clues = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6"
]

let storedClues, times;

window.onload = () => {
    update();
}

submit.addEventListener('click', addClue);

function addClue() {
    let input = document.getElementById('input');
    if (input.value) {
        // případně přidat validaci indicie
        storedClues.push(input.value);
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

function reset(){
    localStorage.clear();
    update();
    return 'Data byla smazána';
}

function update(percentage = ""){
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
                document.getElementById('clueList').innerHTML += `<div class="${wrongIndexes.includes(index) ? "wrong" : ""}"><button onClick="remove(${index})">Smazat</button>${times[index]} - ${clue}</div>`;
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
            <p>Na místo jsem poslal Seektrona, což je geneticky upravený brouk, který každou půl minutu vydává tři zvukové signály.<br>
            Až budete připraveni, můžete kliknout na tlačítko níže pro spuštění zvukových signálů. Hodně štěstí při hledání!</p>
            <button onClick="main.innerHTML += '<p>Seektron spuštěn</p>'">Spustit Seektrona</button>`
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

analyze.addEventListener('click', () => {
    wrongIndexes = [];
    storedClues.forEach((clue, index) => {
        if(clue !== clues[index]){
            wrongIndexes.push(index);
        }
    });
    if(wrongIndexes.length === 0){
        console.log('Všechny indicie jsou správně');
        status = 2;
        let count = 0;
        update(count);
        let interval = setInterval(() => {
            console.log(count);
            update(count);
            count++;
            if (count > 100) {
                clearInterval(interval); // Po 100 iteracích zastaví volání
                status = 3;
                update();
            }
        }, 18000 / 1000);
    } else {
        errorMessage.innerText = `Počítači se nepodařilo ze zadaných indicií nic vypátrat. Indicie vyznačené červeně jsou špatně.`;
        console.log(wrongIndexes);
        update();
    }

});