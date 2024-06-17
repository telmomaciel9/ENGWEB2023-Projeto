var Resource = require('../models/resource')

// Resource list
module.exports.list = () => {
    return Resource
        .find()
        .sort({resourceName: 1}) // Ordem alfabética do nome do zip
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Vai buscar os recursos por tipo
module.exports.listType = t => {
    return Resource
        .find({type: {$regex: t}})
        .sort({resourceName: 1})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Vai buscar um recurso com base no nome do zip
module.exports.getResource = rname => {
    return Resource
        .find({resourceName: rname})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Vai buscar todos os recursos públicos de um certo autor
module.exports.getRAutor = a => {
    return Resource
        .find({author: {$regex: a}})
        .sort({resourceName: 1})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Vai buscar os recursos por titulo
module.exports.getRTitle = t => {
    return Resource
        .find({title: {$regex: t}})
        .sort({resourceName: 1})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Adição de um recurso
module.exports.addR = r => {
    return Resource.create(r)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Atualização de um recurso
module.exports.updateR = r => {
    return Resource 
        .updateOne({resourceName: r.resourceName}, r)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Eliminação de um recurso
module.exports.deleteR = rname => {
    return Resource
        .deleteOne({resourceName: rname})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}