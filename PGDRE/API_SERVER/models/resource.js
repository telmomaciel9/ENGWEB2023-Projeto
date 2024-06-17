var mongoose = require('mongoose')
var Schema = mongoose.Schema

/*
* O resource é considerado o zip ao qual se faz upload para a plataforma
*/

var resourceSchema = Schema({
    resourceName: String, // Nome do zip, é considerado o id. NÃO REPETÍVEL
    files: [String], // Lista de ficheiros (conteúdo) do zip
    title: String, 
    subtitle: String,
    type: String,
    dateCreation: String,
    dateSubmission: String,
    visibility: String, // Public ou Private
    author: String,
    submitter: String, 
    evaluation: {
        ev: Number,
        eved_by: [{
            user: String, 
            rating: Number
        }]
    }
})

module.exports = mongoose.model('resource', resourceSchema, 'resources')