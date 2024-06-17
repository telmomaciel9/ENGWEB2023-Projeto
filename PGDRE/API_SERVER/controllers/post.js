var Post = require('../models/post')

// Post list of a resource
module.exports.rPosts = rname => {
    return Post
        .find({resourceName: rname})
        .sort({date: 1})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Retorna um post em específico
module.exports.getPost = id => {
    return Post
        .findOne({_id: id})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Lista de posts com um determinado título
module.exports.getPostsT = t => {
    return Post
        .find({title: {$regex: t}})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Lista de posts com um determinado número de likes
module.exports.getPostsL = l => {
    return Post
        .find({liked_by: {$size: l}})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Lista de posts de um utilizador
module.exports.getPostsU = u => {
    return Post
        .find({username: {$regex: u}})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

module.exports.addPost = p => {
    return Post.create(p)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

module.exports.updatePost = p => {
    return Post.updateOne({_id: p._id}, p)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Elimina um post em específico
module.exports.deletePost = id => {
    return Post 
        .deleteOne({_id: id})
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            return erro
        })
}

// Elimina todos os posts de um certo recurso
module.exports.deletePostsR = rname => {
    return Post 
        .deleteMany({resourceName: rname})
        .then(resposta => { 
            return resposta
        })
        .catch(erro => {
            return erro
        })
}
