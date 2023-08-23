// var userGene = $('#geneInput').val
// var userSpecies = $('#speciesMenu').val

console.log ()
var userGene = 'cftr'
var userSpecies = 'Human'


var x = fetchAccessionID(userGene, userSpecies)

//gets accession number and PDB id of user search
function fetchAccessionID(geneName, speciesName){
fetch(`https://rest.uniprot.org/uniprotkb/search?query=${geneName}+AND+${speciesName}+AND+reviewed:true&fields=accession,xref_pdb&format=json&size=1`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
        uniprotAccessionCode = data.results[0].primaryAccession
        pdbID = (data.results[0].uniProtKBCrossReferences[0].id).toLowerCase();
        console.log(pdbID)

        // call all other fetches
        fetchPDBImg(pdbID)
    });
}


// retrieve PDB image of protein product
function fetchPDBImg(imgID){
    fetch(`https://cdn.rcsb.org/images/structures/${imgID}_assembly-1.jpeg`)
    .then(function (response) {
        return response.blob();
    })
    .then(function (blob) {
        console.log(blob)
        var imageUrl = URL.createObjectURL(blob); // Create an object URL from the Blob
        var pdbImgEl = $('#pdbImg'); // Get the image element
        pdbImgEl.attr('src', imageUrl); // Set the src attribute of the image element
    });
}

fetch(`https://rest.uniprot.org/uniprotkb/search?query=${geneName}+AND+${speciesName}+AND+reviewed:true&fields=accession,xref_pdb&format=json&size=1`)
    .then(function (response) {
        return response.json();
    })