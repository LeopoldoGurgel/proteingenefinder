// var userGene = $('#geneInput').val
// var userSpecies = $('#speciesMenu').val

var NCBIAPIKey = 'd019ce82781c44b8ac9d2547bbc391e9a908';

$("#submitBtn").on("click", function(event){
    event.preventDefault();

    var userGene = $("#geneInput").val();
    var userSpecies = 'homo sapiens'
    
    // saves the search input to local history
    if(userGene !== " "){
        updateSearchHistory(userGene);
    }

    fetchAccessionID(userGene, userSpecies)
});

//gets accession number and PDB id of user search
function fetchAccessionID(geneName, speciesName) {
    fetch(`https://rest.uniprot.org/uniprotkb/search?query=${geneName}+AND+organism_name:${speciesName}+AND+reviewed:true&fields=accession,xref_pdb,gene_names&format=json&size=2`)
        .then(function (response) {
            if(!response.ok){
                throw new Error("Something is wrong with our database. Try again Later.")
            }    
            return response.json();
        })
        .then(function (data) {
            console.log(data)
            if(!data.results || data.results.length ===0){
                throw new Error("We couldn't find anything about what you are looking for.")
            }
            
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
        })
        .catch(function(error){
            $("#mainSection").html("<h3 style='font-size: 2em; font-weight: bold'>" + error + "</h3>");
        });
}

//get PubMed articles
function getPubMedArticles(ID, species) {
    $("#pubsList").empty(); //clears the text from previous searches.
    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=science[journal]+AND+${ID}+AND+${species}&retmax=5&retmode=json`)

    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)

        if(!data.esearchresult || data.esearchresult.idlist.length === 0) {
            $("#pubsList").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find articles related to your search in our database.</h3>")        
            return
        }
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
            pdbImgEl.removeClass("hidden");
            pdbImgEl.attr('src', imageUrl); // Set the src attribute of the image element
        });
}

//get uniprot info 
function getUniProtInfo(ID) {
    fetch(`https://rest.uniprot.org/uniprotkb/${ID}?format=json&fields=organism_name,protein_name,length,sequence,cc_disease,cc_subunit,cc_tissue_specificity,cc_domain&size=1`)
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
            function card2(){
            $("#phenotypesList").empty(); //clears the text from previous searches.
            var diseaseInfoArray = (data.comments).filter(item => item.commentType === 'DISEASE')
            console.log(diseaseInfoArray)
            if(!diseaseInfoArray || diseaseInfoArray.length === 0) {
                $("#phenotypesContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find any diseases related to this Gene.</h3>");
                return;
            }


            diseaseInfoArray.forEach(item => {
                var diseaseName = item.disease.diseaseId
                var diseaseDescription = item.disease.description
                console.log(diseaseName + ": " + diseaseDescription)
                diseaseLI = $("<li>");
                diseaseLI.text(diseaseName + ": " + diseaseDescription);
                $("#phenotypesList").append(diseaseLI);
            })
        }
            card2();


            //card 4
            // the value saved in expressionPatterns comes from the API as one Big Chunk
            // of words string. So It was broken down into an array of smaller sentences
            // with the split method.
            // The for loop creates a <li> for each index in that array
            // and append to the proper <ul> in the HTML.


            function card4() {
                $("#expressionList").empty(); //clears the text from previous searches.
                var expressionPatterns = data.comments.filter(item => item.commentType === 'TISSUE SPECIFICITY');

                if(!expressionPatterns || expressionPatterns.length === 0) {
                    $("#expressionContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find any patterns for this Gene.</h3>");
                    return;
                }

                var expressionPatternsArray = expressionPatterns[0].texts[0].value.split(". ")

                for (var i = 0; i < expressionPatternsArray.length; i++) {
                    var patternText = expressionPatternsArray[i];
                    var newLI = $("<li>");
                    newLI.text(patternText);
                    newLI.addClass("long-word");
                    $("#expressionList").append(newLI);
                }
            }
            card4();
        
            //card 5
            function card5(){    
                $("#aaText").empty(); //clears the text from previous searches.
                var proteinSequence = data.sequence.value;
                if(!proteinSequence){
                    $("#aaContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find a protein sequence for this Gene.</h3>");
                    return;
                }

                $("#aaText").text(proteinSequence);
                console.log(proteinSequence);
            }
            card5();


            // card 6 
            var domainArray = (data.comments).filter(item => item.commentType === 'DOMAIN')
            console.log(diseaseInfoArray)

            domainArray.forEach(item => {
                var domain = item.texts[0].value
                domainLI = $("<li>");
                domainLI.text(domain);
                $("#domainsList").append(domainLI);
            })

            //card 7 
            function card7(){
            $("#interactionsList").empty(); //clears the text from previous searches.
            var subUnit = data.comments.filter(item => item.commentType === "SUBUNIT");
            var subUnitBlock = subUnit[0].texts[0].value;

            if(!subUnit || subUnit.length ===0) {
                $("#interactionsContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find any interactions related with this Gene.</h3>")
            }

            var subUnitArray = subUnitBlock.split('. ');
                        
            for (var i = 0; i < subUnitArray.length; i++) {
                var newLI = $("<li>");
                newLI.text(subUnitArray[i]);
                newLI.addClass("long-word");
                $("#interactionsList").append(newLI);
            }}
            card7();

            });
}

