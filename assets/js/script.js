
var arrayStorage = JSON.parse(localStorage.getItem('filteredSearchHistory')) || [];
var NCBIAPIKey = 'd019ce82781c44b8ac9d2547bbc391e9a908';
var geneDropdown = $("#geneDropdown");


$("#submitBtn").on("click", function (event) {
    event.preventDefault();
    $('#table-of-contents').addClass('initialHide')
    $('#mainSection').addClass('initialHide')

    var userGene = $("#geneInput").val();

    //store user search to local storage and filter array so there are no repeats
    arrayStorage.push(userGene)
    var filteredSearchHistory = [...new Set(arrayStorage)]
    localStorage.setItem('filteredSearchHistory', JSON.stringify(filteredSearchHistory));

    var userSpecies = $("#speciesMenu").val();


    // saves the search input to local history
    if (userGene !== " ") {
    }


    fetchAccessionID(userGene, userSpecies)

});

//gets accession number and PDB id of user search
function fetchAccessionID(geneName, speciesName) {
    showLoadingIcon(); // Show loading icon immediately

    fetch(`https://rest.uniprot.org/uniprotkb/search?query=${geneName}+AND+organism_name:${speciesName}+AND+reviewed:true&fields=accession,xref_pdb,gene_names&format=json&size=2`)
        .then(function (response) {
            if (!response.ok) {
                showErrorDb("Something is wrong with our database. Try again Later.");
                hideLoadingIcon(); // Hide loading icon on error
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            if (!data.results || data.results.length === 0) {
                showNoResults("We couldn't find anything matching your query.");
                hideLoadingIcon(); // Hide loading icon when no results
            } else {
                setTimeout(function () {
                    hideLoadingIcon(); // Hide loading icon after 1 second
                    $('#table-of-contents').removeClass('initialHide');
                    $('#mainSection').removeClass('initialHide');
                    $('#searchBox').removeClass('is-10 is-centered is-offset-1').addClass('is-3');
                    $('#pubmedLink').addClass('hidden');
                }, 700);

                var uniprotAccessionCode = data.results[0].primaryAccession;
                console.log(data);

                try {
                    var pdbID = (data.results[0].uniProtKBCrossReferences[0].id).toLowerCase();
                    getPDBImg(pdbID);
                } catch (error) {
                }

                var returnedGeneName = data.results[0].genes[0].geneName.value;

                //uniprot + PDB data!
                //card 1

                getUniProtInfo(uniprotAccessionCode);

                //get pubmed links
                getPubMedArticles(returnedGeneName, speciesName, NCBIAPIKey);

                //get genbank UID and info
                fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${uniprotAccessionCode}&api_key=${NCBIAPIKey}&retmode=json&retmax=1`)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        var genbankUID = data.esearchresult.idlist;

                        //genbank data!
                        //card 1
                        getGenbankInfo(genbankUID, NCBIAPIKey);
                    });
            }
        });
}




function showLoadingIcon() {
    document.getElementById('loadingIcon').classList.remove('hidden');
}

function hideLoadingIcon() {
    document.getElementById('loadingIcon').classList.add('hidden');
}

function showErrorDb(message) {
    $('#errorDbNotification').removeClass('is-hidden').text(message);
    hideNoResults();
}

function showNoResults(message) {
    $('#noResultsNotification').removeClass('is-hidden').text(message);
    hideErrorDb();
}

function hideErrorDb() {
    $('#errorDbNotification').addClass('is-hidden').text('');
}

function hideNoResults() {
    $('#noResultsNotification').addClass('is-hidden').text('');
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

            if (!data.esearchresult || data.esearchresult.idlist.length === 0) {
                $("#pubsList").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find relevant PubMed articles related to your gene.</h3>")
                return
            } else {
                pubmedLinkEl = $('#pubmedLink')
                pubmedLinkEl.removeClass('hidden')
                pubmedLinkEl.attr('href', `https://pubmed.ncbi.nlm.nih.gov/?term=${ID}+${species}`)
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

                            for (var i = 0; i < authorsArray.length; i++) {
                                var nameIndex = authorsArray[i];
                                var nameSpan = $("<span>");
                                nameSpan.text(nameIndex);
                                authorsLine.append(nameSpan);
                            }

                            console.log(authorsArray);


                            $("#pubsList").append(authorsLine);
                        })
                })
            }
        })
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
            pdbImgEl.removeClass("hidden");
            pdbImgEl.attr('src', imageUrl); // Set the src attribute of the image element
            pdbLinkEl = $('#pdbLink')
            pdbLinkEl.attr('href', `https://www.rcsb.org/structure/${ID}`)
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
            function card2() {
                $("#phenotypesList").empty(); //clears the text from previous searches.
                var diseaseInfoArray = (data.comments).filter(item => item.commentType === 'DISEASE')
                console.log(diseaseInfoArray)
                if (!diseaseInfoArray || diseaseInfoArray.length === 0) {
                    $("#phenotypesContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find any data on diseases associated with this Gene.</h3>");
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

                if (!expressionPatterns || expressionPatterns.length === 0) {
                    $("#expressionContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find any expression pattern data for this Gene.</h3>");
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
            function card5() {
                $("#aaText").empty(); //clears the text from previous searches.
                var proteinSequence = data.sequence.value;
                if (!proteinSequence) {
                    $("#aaContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find a protein sequence data for this Gene.</h3>");
                    return;
                }

                $("#aaText").text(proteinSequence);
                console.log(proteinSequence);
            }
            card5();


            // card 6 
            function card6() {
                var domainArray = (data.comments).filter(item => item.commentType === 'DOMAIN')
                if (!domainArray || domainArray.length === 0) {
                    $("#domainsContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find any domains data related to this Gene.</h3>")
                    return;
                }

                domainArray.forEach(item => {
                    var domain = item.texts[0].value
                    var domainLI = $("<li>");
                    domainLI.text(domain);
                    $("#domainsList").append(domainLI);
                })
            }
            card6();

            //card 7 
            function card7() {
                $("#interactionsList").empty(); //clears the text from previous searches.
                var subUnit = data.comments.filter(item => item.commentType === "SUBUNIT");
                if (!subUnit || subUnit.length === 0) {
                    $("#interactionsContent").html("<h3 style='font-size: 1.2em; font-weight: bold'>Sorry. We couldn't find any interactions related with this Gene.</h3>")
                    return;
                }
                var subUnitBlock = subUnit[0].texts[0].value;
                console.log(subUnit);


                var subUnitArray = subUnitBlock.split('. ');

                for (var i = 0; i < subUnitArray.length; i++) {
                    var newLI = $("<li>");
                    newLI.text(subUnitArray[i]);
                    newLI.addClass("long-word");
                    $("#interactionsList").append(newLI);
                }
            }
            card7();

        });
}

// add to clipboard Eventlistener
$("#aaBtn").on("click", function () {
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


//get genbank info
function getGenbankInfo(ID, key) {
    fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${ID}&api_key=${key}&retmode=json`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log('line 294 DATA -----> ', data)


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


$("#geneInput").on("click", function () {
    $(geneDropdown).removeClass("hidden");
    updateSearchHistory();
});

var updateSearchHistory = function () {
    geneDropdown.empty();
    var searchHistory = JSON.parse(localStorage.getItem('filteredSearchHistory')) || [];
    searchHistory.forEach(function (searchQuery) {
        var searchHistoryButton = $('<a>');
        searchHistoryButton.text(searchQuery);
        geneDropdown.append(searchHistoryButton);
    })
}

$(geneDropdown).on("click", "a", function () {
    var value = $(this).text();
    $("#geneInput").val(value);
    $(geneDropdown).addClass("hidden");
});

//closes the dropdown when clicked out
$(document).on("click", function (event) {
    if (
        !$(event.target).is("#geneInput") &&
        !$(event.target).closest(geneDropdown).length
    ) {
        geneDropdown.addClass("hidden");
    }
}); 