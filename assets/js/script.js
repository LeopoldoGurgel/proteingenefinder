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
            console.log("uniProt accession code --> " + uniprotAccessionCode)
            console.log("pdbID --> " + pdbID)

            //these fetches are ALWAYS called (card1 genbank ID)

            //get genbank UID and summary!
            fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${uniprotAccessionCode}&api_key=${NCBIAPIKey}&retmode=json&retmax=1`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    var genbankUID = data.esearchresult.idlist;
                    console.log("genbank UID --> " + genbankUID)

                    //get genbank summary as var geneSummary!=
                    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${genbankUID}&api_key=${NCBIAPIKey}&retmode=json`)
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (data) {
                            var geneSummary = data.result[`${genbankUID}`].summary
                            console.log("gene summary --> " + geneSummary)
                            $('#bsDisplay').text(geneSummary);
                        });
                });

            //get pdb image
            fetch(`https://cdn.rcsb.org/images/structures/${pdbID}_assembly-1.jpeg`)
                .then(function (response) {
                    return response.blob();
                })
                .then(function (blob) {
                    var imageUrl = URL.createObjectURL(blob); // Create an object URL from the Blob
                    var pdbImgEl = $('#pdbImg'); // Get the image element
                    pdbImgEl.attr('src', imageUrl); // Set the src attribute of the image element
                });


            //retrieve uniprot info for gene name, protein name, organism, amino acid length + basic summary
            fetch(`https://rest.uniprot.org/uniprotkb/${uniprotAccessionCode}?format=json&fields=organism_name,protein_name,length&size=1`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data)
                    var proteinName = data.proteinDescription.recommendedName.fullName.value
                    var AALength = data.sequence.length;
                    console.log("amino acid length --> " + AALength)
                    console.log("protein name --> " + proteinName)
                });


            // call all other fetches (add if statement for advance search)

        });
}