// add to clipboard Eventlistener
$("#aaBtn").on("click", function(){
    var textToCopy = $("#aaText").text();
    var clipboard = $("<textarea>"); //will not appear, will just temporarely hold the value.
    $("body").append(clipboard);
    // selects the content of the text area containing the aaText
    clipboard.val(textToCopy).select();
    // copies the text
    document.execCommand("copy");
    clipboard.remove();
    $(this).text("Copied!");
    $(this).removeClass("is-light").addClass("is-info");
})


// was trying to fix a bug by clearing everything as the first
// function called when the search button was clicked.
// didnt work.

// function refreshContent() {
//     $("#interactionsList").empty();
//     $("#geneNameDisplay").empty();
//     $("#proteinDisplay").empty();
//     $("#organismDisplay").empty();
//     $("#aaDisplay").empty();
//     $("#bsDisplay").empty();
//     $("#phenotypesList").empty();
//     $("#pubsList").empty();
//     $("#aaText").empty();
// }

//get genbank info
function getGenbankInfo(ID, key) {
    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${ID}&api_key=${key}&retmode=json`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log('line 294 DATA -----> ',data)


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


// saves geneInput entry to local storage
var geneDropdown = $("#geneDropdown");
var geneInput = $("#geneInput");
var searchHistory = JSON.parse(localStorage.getItem("searchHistory"))||[];

function updateSearchHistory(value){
    
    // this makes the local storage only keep 5 indexes.
    // since push make the new index go to the end of the array
    // the shift method takes out the first index.
    if(searchHistory.length >= 5){
        searchHistory.shift();
    }

    searchHistory.push(value);

    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

// displays searchHistory in the dropdown menu

function displayHistory() {
    geneDropdown.empty();
    
    searchHistory.forEach(value => {
        var entry = $("<a>").text(value);
        entry.on("click", function(){
            geneInput.val(value);
            // hide and show methods add the display: none rule and 
            // take back again. This would have saved me some time 
            // a few lines ago.
            geneDropdown.addClass("hidden");
        });
        geneDropdown.append(entry);
    })
}

geneInput.on("mouseover", function(event){
    event.preventDefault();
    geneInput.val(" ");
    displayHistory();
    geneDropdown.removeClass("hidden");
})

geneInput.on("blur", function(){
    geneDropdown.addClass("hidden");
})

$(document).on("click", function(event) {
    if (
      !$(event.target).is(geneInput) &&
      !$(event.target).closest(geneDropdown).length
    ) {
      geneDropdown.addClass("hidden");
    }
  });

geneInput.on("keyup", function(event){
    if(event.key === "Enter"){
        var value = geneInput.val().trim();
        if(value !== " "){
            updateSearchHistory(value);
        }
    }
})

geneDropdown.on("focus", function() {
    var value = $(this).text();
    geneInput.val(value);
    geneDropdown.addClass("hidden");
  });

// fetch(`https://rest.uniprot.org/uniprotkb/search?query=CFTR+AND+organism_name:human+AND+reviewed:true&fields=accession,xref_pdb,xref_ensembl&format=json&size=2`)
