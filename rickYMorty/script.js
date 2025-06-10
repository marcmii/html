let name = document.getElementById("nom");
let img = document.getElementById("perImg");
let especie = document.getElementById("especie");
let genere = document.getElementById("genere");
let origen = document.getElementById("origen");
let loading = document.getElementById("loading");
let errorMsg = document.getElementById("error");

function cercar() {
    removeResult();
    loading.style.display = "block";  

    let nom = document.getElementById("personatge").value;
    fetch("https://rickandmortyapi.com/api/character/?name=" + nom)
        .then(res => res.json())
        .then(data => {
         document.getElementById("per").style.visibility = "visible"; 

            loading.style.display = "none";
            

            if (data.results && data.results.length > 0) {
                img.src = data.results[0].image;
                name.textContent = "Nom: " + data.results[0].name;
                especie.textContent = "Espècie: " + data.results[0].species;
                genere.textContent = "Gènere: " + data.results[0].gender;
                origen.textContent = "Origen: " + data.results[0].origin.name;
                errorMsg.textContent = "";
            } else {
                error();
            }
        })
        .catch(() => {
            loading.style.display = "none"; 
            error();
        });

    setTimeout(() => {
        document.getElementById("personatge").value = "";
    }, 3000);
}

function removeResult() {
    name.textContent = "";
    img.src = "";
    especie.textContent = "";
    genere.textContent = "";
    origen.textContent = "";
    errorMsg.textContent = "";
}

function error() {
    errorMsg.textContent = "No s'ha trobat cap personatge amb aquest nom";
}

setInterval(() => {
    errorMsg.textContent = "";
}, 5000);