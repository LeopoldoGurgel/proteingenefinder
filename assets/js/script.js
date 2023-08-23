var userGene = document.getElementById("geneInput").value;
var userSpecies = document.getElementById("speciesMenu").value;
var uniprotAccessionCode;
var pdbID;


//gets accession number and PDB id of user search
fetch(`https://rest.uniprot.org/uniprotkb/search?query=${userGene}+AND+${userSpecies}+AND+reviewed:true&fields=accession,xref_pdb&format=json&size=1`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
        uniprotAccessionCode = data.results[0].primaryAccession
        pdbID = (data.results[0].uniProtKBCrossReferences[0].id).toLowerCase();
        console.log(pdbID);
        getPDBImg(pdbID);
    });


// retrieve PDB image of protein product
var getPDBImg = function (imgID){
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
