var mongoose = require('mongoose')
var Schema = mongoose.Schema

var newsSchema = Schema({
    username: String, // Quem deu a notícia
    resourceName: String,
    event: String, // O que aconteceu (a notícia em si)
    date: String,
    visibility: String // A mesma do recurso
})

module.exports = mongoose.model('news', newsSchema, 'news')