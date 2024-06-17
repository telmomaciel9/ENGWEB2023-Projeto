
function showNews(un, rn, ev, dt, vi){
    cont = `<div>
    <h1>Notícia</h1>
    <ul>
        <li><b>Utilizador:</b> ` + un + `</li>
        <li><b>Nome do Recurso:</b> ` +rn + `</li>
        <li><b>Evento:</b> ` + ev + `</li>
        <li><b>Data:</b> ` + dt + `</li>`
            
    if(vi == "Private"){
        cont += `<li><b>Visibilidade da Notícia:</b> Privada</li>`
    }else{
        cont += `<li><b>Visibilidade da Notícia:</b> Pública</li>`
    }

    cont += `</ul>
        <btn><a href="/home">Ok</a></btn>
    </div>`

    var popup = $(cont)

    // Limpa tudo o que poderia ter no modal
    $("#display").empty()
    $("#display").append(popup)
    $("#display").modal()
}

function evaluateResource(rn){
    var popup = $(`<h1>Submeta a sua avaliação</h1>
        <center>
            <form action="/resources/` + rn + `/evaluate" method="POST">
                <select name="ev">
                    <option value="0"> 0⭐</option>
                    <option value="1"> 1⭐</option>
                    <option value="2"> 2⭐</option>
                    <option value="3"> 3⭐</option>
                    <option value="4"> 4⭐</option> 
                    <option value="5"> 5⭐</option>
                </select>
                <input type="image" alt="evaluate icon" src="/images/evaluate.png" height="30" width="30"/>
            </form>
        </center>
        <a href="/resources/` + rn + `">Cancelar</a>
    `)

    // Limpa tudo o que poderia ter no modal
    $("#display").empty()
    $("#display").append(popup)
    $("#display").modal()
}

function showComment(rn, pid, un, ti, desc, dt){
    var popup = $(`<div>
        <h1>Comentário</h1>
        <ul>
            <li><b>Utilizador:</b> ` + un + `</li>
            <li><b>Título:</b> ` + ti + `</li>
            <li><b>Descrição:</b> ` + desc + `</li>
            <li><b>Data:</b> ` + dt + `</li>
        </ul>
        <a href="/resources/` + rn + `/posts/` + pid + `">Ok</a>
    </div>`)

    // Limpa tudo o que poderia ter no modal
    $("#display").empty()
    $("#display").append(popup)
    $("#display").modal()
}

function showProfilePic(level, fname, username){
    if(fname != "profile.png"){
        var pic = $('<img src="/profilePics/' + level + '/' + fname + '" width="400px"/>')
    }else{
        var pic = $('<img src="/images/profile.png" width="400px"/>')
    }

    if(username == undefined){
        // Fazer download da própria foto de perfil
        var download = $('<div><a href="/profile/profilePic/download">Download</a></div>')
    }else{
        // Fazer download da foto de perfil de outro user
        var download = $('<div><a href="/profile/profilePic/download/' + username + '">Download</a></div>')
    }
    
    // Limpa tudo o que poderia ter no modal
    $("#display").empty()
    $("#display").append(pic, download)
    $("#display").modal()
}

function showUser(route, un, le, na, email, dC, lA, active){
    var popup = $(`<div>
        <h1>Utilizador (`+ le + `)</h1>
        <ul>
            <li><b>Nome de utilizador:</b> ` + un + `</li>
            <li><b>Nome:</b> ` + na + `</li>
            <li><b>Email:</b> ` + email + `</li>
            <li><b>Data de Criação da conta:</b> ` + dC + `</li>
            <li><b>Data de último acesso à plataforma:</b> ` + lA + `</li>
            <li><b>Ativo:</b> ` + active + `</li>
        </ul>
        <a href="` + route + `">Ok</a>
    </div>`)

    // Limpa tudo o que poderia ter no modal
    $("#display").empty()
    $("#display").append(popup)
    $("#display").modal()
}