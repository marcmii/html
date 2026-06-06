let video;
let poseNet;
let poses = [];

let jocComencat = false;
let puntuacio = 0;
let temps = 60;
let objectes = [];
let missatgeFinal = "";

let botoX = 480;
let botoY = 270;
let botoAmplada = 260;
let botoAltura = 100;

let audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3");

function setup() {
    createCanvas(960, 540);

    video = createCapture(VIDEO);
    video.size(960, 540);
    video.hide();

    poseNet = ml5.poseNet(video, modelCarregat);
    poseNet.on("pose", gotPoses);

    audio.loop = true;
    textFont("Arial");
}

function modelCarregat() {
    console.log("PoseNet carregat!");
}

function gotPoses(results) {
    poses = results;
}

function draw() {
    image(video, 0, 0, width, height);
    dibuixaFonsTransparent();
    dibuixaMansIPeus();

    if (jocComencat == false) {
        dibuixaBotoInici();
        comprovaBotoInici();
        dibuixaMissatgeFinal();
    } else {
        mouObjectes();
        dibuixaObjectes();
        comprovaObjectesTocats();
        dibuixaMarcador();
        controlaTemps();
    }
}

function dibuixaFonsTransparent() {
    fill(0, 0, 0, 70);
    noStroke();
    rect(0, 0, width, height);
}

function dibuixaBotoInici() {
    fill(28, 196, 96);
    stroke(255);
    strokeWeight(4);
    rectMode(CENTER);
    rect(botoX, botoY, botoAmplada, botoAltura, 12);
    rectMode(CORNER);

    fill(255);
    noStroke();
    textSize(42);
    textAlign(CENTER, CENTER);
    text("INICI", botoX, botoY);

    textSize(22);
    text("Toca el boto amb les dues mans", width / 2, botoY + 90);
}

function comprovaBotoInici() {
    if (poses.length > 0) {
        let pose = poses[0].pose;
        let maEsquerra = buscaPunt(pose, "leftWrist");
        let maDreta = buscaPunt(pose, "rightWrist");

        if (maEsquerra != null && maDreta != null) {
            if (dinsBoto(maEsquerra) == true && dinsBoto(maDreta) == true) {
                comencaJoc();
            }
        }
    }
}

function comencaJoc() {
    jocComencat = true;
    puntuacio = 0;
    temps = 60;
    objectes = [];
    missatgeFinal = "";

    audio.currentTime = 0;
    let promesaAudio = audio.play();

    if (promesaAudio !== undefined) {
        promesaAudio.catch(function() {
            console.log("El navegador ha bloquejat la musica fins que es faci un clic a la pagina.");
        });
    }

    for (let i = 0; i < 8; i++) {
        creaObjecte();
    }
}

function creaObjecte() {
    let objecte = {
        x: random(40, width - 40),
        y: random(-500, -40),
        mida: random(32, 58),
        velocitat: random(2, 7),
        colorR: random(80, 255),
        colorG: random(80, 255),
        colorB: random(80, 255)
    };

    objectes.push(objecte);
}

function mouObjectes() {
    for (let i = 0; i < objectes.length; i++) {
        objectes[i].y = objectes[i].y + objectes[i].velocitat;

        if (objectes[i].y > height + objectes[i].mida) {
            objectes[i].x = random(40, width - 40);
            objectes[i].y = random(-250, -40);
            objectes[i].velocitat = random(2, 7);
        }
    }
}

function dibuixaObjectes() {
    for (let i = 0; i < objectes.length; i++) {
        fill(objectes[i].colorR, objectes[i].colorG, objectes[i].colorB);
        stroke(255);
        strokeWeight(3);
        ellipse(objectes[i].x, objectes[i].y, objectes[i].mida, objectes[i].mida);
    }
}

function comprovaObjectesTocats() {
    if (poses.length > 0) {
        let pose = poses[0].pose;
        let punts = ["leftWrist", "rightWrist", "leftAnkle", "rightAnkle"];

        for (let i = 0; i < objectes.length; i++) {
            for (let j = 0; j < punts.length; j++) {
                let punt = buscaPunt(pose, punts[j]);

                if (punt != null) {
                    let distancia = dist(punt.position.x, punt.position.y, objectes[i].x, objectes[i].y);

                    if (distancia < objectes[i].mida / 2 + 22) {
                        puntuacio = puntuacio + 10;
                        objectes[i].x = random(40, width - 40);
                        objectes[i].y = random(-350, -40);
                        objectes[i].velocitat = random(2, 7);
                        j = punts.length;
                    }
                }
            }
        }
    }
}

function dibuixaMansIPeus() {
    if (poses.length > 0) {
        let pose = poses[0].pose;
        let punts = ["leftWrist", "rightWrist", "leftAnkle", "rightAnkle"];

        for (let i = 0; i < punts.length; i++) {
            let punt = buscaPunt(pose, punts[i]);

            if (punt != null) {
                fill(255, 50, 50);
                noStroke();
                ellipse(punt.position.x, punt.position.y, 26, 26);
            }
        }
    }
}

function dibuixaMarcador() {
    fill(0, 0, 0, 140);
    noStroke();
    rect(0, 0, width, 70);

    fill(255);
    textSize(30);
    textAlign(LEFT, CENTER);
    text("Punts: " + puntuacio, 25, 35);

    textAlign(RIGHT, CENTER);
    text("Temps: " + temps, width - 25, 35);
}

function controlaTemps() {
    if (frameCount % 60 == 0) {
        temps = temps - 1;
    }

    if (temps <= 0) {
        finalJoc();
    }
}

function finalJoc() {
    jocComencat = false;
    audio.pause();
    missatgeFinal = "Puntuacio final: " + puntuacio;
}

function dibuixaMissatgeFinal() {
    if (missatgeFinal != "") {
        fill(255);
        noStroke();
        textSize(34);
        textAlign(CENTER, CENTER);
        text(missatgeFinal, width / 2, 90);
    }
}

function buscaPunt(pose, nomPunt) {
    for (let i = 0; i < pose.keypoints.length; i++) {
        if (pose.keypoints[i].part == nomPunt && pose.keypoints[i].score > 0.2) {
            return pose.keypoints[i];
        }
    }

    return null;
}

function dinsBoto(punt) {
    if (punt.position.x > botoX - botoAmplada / 2 &&
        punt.position.x < botoX + botoAmplada / 2 &&
        punt.position.y > botoY - botoAltura / 2 &&
        punt.position.y < botoY + botoAltura / 2) {
        return true;
    } else {
        return false;
    }
}
