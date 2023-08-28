// global variables
var leosAge = calcAge("1988-11-15");
var rileysAge = calcAge("2001-10-17");



// function declarations
function calcAge(birthday){
    var currentDate = new Date();
    var bday = new Date(birthday);

    var age = currentDate.getFullYear() - bday.getFullYear();

    if(currentDate.getMonth() < bday.getMonth() ||
    (currentDate.getMonth() === bday.getMonth() && 
    currentDate.getDate() < bday.getDate())){
        return age -1;
    }
    return age;
}


// html population

$("#leosAge").text(leosAge);
$("#rileysAge").text(rileysAge)
