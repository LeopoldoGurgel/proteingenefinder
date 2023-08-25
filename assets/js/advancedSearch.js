
// Opens and closes the modal Box
var advSearchBtn = document.getElementById("advSearchBtn");
var advSearchBox = document.getElementById("advSearchBox");
var closeBtn = document.getElementById("closeBtn");
var modalBg = document.getElementById("modalBg");

advSearchBtn.addEventListener("click", function(event){
    event.preventDefault();
    advSearchBox.classList.add("is-active");
});

closeBtn.addEventListener("click", function(event){
    event.preventDefault();
    event.stopPropagation();
    advSearchBox.classList.remove("is-active");
});

modalBg.addEventListener("click", function(event){
    event.preventDefault();
    event.stopPropagation();
    advSearchBox.classList.remove("is-active");
});


// hide or show the selected cards

var summaryTC = document.getElementById("summaryTC");
var summaryBox = document.getElementById("summaryBox");
var phenotypesTC = document.getElementById("phenotypesTC");
var phenotypesBox = document.getElementById("phenotypesBox");
var phenotypesCB = document.getElementById("phenotypesCB");
var publicationsTC = document.getElementById("publicationsTC");
var publicationsBox = document.getElementById("publicationsBox");
var publicationsCB = document.getElementById("publicationsCB");
var expressionTC = document.getElementById("expressionTC");
var expressionCB = document.getElementById("expressionCB");
var expressionBox = document.getElementById("expressionBox");
var aaTC = document.getElementById("aaTC");
var aaCB = document.getElementById("aaCB");
var aaBox = document.getElementById("aaBox");
var blustTC = document.getElementById("blastTC");
var blustCB = document.getElementById("blastCB");
var blustBox = document.getElementById("blastBox");
var interactionsTC = document.getElementById("interactionsTC");
var interactionsCB = document.getElementById("interactionsCB");
var interactionsBox = document.getElementById("interactionsBox");

phenotypesCB.addEventListener("change",function(){
    if(phenotypesCB.checked){
        phenotypesBox.classList.remove("hidden");
        phenotypesTC.classList.remove("hidden");
    }else{
        phenotypesBox.classList.add("hidden");
        phenotypesTC.classList.add("hidden");
    }
})

publicationsCB.addEventListener("change",function(){
    if(publicationsCB.checked){
        publicationsBox.classList.remove("hidden");
        publicationsTC.classList.remove("hidden");
    }else{
        publicationsBox.classList.add("hidden");
        publicationsTC.classList.add("hidden");
    }
})

expressionCB.addEventListener("change",function(){
    if(expressionCB.checked){
        expressionBox.classList.remove("hidden");
        expressionTC.classList.remove("hidden");
    }else{
        expressionBox.classList.add("hidden");
        expressionTC.classList.add("hidden");
    }
})

aaCB.addEventListener("change",function(){
    if(aaCB.checked){
        aaBox.classList.remove("hidden");
        aaTC.classList.remove("hidden");
    }else{
        aaBox.classList.add("hidden");
        aaTC.classList.add("hidden");
    }
})

blustCB.addEventListener("change",function(){
    if(blustCB.checked){
        blustBox.classList.remove("hidden");
        blustTC.classList.remove("hidden");
    }else{
        blustBox.classList.add("hidden");
        blustTC.classList.add("hidden");
    }
})

interactionsCB.addEventListener("change",function(){
    if(interactionsCB.checked){
        interactionsBox.classList.remove("hidden");
        interactionsTC.classList.remove("hidden");
    }else{
        interactionsBox.classList.add("hidden");
        interactionsTC.classList.add("hidden");
    }
})

// adv serach added