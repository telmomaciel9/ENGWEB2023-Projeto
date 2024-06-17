var express = require('express');
var router = express.Router();
var axios = require('axios'); // serve para fazer pedidos para os outros servidores
var popups = require('../public/javascripts/popups')
var env = require('../config/env')

var fs = require('fs') // file system
var multer = require('multer');
var upload = multer({dest: 'uploads'}) // Guarda tudo numa pasta "uploads"

const StreamZip = require('node-stream-zip');
const JSZip = require('jszip'); // Verificar se preciso disto!!!

var jwt = require("jsonwebtoken")

// Esta função verifica primeiro se existe um token no pedido
// Depois verifica se o token é válido ou não
function verificaToken(req, res, next){
  if(req.cookies && req.cookies.token){
    jwt.verify(req.cookies.token, "PGDRE2023", function(e, payload){
      if(e){// Erro na validação do token
        res.render('error', {error: "O token do pedido não é válido...", token: false})
      }
      else{ // Só avança se existir um token e se este for verificado com sucesso
        req.user = payload // Informações do user -> req.user
        next()
      }
    })
  }else{ // Não existe token
    res.render('error', {error: "O pedido não tem um token...", token: false})
  }
}

/*                                GETS                                   */
/* GET home page. */
router.get('/', function(req, res, next) {
  var data = new Date().toISOString().substring(0,16)
  res.render('index', {d: data});
});

// register
router.get('/register', function(req, res){
  var data = new Date().toISOString().substring(0,16) 
  res.render('registerForm', {d: data})
})

// login
router.get('/login', function(req, res){
  var data = new Date().toISOString().substring(0,16) 
  res.render('loginForm', {d: data})
})

// logout
router.get('/logout', verificaToken, function(req, res){
  res.cookie('token', "token.destruido")
  res.redirect('/')
})

