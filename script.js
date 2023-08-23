var userGene = 'ubiquitin'
var userSpecies = 'human'
var uniprotAccessionCode;
var pdbID;

// fetch (`https://www.uniprot.org/uniprot/?query=gene:${userGene}+AND+organism:${userSpecies}&format=json`, {
//     mode: 'no-cors'
// })
// .then(function (response) {
//     return response.json();
//   })
//   .then(function (data) {
//     console.log(data)
//   });

//gets accession number and PDB id of user search
fetch(`https://rest.uniprot.org/uniprotkb/search?query=${userGene}+AND+${userSpecies}+AND+reviewed:true&fields=accession,xref_pdb&format=json&size=1`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
        uniprotAccessionCode = data.results[0].primaryAccession
        pdbID = data.results[0].uniProtKBCrossReferences[0].id;
        console.log(pdbID);
    });


// fetch(`https://rest.uniprot.org/uniprotkb/P13569.json?fields=cc_tissue_specificity`)

// fetch PDB  
// fetch(`https://cdn.rcsb.org/pdb/6msm/6msm.pdb1_500.jpg`)

// fetch(`https://cdn.rcsb.org/images/rutgers/1XYZ/1XYZ_assembly-1.png`)

// (`https://cdn.rcsb.org/images/rutgers/2MOU/<PDB_ID>_assembly-1.png`)