// var userGene = $('#geneInput').val
// var userSpecies = $('#speciesMenu').val


var NCBIAPIKey = 'd019ce82781c44b8ac9d2547bbc391e9a908';
var userGene = 'CFTR'
var userSpecies = 'homo sapiens'


fetchAccessionID(userGene, userSpecies)

//gets accession number and PDB id of user search
function fetchAccessionID(geneName, speciesName) {
    fetch(`https://rest.uniprot.org/uniprotkb/search?query=${geneName}+AND+organism_name:${speciesName}+AND+reviewed:true&fields=accession,xref_pdb,gene_names&format=json&size=2`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var uniprotAccessionCode = data.results[0].primaryAccession
            console.log(data)
            var pdbID = (data.results[0].uniProtKBCrossReferences[0].id).toLowerCase();
            var returnedGeneName = data.results[0].genes[0].geneName.value;
            console.log(returnedGeneName, pdbID)

            //uniprot + PDB data!
            //card 1
            getPDBImg(pdbID)
            getUniProtInfo(uniprotAccessionCode)

            //get pubmed links
            getPubMedArticles(returnedGeneName, speciesName, NCBIAPIKey)


            //get genbank UID and info
            fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${uniprotAccessionCode}&api_key=${NCBIAPIKey}&retmode=json&retmax=1`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    var genbankUID = data.esearchresult.idlist;

                    //genbank data!
                    //card 1
                    getGenbankInfo(genbankUID, NCBIAPIKey)

                });
        });
}

//get PubMed articles
function getPubMedArticles(ID, species) {
    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=science[journal]+AND+${ID}+AND+${species}&retmax=5&retmode=json`)

    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
        data.esearchresult.idlist.forEach(pmid => {
            fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`)
            .then(function (response) {
                return response.json();


            })
            .then(function (data) {
                var articleTitle = data.result[pmid].title
                console.log(data);               
                var articleLI = $("<li>");
                $("#pubsList").append(articleLI);
                var articleLink = $("<a>");
                articleLink.href = "https://pubmed.ncbi.nlm.nih.gov/${pmid}";
                articleLink.text(articleTitle);
                articleLI.append(articleLink);

                var authorsLine = $("<p>");
                var authorsArray = [];

                data.result[pmid].authors.forEach(item => {                    
                    authorsArray.push(item.name + ", ");                   
                    })

                for (var i =0; i < authorsArray.length; i++) {
                    var nameIndex = authorsArray[i];
                    var nameSpan = $("<span>");
                    nameSpan.text(nameIndex);
                    authorsLine.append(nameSpan);
                }

                console.log(authorsArray);


                $("#pubsList").append(authorsLine);

                // var articleAuthors = $("<p>")
                // data.result[pmid].authors.forEach(name => {

                // });
                
            })          
        })
        .then(function (data) {
            data.esearchresult.idlist.forEach(pmid => {
                fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        console.log(data)
                        var articleTitle = data.result[pmid].title
                        console.log(articleTitle);
                        var articleLink = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
                        console.log(articleLink)
                    })

            })
            .then(function (data) {
                var articleTitle = data.result[pmid].title
                console.log(data);               
                var articleLI = $("<li>");
                $("#pubsList").append(articleLI);
                var articleLink = $("<a>");
                articleLink.href = "https://pubmed.ncbi.nlm.nih.gov/${pmid}";
                articleLink.text(articleTitle);
                articleLI.append(articleLink);

                var authorsLine = $("<p>");
                authorsLine.text("Authors: ")
                var authorsArray = [];

                data.result[pmid].authors.forEach((item, index) => {
                    authorsArray.push(item.name);
                    
                    if (index < data.result[pmid].authors.length - 1) {
                        authorsArray.push(", ");
                    }
                });
                
                var authorsString = authorsArray.join("");



                for (var i =0; i < authorsArray.length; i++) {
                    var nameIndex = authorsArray[i];
                    var nameSpan = $("<span>");
                    nameSpan.text(nameIndex);
                    authorsLine.append(nameSpan);
                }

                console.log(authorsArray);


                $("#pubsList").append(authorsLine);

                // var articleAuthors = $("<p>")
                // data.result[pmid].authors.forEach(name => {

                // });
                
            })
          
        })
})}

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

//get uniprot info 
function getUniProtInfo(ID) {
    fetch(`https://rest.uniprot.org/uniprotkb/${ID}?format=json&fields=organism_name,protein_name,length,sequence,cc_disease,cc_subunit,cc_tissue_specificity,&size=1`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data)

            //card 1 variables
            var proteinName = data.proteinDescription.recommendedName.fullName.value
            var AALength = data.sequence.length;
            $("#aaDisplay").text(AALength);
            $("#proteinDisplay").text(proteinName);

            //card 2
            var diseaseInfoArray = (data.comments).filter(item => item.commentType === 'DISEASE')
            console.log(diseaseInfoArray)


            diseaseInfoArray.forEach(item => {
                var diseaseName = item.disease.diseaseId
                var diseaseDescription = item.disease.description
                console.log(diseaseName + ": " + diseaseDescription)
                diseaseLI = $("<li>");
                diseaseLI.text(diseaseName + ": " + diseaseDescription);
                $("#phenotypesList").append(diseaseLI);
            })


            //card 3
            // the value saved in expressionPatterns comes from the API as one Big Chunk
            // of words string. So It was broken down into an array of smaller sentences
            // with the split method.
            // The for loop creates a <li> for each index in that array
            // and append to the proper <ul> in the HTML.
            var expressionPatterns = data.comments[1].texts[0].value
            var expressionPatternsArray = expressionPatterns.split(". ");
            
            for (var i = 0; i < expressionPatternsArray.length; i++) {
                var newLI = $("<li>");
                newLI.text(expressionPatternsArray[i]);
                newLI.addClass("long-word");
                $("#expressionList").append(newLI);
            }


            //card 5
            var proteinSequence = data.sequence.value;
            $("#aaText").text(proteinSequence);

            //card 7 
            var subUnitInteractions = data.comments[0].texts[0].value

            var subUnitArray = subUnitInteractions.split('. ');
                        
            for (var i = 0; i < subUnitArray.length; i++) {
                var newLI = $("<li>");
                newLI.text(subUnitArray[i]);
                newLI.addClass("long-word");
                $("#interactionsList").append(newLI);
            }


            var subUnitArray = data.comments[0].texts[0].value.split(". ");
            console.log(subUnitArray);
            $("#aaText").text(proteinSequence);

        });
}