// Página inicial 
router.get('/home', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/news/list?token=' + req.cookies.token)
    .then(dados => {
      console.dir(req.user)
      res.render('home', {u: req.user, news: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Vai servir para gerar a página com o perfil do utilizador
// Tem que se verificar se o utilizador já está autenticado ou não
router.get('/profile', verificaToken, function(req, res){  
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.authAccessPoint + '/users/get/' + req.user.username + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('profile', {u: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

router.get('/profile/edit', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.authAccessPoint + '/users/get/' + req.user.username + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('editProfileForm', {u: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Pedido para adicionar uma foto de perfil
router.get('/profile/profilePic', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  res.render('addProfilePicForm', {d: data})
})

// Fazer download da própria foto de perfil
router.get('/profile/profilePic/download', verificaToken, function(req, res){
  axios.get(env.authAccessPoint + '/users/get/' + req.user.username + "?token=" + req.cookies.token)
    .then(dados => {
      var path
      if(req.user.profilePic == "profile.png"){
        path = __dirname + '/../public/images/profile.png'
      }else{
        path = __dirname + '/../public/profilePics/' + req.user.level + "/" + dados.data.profilePic
      }
      res.download(path)
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Fazer download da foto de perfil de outro user
router.get('/profile/profilePic/download/:username', verificaToken, function(req, res){
  axios.get(env.authAccessPoint + '/users/get/' + req.params.username + "?token=" + req.cookies.token)
    .then(dados => {
      var path
      if(dados.data.profilePic == "profile.png"){
        path = __dirname + '/../public/images/profile.png'
      }else{
        path = __dirname + '/../public/profilePics/' + dados.data.level + "/" + dados.data.profilePic
      }
      res.download(path)
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Pedido de desativação de conta
router.get('/profile/deactivate', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.authAccessPoint + '/users/get/' + req.user.username + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('confirmProfileDeactivation', {u: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Desativar uma conta implica:
// 1. Alterar o campo active do user
// 2. Não ser possível fazer login com esta conta até que esta seja ativada outra vez
// 3. Fazer o logout da conta
router.get('/profile/deactivate/confirm', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.put(env.authAccessPoint + '/users/' + req.user.username + '/deactivate?token=' + req.cookies.token)
    .then(dados => {
      res.redirect('/logout')
    })
    .catch(erro => res.render('error', {error: erro}))
})

// (Admin) pedido de desativação de uma conta
router.get('/profile/deactivate/admin', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.authAccessPoint + '/users/get/active?token=' + req.cookies.token)
    .then(dados => {
      res.render('deactivateProfile', {us: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// (Admin) desativação de uma conta
router.get('/profile/deactivate/:username', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.put(env.authAccessPoint + '/users/' + req.params.username + '/deactivate?token=' + req.cookies.token)
    .then(dados => {
      res.redirect('/profile/deactivate/admin')
    })
    .catch(erro => res.render('error', {error: erro}))
})

router.get('/profile/activate', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.authAccessPoint + '/users/get/deactive?token=' + req.cookies.token)
    .then(dados => {
      res.render('activateProfile', {us: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Ativar uma conta
// Para ativar uma conta basta mudar o conta active do user
router.get('/profile/activate/:username', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.put(env.authAccessPoint + '/users/'+ req.params.username + '/activate?token=' + req.cookies.token)
    .then(dados => {
      res.redirect('/profile/activate')
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Investigar uma conta
router.get('/profile/admin/investigate', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.authAccessPoint + '/users/get?token=' + req.cookies.token)
    .then(dados => {
      res.render('investigateUser', {us: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Lista de todos os recursos
router.get('/resources', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/list?token=' + req.cookies.token)
    .then(dados => {
      res.render('resources', {u: req.user, rs: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Adicionar um novo recurso
router.get('/resources/add', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  res.render('addResourceForm', {u: req.user, d: data})
})

// Vai buscar um recurso em específico
router.get('/resources/:rname', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
    .then(recurso => {
      axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "/posts?token=" + req.cookies.token)
        .then(posts => {
          res.render('resourceDetails', {u: req.user, r: recurso.data[0], ps: posts.data, d: data})
        })
        .catch(erro => {
          erro => res.render('error', {error: erro})
        })
    })
    .catch(erro => res.render('error', {error: erro}))
})

router.get('/resources/edit/:rname', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
    .then(dados => {
      var files = ""
      for(let i=0; i<dados.data[0].files.length; i++){
        if(i != 0){
          files += ", "
        }
        files += dados.data[0].files[i]
      }

      res.render('editResourceForm', {r: dados.data[0], files: files, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Pedido de eliminação de um recurso
router.get('/resources/delete/:rname', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('confirmDeleteResource', {r: dados.data[0], d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Eliminar um recurso
router.get('/resources/delete/:rname/confirm', verificaToken, function(req, res){
  axios.delete(env.apiAccessPoint + '/resource/' + req.params.rname + "/delete?token=" + req.cookies.token)
    .then(dados => {
      res.redirect('/resources')
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Download de um recurso
router.get('/resources/download/:rname', verificaToken, function(req, res){
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
    .then(dados => {
      console.dir(dados.data)
      let path = __dirname + '/../uploads/' + dados.data[0].type + "/" + req.params.rname
      res.download(path)
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Pedido para adicionar um recurso
router.get('/upload/resource', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  res.render('addResourceForm', {d: data})
})

// Pedido para avaliar um recurso
router.get('/resources/:rname/evaluate', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('evaluateResource', {r: dados.data[0], d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Pedido para adicionar um post
router.get('/resources/:rname/posts/add', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('addPostForm', {u: req.user, r: dados.data[0], d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Vai buscar a informação de um post em específico
router.get('/resources/:rname/posts/:id', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + '/posts/' + req.params.id + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('postDetails', {u: req.user, p: dados.data, d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Edição de um post
router.get('/resources/:rname/posts/:id/edit', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + '/posts/' + req.params.id + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('editPostForm', {p: dados.data, d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Pedido para eliminar um post
router.get('/resources/:rname/posts/:id/delete', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "/posts/" + req.params.id + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('confirmDeletePost', {p: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Confirmação da eliminação de um post
router.get('/resources/:rname/posts/:id/delete/confirm', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.delete(env.apiAccessPoint + '/posts/' + req.params.id + "?token=" + req.cookies.token)
    .then(dados => {
      res.redirect('/resources/' + req.params.rname)
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Adicionar um like a um post
router.get('/resources/:rname/posts/:id/like', verificaToken, function(req, res){
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + '/posts/' + req.params.id + '/like?token=' + req.cookies.token)
    .then(dados => {
      res.redirect('/resources/' + req.params.rname + '/posts/' + req.params.id)
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Remover um like a um post
router.get('/resources/:rname/posts/:id/unlike', verificaToken, function(req, res){
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + '/posts/' + req.params.id + '/unlike?token=' + req.cookies.token)
    .then(dados => {
      res.redirect('/resources/' + req.params.rname + '/posts/' + req.params.id)
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Pedido para adicionar um comentário a um post
router.get('/resources/:rname/posts/:id/comments/add', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "/posts/" + req.params.id + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('addCommentForm', {u: req.user, p: dados.data, d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Eliminar um comentário de um post
router.get('/resources/:rname/posts/:p_id/comments/:c_id/delete', verificaToken, function(req, res){
  axios.delete(env.apiAccessPoint + '/resource/' + req.params.rname + "/posts/" + req.params.p_id + "/comments/" + req.params.c_id + "?token=" + req.cookies.token)
    .then(dados => {
      res.redirect('/resources/' + req.params.rname + "/posts/" + req.params.p_id)
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Pedido para adicionar uma notícia
// Se o user for um producer este só pode adicionar notícias sobre os seus recursos
router.get('/news/add', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/list?token=' + req.cookies.token)
    .then(dados => {
      res.render('addNewsForm', {u: req.user, rs: dados.data, d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Pedido para editar uma notícia
router.get('/news/edit/:id', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/list?token=' + req.cookies.token)
    .then(dados => {
      var rs = dados.data
      axios.get(env.apiAccessPoint + '/news/' + req.params.id + "?token=" + req.cookies.token)
        .then(dados => {
          res.render('editNewsForm', {rs: rs, n: dados.data, d: data})
        })
        .catch(erro => {res.render('error', {error: erro})})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Pedido para remover uma notícia
router.get('/news/delete/:id', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/news/' + req.params.id + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('deleteNewsConfirm', {n: dados.data, d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Remover um notícia
router.get('/news/delete/:id/confirm', verificaToken, function(req, res){
  axios.delete(env.apiAccessPoint + '/news/' + req.params.id + "?token=" + req.cookies.token)
    .then(dados => {
      res.redirect('/home')
    })
    .catch(erro => {res.render('error', {error: erro})})
})

/*                                POSTS                                 */
// Criar um novo registo de utilizador
// O utilizador não fica autenticado, apenas é inserido um novo utilizador na BD
// Tem que se verificar se já existe algum user com o mesmo username
router.post('/register', verificaToken, function(req,res){
  var data = new Date().toISOString().substring(0,16)
  
  console.log("Level: " + req.body.level)
  if(req.body.level == undefined){
    // Faltou completar o nível do utilizador
    res.render('registerForm', {erro: "Nível da conta não especificado"}) 
  }else{
    req.body.profilePic = undefined
    // Verificar se não existe nenhum utilizador com o mesmo username
    axios.get(env.authAccessPoint + "/users/get/" + req.body.username + "?token=" + req.cookies.token)
      .then(dados => {
        if(dados.data != null){
          res.render('registerForm', {erro: "Já existe um utilizador com esse nome de utilizador! Por favor escolha outro."})
        }else{
          axios.post(env.authAccessPoint + "/users/register?token=" + req.cookies.token, req.body)
            .then(dados => {
              axios.get(env.authAccessPoint + "/users/get/" + req.body.username + "?token=" + req.cookies.token)
                .then(dados => {
                  res.render('confirmRegister', {u: dados.data, d: data, popup: true})
                })
                .catch(erro => {res.render('error', {error: erro})})
            })
            .catch(erro => {res.render('error', {error: erro})})
        }
      })
      .catch(erro => {res.render('error', {error: erro})})
  }
})

router.post('/login', function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.post(env.authAccessPoint + "/users/login", req.body)
    // A resposta, em caso de sucesso, é associado o jwt ao user
    .then(dados => {
      if(dados.data.message != undefined){ // A conta está desativa
        res.render('loginForm', {message: dados.data.message})
      }else{
        res.cookie('token', dados.data.token)
        res.redirect('/home')
      }
    })
    .catch(erro => {res.render('error', {error: erro})})
})  

router.post('/profile/edit', verificaToken, function(req, res){
  axios.get(env.authAccessPoint + "/users/get/" + req.body.username + "?token=" + req.cookies.token)
    .then(dados => {
      
      if(req.body.password == undefined){
        req.body.password = dados.data.password
      }
      if(req.body.active == "yes"){
        req.body.active = true
      }else if(req.body.active == "no"){
        req.body.active = false
      }
      req.body.profilePic = dados.data.profilePic // A foto de perfil não pode ser alterada neste formulário

      axios.put(env.authAccessPoint + "/users/edit/" + req.body.username + "?token=" + req.cookies.token, req.body)
        .then(dados => {
          res.redirect('/profile')
        })
        .catch(erro => {res.render('error', {error: erro})})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Adicionar uma foto de perfil
router.post('/profile/profilePic', verificaToken, upload.single('profilePic'), function(req, res){
  if(req.file == undefined){
    res.render('addProfilePicForm', {erro: "Você não selecionou um ficheiro!"})
  }else{
    if(req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/png"){
      let oldPath =  __dirname + '/../' + req.file.path
      let newPath = __dirname + '/../public/profilePics/' + req.user.level + '/' + req.file.originalname
      fs.rename(oldPath,newPath, erro => {
        if(erro) res.render('error',{error:erro})
      })

      var pic = {
        profilePic: req.file.originalname
      }
      axios.put(env.authAccessPoint + "/users/" + req.user.username + "/profile/profilePic?token=" + req.cookies.token, pic)
        .then(user => {
          res.redirect('/profile')
        })
        .catch(erro => {res.render('error', {error: erro})})
    }else{
      let path =  __dirname + '/../' + req.file.path
      try{
        fs.unlinkSync(path)
      }catch(e){
        console.log(e)
      }
      res.render('addProfilePicForm', {erro: "O tipo do ficheiro selecionado não é válido!"})
    }
  }
})

router.post('/profile/admin/investigate', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.authAccessPoint + "/users/get/" + req.body.username + "?token=" + req.cookies.token)
    .then(dados => {
      res.render('investigateProfile', {u: dados.data, d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Função que verifica se o rname do novo recurso já existia ou não
// Se já existir, o recurso tem que ser rejeitado
function verificaRName(req, res, next){
  var data = new Date().toISOString().substring(0,16)
  if(req.file != undefined){
    axios.get(env.apiAccessPoint + '/resource/' + req.file.originalname + "?token=" + req.cookies.token)
      .then(dados => {
        if(dados.data.length != 0){ // Já existe um recurso com este nome
          let path = __dirname + '/../' + req.file.path
          try{
            fs.unlinkSync(path)
          }catch(e){
            console.log(e)
          }
          res.render('addResourceForm', {erros: ["O nome do recurso já existe. Por favor altere-o!"], d:data})
        }else{
          next() // Continua com o upload do recurso
        }
      })
      .catch(erro => {res.render('error', {error: erro})})
  }else{
    next()
  }
}

// Upload de um novo recurso educacional
// Tem que se realizar a verificação de que o zip está correto
// Os recursos não podem ter nomes repetidos (resourceName é considerado um id)
router.post('/upload/resource', upload.single('resource'), verificaToken, verificaRName,function(req, res){
  var data = new Date().toISOString().substring(0,16)
  var metadata
  erros = []
  recurso = {
    conteudo: [],
    todos: [],
    manifesto: {
      existe: true,
      valido: true
    },
    metadados: {
      existe: true,
      valido: true
    }
  }

  // 1. Verificar se o manifesto bate certo com o conteúdo do zip
  // 2. Verificar se o ficheiro SIP json está correto
  if(req.file != undefined && (req.file.mimetype == 'application/zip' || req.file.mimetype == "application/x-zip-compressed")){
    var zip = new StreamZip({
      file: req.file.path,
      storeEntries: true
    })

    zip.on("error", (err) => {
      res.render("error", {error: err})
    });
    zip.on('ready', () => {
      for (const entry of Object.values(zip.entries())){
        recurso.todos.push(entry.name)
        if(entry.name != "manifest.txt" && entry.name != "PGDRE-SIP.json"){
          recurso.conteudo.push(entry.name)
        }
      }

      if(recurso.conteudo.length == 0){
        erros.push("O recurso não contém conteúdo.")
      }

      if(recurso.todos.includes("manifest.txt")){
        manifest = zip.entryDataSync("manifest.txt").toString('utf8')
        manifest = manifest.replace('\n', '')
        files = manifest.split('|')
        for(file of recurso.conteudo){
          if(!files.includes(file)){
            recurso.manifesto.valido = false
          }
        }

        if(recurso.manifesto.valido == false){
          erros.push("O recurso não contém um ficheiro manifesto válido")
        }
      }else{
        recurso.manifesto.existe = false
        erros.push("O recurso não contém um ficheiro manifesto")
      }

      if(recurso.todos.includes("PGDRE-SIP.json")){
        jsonfile = zip.entryDataSync("PGDRE-SIP.json").toString('utf8')
        metadata = JSON.parse(jsonfile)
        req.body.metadados = metadata

        if(!(metadata.hasOwnProperty('title')
        && metadata.hasOwnProperty('type') && metadata.hasOwnProperty('dateCreation')
        && metadata.hasOwnProperty('visibility') && metadata.hasOwnProperty('author'))){
          recurso.metadados.valid = false
        }
  
        if(metadata.type != 'Artigo' && metadata.type != 'Ficha' 
        && metadata.type != 'Relatório' && metadata.type != 'Teste' 
        && metadata.type != 'Slides' && metadata.type != 'Tese'){
          recurso.metadados.valid = false
        }

        if(metadata.visibility != 'Public' && metadata.visibility != 'Private'){
          recurso.metadados.valid = false
        }

        if(recurso.metadados.valid == false){
          erros.push("O recurso contém um ficheiro de metadados inválido")
        }      
      }else{
        recurso.metadados.existe = false
        erros.push("O recurso não tem um ficheiro de metadados")
      }
      
      // Se houve algum erro o recurso não é validado
      if(erros.length != 0){
        let path = __dirname + '/../' + req.file.path
        try{
          fs.unlinkSync(path) // Remove o recurso inválido
        }catch(e){
          console.log(e)
        }
        res.render('addResourceForm', {erros: erros, d: data})
      }else{// Recurso validado com sucesso
        dados = zip.entryDataSync("PGDRE-SIP.json").toString('utf8')
        metadadosObj = JSON.parse(dados)

        var r = {
          resourceName: req.file.originalname,
          files: recurso.conteudo,
          title: metadadosObj.title,
          subtitle: metadadosObj.subtitle,
          type: metadadosObj.type,
          dateCreation: metadadosObj.dateCreation,
          dateSubmission: new Date().toISOString().slice(0, 19).split('T').join(' '),
          visibility: metadadosObj.visibility,
          author: metadadosObj.author,
          submitter: req.user.username,
          evaluation: {
            ev: 0,
            eved_by: []
          }
        } 
        let oldPath =  __dirname + '/../' + req.file.path
        let newPath = __dirname + '/../uploads/' + metadadosObj.type + '/' + req.file.originalname

        fs.rename(oldPath,newPath, erro =>{
          if(erro) res.render('error',{error:erro})
          else{
            axios.post(env.apiAccessPoint + '/resource/add?token=' + req.cookies.token, r)
              .then(dados => {
                var n = {
                  username: req.user.username,
                  resourceName: req.file.originalname,
                  event: "O utilizador " + req.user.username + " adicionou um novo recurso: " + req.file.originalname,
                  date: new Date().toISOString().slice(0, 19).split('T').join(' '),
                  visibility: r.visibility
                }

                axios.post(env.apiAccessPoint + '/news/add?token=' + req.cookies.token, n)
                  .then(dados => {
                   res.redirect('/resources')
                  })
                  .catch(e => res.render('error', {error: e})) 
              })
              .catch(error => res.render('error', {error: error}))
          }
        })
      }
    })
  }else{
    erros.push("O recurso não é um zip!")
    res.render('addResourceForm', {erros: erros})
  }
})

// Editar um recurso
router.post('/resources/:rname/edit', verificaToken, function(req, res){
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
    .then(dados => {
      var r = {
        resourceName: req.body.resourceName,
        files: dados.data[0].files,
        title: req.body.title,
        subtitle: req.body.subtitle,
        type: req.body.type,
        dateCreation: dados.data[0].dateCreation,
        dateSubmission: dados.data[0].dateSubmission,
        visibility: req.body.visibility,
        author: req.body.author,
        submitter: req.body.submitter
      }

      axios.post(env.apiAccessPoint + '/resource/' + req.params.rname + "/edit?token=" +req.cookies.token, r)
      .then(dados => {
        res.redirect('/resources')
      })
      .catch(erro => {res.render('error', {error: erro})})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Avaliar um recurso
router.post('/resources/:rname/evaluate', verificaToken, function(req, res){
  console.dir(req.body)
  axios.post(env.apiAccessPoint + '/resource/' + req.params.rname + "/evaluate?token=" + req.cookies.token, {ev: req.body.ev})
    .then(dados1 => {
      axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
        .then(dados2 => {
          var n = {
            username: req.user.username,
            resourceName: req.params.rname,
            event: "O utilizador " + req.user.username + " avaliou o recurso " + req.params.rname,
            date: new Date().toISOString().slice(0, 19).split('T').join(' '),
            visibility: dados2.data[0].visibility // A mesma do recurso
          }

          axios.post(env.apiAccessPoint + '/news/add?token=' + req.cookies.token, n)
            .then(dados => {
              res.redirect('/resources/' + req.params.rname)
            })
            .catch(erro => {res.render('error', {error: erro})})
        })
        .catch(erro => {res.render('error', {error: erro})})
    })
    .catch(erro => {res.render('error', {error: erro})})
}) 

// Adicionar um post
router.post('/resources/:rname/posts/add', verificaToken, function(req, res){
  var p = {
    resourceName: req.body.resourceName,
    username: req.body.username,
    title: req.body.title,
    description: req.body.description,
    liked_by: [], 
    date: new Date().toISOString().slice(0, 19).split('T').join(' '),
    visibility: req.body.visibility,
    comments: []
  }

  axios.post(env.apiAccessPoint + '/resource/' + req.params.rname + "/posts/add?token=" + req.cookies.token, p)
    .then(dados => {
      var n = {
        username: req.body.username,
        resourceName: req.body.resourceName,
        event: "O utilizador " + req.body.username + " postou sobre o recurso " + req.body.resourceName + "!",
        date: new Date().toISOString().slice(0, 19).split('T').join(' '),
        visibility: req.body.visibility,
      }

      axios.post(env.apiAccessPoint + '/news/add?token=' + req.cookies.token, n)
        .then(dados => {
          res.redirect('/resources/' + req.params.rname)
        })
        .catch(erro => {res.render('error', {error: erro})})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Editar um post
router.post('/resources/:rname/posts/:id/edit', verificaToken, function(req, res){
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + '/posts/' + req.params.id + "?token=" + req.cookies.token)
    .then(dados => {
      var p = {
        _id: dados.data._id,
        resourceName: req.body.resourceName,
        username: req.body.username,
        title: req.body.title,
        description: req.body.description,
        liked_by: req.body.liked_by,
        date: req.body.date,
        visibility: req.body.visibility,
        comments: dados.data.comments
      }
      axios.post(env.apiAccessPoint + '/resource/' + req.params.rname + "/posts/" + req.params.id + "/edit?token=" + req.cookies.token, p)
        .then(dados => {
          res.redirect('/resources/' + req.params.rname)
        })
        .catch(erro => {res.render('error', {error: erro})})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Adicionar um comentário a um post
router.post('/resources/:rname/posts/:id/comments/add', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)

  var c = {
    username: req.body.username,
    title: req.body.title,
    description: req.body.description,
    date: data
  }

  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + '?token=' + req.cookies.token)
    .then(dados => {

      axios.post(env.apiAccessPoint + '/resource/' + req.params.rname + "/posts/" + req.params.id + "/comments/add?token=" + req.cookies.token, c)
        .then(dados2 => {
          var n = {
            username: req.body.username,
            resourceName: req.params.rname,
            event: "O utilizador " + req.body.username + " comentou um post do recurso " + req.params.rname + "!",
            date: new Date().toISOString().slice(0, 19).split('T').join(' '),
            visibility: dados.data[0].visibility
          }
          console.dir(n)
          axios.post(env.apiAccessPoint + '/news/add?token=' + req.cookies.token, n)
            .then(dados => {
              res.redirect('/resources/' + req.params.rname + "/posts/" + req.params.id)
            })
            .catch(erro => {res.render('error', {error: erro})})
        })
        .catch(erro => {res.render('error', {error: erro})})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Pesquisa nos recursos
router.post('/resources/search', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  if(req.body.search == ""){
    axios.get(env.apiAccessPoint + '/resource/list?token=' + req.cookies.token)
      .then(dados => {
        res.render('resources', {u: req.user, rs: dados.data, d: data})
      })
      .catch(erro => res.render('error', {error: erro}))
  }

  axios.post(env.apiAccessPoint + '/resource/search?token=' + req.cookies.token, req.body)
    .then(dados => {
      res.render('resources', {u: req.user, rs: dados.data, d: data})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Pesquisa nos posts
router.post('/resources/:rname/posts/search', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + "?token=" + req.cookies.token)
    .then(dados => {
      var r = dados.data[0]
      if(req.body.search == ""){
        axios.get(env.apiAccessPoint + '/resource/' + req.params.rname + '/posts?token=' + req.cookies.token)
          .then(dados => {
            res.render('resourceDetails', {u: req.user, r: r, ps: dados.data, d: data})
          })
          .catch(erro => res.render('error', {error: erro}))
      }else{
        axios.post(env.apiAccessPoint + '/resource/' + req.params.rname + '/posts/search?token=' + req.cookies.token, req.body)
          .then(dados => {
            res.render('resourceDetails', {u: req.user, r: r, ps: dados.data, d: data})
          })
          .catch(erro => {res.render('error', {error: erro})})
      }
    })
    .catch(erro => res.render('error', {error: erro}))
})

// Pesquisa nas notícias
router.post('/news/search', verificaToken, function(req, res){
  var data = new Date().toISOString().substring(0,16)
  if(req.body.search == ""){
    axios.get(env.apiAccessPoint + '/news/list?token=' + req.cookies.token)
      .then(dados => {
        res.render('home', {u: req.user, news: dados.data, d: data})
      })
      .catch(erro => res.render('error', {error: erro}))
  }else{
    axios.post(env.apiAccessPoint + '/news/search?token=' + req.cookies.token, req.body)
    .then(dados => {
      res.render('home', {u: req.user, news: dados.data, d: data})
    })
    .catch(erro => res.render('error', {error: erro}))
  }
})

// Adicionar uma notícia
router.post('/news/add', verificaToken, function(req, res){
  axios.get(env.apiAccessPoint + '/resource/' + req.body.resourceName + "?token=" + req.cookies.token)
    .then(dados => {
      var n = {
        username: req.body.username,
        resourceName: req.body.resourceName,
        event: req.body.event,
        date: new Date().toISOString().slice(0, 19).split('T').join(' '),
        visibility: dados.data[0].visibility // A mesma do recurso
      }

      axios.post(env.apiAccessPoint + '/news/add?token=' + req.cookies.token, n)
        .then(dados => {
          res.redirect('/home')
        })
        .catch(erro => {res.render('error', {error: erro})})
    })
    .catch(erro => {res.render('error', {error: erro})})
})

// Editar uma notícia
router.post('/news/edit/:id', verificaToken, function(req, res){
  var n = {
    _id: req.params.id,
    username: req.body.username,
    resourceName: req.body.resourceName,
    event: req.body.event,
    date: new Date().toISOString().slice(0, 19).split('T').join(' '),
    visibility: req.body.visibility,
  }

  axios.post(env.apiAccessPoint + '/news/edit/' + req.params.id + "?token=" + req.cookies.token, n)
    .then(dados => {
      res.redirect('/home')
    })
    .catch(erro => {res.render('error', {error: erro})})
})
module.exports = router;
