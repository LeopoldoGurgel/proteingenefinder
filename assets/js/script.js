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
            console.log(data)
            var uniprotAccessionCode = data.results[0].primaryAccession
            var pdbID = (data.results[0].uniProtKBCrossReferences[0].id).toLowerCase();
            console.log(uniprotAccessionCode)
            console.log(pdbID)

            //these fetches are ALWAYS called (card1 genbank ID)
            //get genbank UID and summary!
            fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${uniprotAccessionCode}&api_key=${NCBIAPIKey}&retmode=json&retmax=1`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data)
                    var genbankUID = data.esearchresult.idlist;
                    console.log(genbankUID)

                    //get genbank summary as var geneSummary!
                    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${genbankUID}&api_key=${NCBIAPIKey}&retmode=json`)
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (data) {
                            var geneSummary =  data.result[`${genbankUID}`].summary
                            console.log(geneSummary)
                        });
                });
            //get pdb image
            fetch(`https://cdn.rcsb.org/images/structures/${pdbID}_assembly-1.jpeg`)
                .then(function (response) {
                    return response.blob();
                })
                .then(function (blob) {
                    console.log(blob)
                    var imageUrl = URL.createObjectURL(blob); // Create an object URL from the Blob
                    var pdbImgEl = $('#pdbImg'); // Get the image element
                    pdbImgEl.attr('src', imageUrl); // Set the src attribute of the image element
                });


            // fetchCard1Info(uniprotAccessionCode);

            // call all other fetches (add if statement for advance search)

        });
}

//retrieve uniprot info for gene name, protein name, organism, amino acid length + basic summary
function fetchCard1Info(geneCode) {
    fetch(`https://rest.uniprot.org/uniprotkb/${geneCode}?format=json&size=1`)
        .then(function (response) {
            return response.json();
        })
}

//fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=P13569&api_key=d019ce82781c44b8ac9d2547bbc391e9a908&retmode=json&retmax=1`)
// fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=1080&api_key=d019ce82781c44b8ac9d2547bbc391e9a908&retmode=json`)