//get genbank info
function getGenbankInfo(ID, key) {
    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${ID}&api_key=${key}&retmode=json`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data)


            var geneSummary = data.result[`${ID}`].summary;
            $('#bsDisplay').text(geneSummary);

            var geneName = data.result[`${ID}`].name;
            $("#geneNameDisplay").text(geneName);

            var organismCommon = data.result[`${ID}`].organism.commonname;
            var organismScientific = data.result[`${ID}`].organism.scientificname;
            $("#organismDisplay").text(organismCommon + " (" + organismScientific + ")");

            var geneLocation = data.result[`${ID}`].maplocation
            console.log("gene location --> chromosome " + geneLocation);

            var exonCount = data.result[`${ID}`].genomicinfo[0].exoncount
            console.log("exons --> " + exonCount);

            var geneLength = ((data.result[`${ID}`].genomicinfo[0].chrstop) - (data.result[`${ID}`].genomicinfo[0].chrstart)) / 1000
            console.log("gene length -->" + geneLength + " kb")

            var geneTitle = data.result[`${ID}`].name + " (" + data.result[`${ID}`].organism.scientificname + ")"

            console.log(geneTitle);
        });
}

// fetch(`https://rest.uniprot.org/uniprotkb/search?query=CFTR+AND+organism_name:human+AND+reviewed:true&fields=accession,xref_pdb,xref_ensembl&format=json&size=2`)