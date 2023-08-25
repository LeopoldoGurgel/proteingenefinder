// var userGene = $('#geneInput').val
// var userSpecies = $('#speciesMenu').val


var NCBIAPIKey = 'd019ce82781c44b8ac9d2547bbc391e9a908';
var userGene = 'cftr'
var userSpecies = 'Human'


fetchAccessionID(userGene, userSpecies)

//gets accession number and PDB id of user search
function fetchAccessionID(geneName, speciesName) {
    fetch(`https://rest.uniprot.org/uniprotkb/search?query=${geneName}+AND+organism_name:${speciesName}+AND+reviewed:true&fields=accession,xref_pdb&format=json&size=5`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var uniprotAccessionCode = data.results[0].primaryAccession
            var pdbID = (data.results[0].uniProtKBCrossReferences[0].id).toLowerCase();

            //ALWAYS RAN
            //get pdb image
            getPDBImg(pdbID)
            //retrieve uniprot info for card 1 (gene name, protein name, organism, amino acid length + basic summary)
            getUniProtCard1(uniprotAccessionCode)


            //get genbank UID and info
            fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${uniprotAccessionCode}&api_key=${NCBIAPIKey}&retmode=json&retmax=1`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    var genbankUID = data.esearchresult.idlist;

                    //ALWAYS RAN
                    //get genbank info for card 1 
                    getGenbankCard1(genbankUID, NCBIAPIKey)

                });



            // call all other fetches (add if statement for advance search)

        });
}




//get PDB Img
function getPDBImg(ID) {
fetch(`https://cdn.rcsb.org/images/structures/${ID}_assembly-1.jpeg`)
.then(function (response) {
    return response.blob();
})
.then(function (blob) {
    var imageUrl = URL.createObjectURL(blob); // Create an object URL from the Blob
    var pdbImgEl = $('#pdbImg'); // Get the image element
    pdbImgEl.attr('src', imageUrl); // Set the src attribute of the image element
});
}

//get uniprot info for card 1
function getUniProtCard1(accessionCode) {
    fetch(`https://rest.uniprot.org/uniprotkb/${accessionCode}?format=json&fields=organism_name,protein_name,length&size=1`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
        var proteinName = data.proteinDescription.recommendedName.fullName.value
        var AALength = data.sequence.length;
        console.log("amino acid length --> " + AALength)
        $("#aaDisplay").text(AALength);
        console.log("protein name --> " + proteinName)
        $("#proteinDisplay").text(proteinName);
    });
}

function getGenbankCard1(genbankID, key) {
    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${genbankID}&api_key=${key}&retmode=json`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
        
        var geneSummary = data.result[`${genbankID}`].summary
        $('#bsDisplay').text(geneSummary);

        var geneName = data.result[`${genbankID}`].name;
        $("#geneNameDisplay").text(geneName);

        var organismCommon = data.result[`${genbankID}`].organism.commonname;
        var organismScientific = data.result[`${genbankID}`].organism.scientificname;
        $("#organismDisplay").text(organismCommon + " (" + organismScientific + ")"); 

        var geneLocation = data.result[`${genbankID}`].maplocation
        console.log("gene location --> " + geneLocation);

        var exonCount = data.result[`${genbankID}`].genomicinfo[0].exoncount
        console.log("exons --> " + exonCount);

        var geneLength = ((data.result[`${genbankID}`].genomicinfo[0].chrstop)-(data.result[`${genbankID}`].genomicinfo[0].chrstart))/1000
        console.log("gene length -->" + geneLength + " kb")

        var geneTitle = data.result[`${genbankID}`].name + " (" + data.result[`${genbankID}`].organism.scientificname + ")"
        console.log(geneTitle);
    });
}

