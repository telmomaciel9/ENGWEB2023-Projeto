# TP de Engenharia Web 2023 - Plataforma de Gestão e Disponibilização de Recursos Educativos (PGDRE)

## Elementos do grupo de trabalho
- Gonçalo Martins dos Santos - a95354
- Telmo José Pereira Maciel - a96569

## Introdução
O nosso grupo, para o trabalho prático de Engenharia Web do ano 2023, decidiu
abordar o tema da Plataforma de Gestão e Disponibilização de Recursos Educativos ou, de forma abreviada, *PGDRE*.

O objetivo para este tema era desenvolver uma plataforma que servisse para partilhar e gerir recursos educacionais. Foi proposto o modelo *OAIS*
(Open Archival Information System) como sistema para divulgação, disseminação, gestão e armazenamento dos recursos educativos, sistema o qual, decidimos seguir e implementar no nosso trabalho.

Neste relatório vamos abordar como está organizada a aplicação, de que maneira os
dados são guardados e geridos, as funcionalidades implementadas na plataforma e uma
pequena demonstração da mesma.

## Estrutura/Arquitetura da plataforma
Na diretoria principal da nossa plataforma, podemos reparar que esta é construída
por 3 servidores: APP_SERVER, API_SERVER e AUTH_SERVER. Cada um serve um propósito bem definido e a comunicação entre eles é fundamental para conceber a plataforma
pretendida.

### Interação entre as diferentes componentes
Nesta secção vamos passar a explicar melhor como os 3 servidores se relacionam
para responder aos vários pedidos que um utilizador possa fazer. Analisemos o seguinte diagrama:

![estrutura](https://github.com/goncalosantos3/ENGWEB2023-Projeto/assets/73351929/14d9aca5-1ec0-4fda-9922-82161ce4fc0c)

Tendo como refenrência o diagrama, vamos passar à explicação detalhada de cada servidor.

#### APP_SERVER
O APP_SERVER é o principal servidor na plataforma por ser o servidor que
conecta todas as outras componentes e também por ser o servidor que comunica diretamente com o utilizador.

Este servidor trata de todos os pedidos do utilizador e usa como suporte os outros dois servidores (AUTH_SERVER e API_SERVER) para dar resposta aos pedidos do utilizador.

Mais concretamente, este servidor faz pedidos ao API_SERVER para obter informação sobre os recursos, as notícias e posts. Faz pedidos ao AUTH_SERVER para obter informação sobre os utilizadores para puder fazer várias coisas como autenticar utilizadores, editar os perfis e ter níveis de acesso diferentes para cada utilizador (admin, producer e consumer).

#### API_SERVER
O API_SERVER é o servidor responsável por gerir toda a informação sobre os
recursos, os posts e as notícias. Gerir esta informação inclui: criar, editar, listar e remover recursos, notícias e posts. Para isso, foram criadas 3 coleções diferentes na base de dados da plataforma PGDRE cada uma para cada tipo de entidade.

Ao contrário do APP_SERVER, este servidor não gera qualquer tipo de interface
apenas responde aos pedidos deste servidor consultando a base de dados.

#### AUTH_SERVER
O AUTH_SERVER é o servidor responsável por gerir toda a informação sobre os
utilizadores. Gerir esta informação inclui: criar, editar, listar, desativar e ativar utilizadores. Para isso, foi criada 1 coleção na base de dados da plataforma PGDRE para armazenar a informação dos diversos utilizadores.

Para além disto, este servidor é responsável por gerar um jwt (Json Web Token)
para cada utilizador que se autenticar com sucesso na plataforma. Este token é posteriormente passado para o APP_SERVER para que o cliente possa-o guardar nas suas cookies. Este token serve para todos os servidores verificarem se um dado utilizador está autenticado ou não e, para além disso, verificarem o seu username, o seu nível e se está ativo ou não (todos estes campos são guardados no payload do token). Desta forma, a autenticação de utilizadores e os diferentes níveis de acesso dos mesmos são implementados.

Ao contrário do APP_SERVER, este servidor não gera qualquer tipo de interface
apenas responde aos pedidos deste servidor consultando a base de dados.

## Persistência de Dados
Para persistir os dados, o grupo decidiu usar uma Base de Dados não relacional
recorrendo ao MongoDB. Como sabemos que as base de dados não estão preparadas para
guardar ficheiros, para além da base de dados recorremos ao file system para guardar os vários recursos e as diferentes fotos de perfil dos utilizadores. A base de dados chama-se PGDRE, nela criamos 4 coleções: users, resources, posts e news.

Passamos agora à explicação de cada uma.

### Users
Esta coleção é responsável por guardar os dados de todos os utilizadores da plataforma. Mais concretamente, cada documento desta coleção tem a seguinte estrutura:

- email: string que guarda o email associado ao utilizador;
- name: string que representa o nome do utilizador;
- username: string que representa o nome do utilizador na plataforma;
- password: string que guarda a palavra-passe do utilizador;
- level: string que representa o tipo de utilizador (Admin, Producer ou Consumer);
- dateCreated: string que guarda a data de criação da conta;
- lastAccess: string que guarda a data de último acesso à plataforma;
- active: boolean que indica se a conta está ativa ou não;
- profilePic: string que guarda o nome do ficheiro que é a foto de perfil do utilizador.

Desta maneira, toda a informação de cada utilizador é guardada na Base de Dados.
O ficheiro que é a foto de perfil do utilizador está guardado no file system, o campo "profilePic" apenas tem o nome desse ficheiro.

### Resources
Esta coleção é responsável por guardar os dados de todos os recursos da plataforma. Mais concretamente, cada documento desta coleção tem a seguinte estrutura:

- resourceName: string que guarda o nome do recurso;
- files: lista de strings que contém os nomes dos ficheiros que o recurso contém
(apenas o conteúdo);
- title: string que guarda o título do recurso;
- subtitle: string que guarda o subtítulo do recurso;
- type: string que guarda o tipo do recurso (Artigo, Ficha, Relatório, Slides, Tese ou Teste);
- dateCreation: string que representa a data de criação do recurso;
- dateSubmission: string que representa a data de submissão do recurso;
- visibility: string que representa a visibilidade do recurso (Public ou Private);
- author: string que guarda o nome do autor do recurso;
- submitter: string que guarda o nome do submissor do recurso;
- evaluation: objeto que representa a avaliação atual do recurso.

Desta maneira, toda a informação de cada recurso é guardada na Base de Dados. O
recurso em si é guardado usando o file system, na Base de Dados apenas ficam guardados os meta-dados do recurso.

### Posts
Esta coleção é responsável por guardar os dados de todos os posts da plataforma. Mais concretamente, cada documento desta coleção tem a seguinte estrutura:

- resourceName: string que guarda o nome do recurso associado ao post;
- username: string que guarda o nome do utilizador que fez o post;
- title: string que representa o título do post;
- description: string que representa a descrição do post;
- liked_by: lista com os nomes dos utilizadores que deram like ao post;
- date: data de submissão do post;
- visibility: string que representa a visibilidade do post (tem que ser a mesma do
recurso a que está associado);
- comments: lista de comentários feitos a este post. Cada comentário é um objeto.

Desta maneira, toda a informação de cada post é guardada na Base de Dados.

### News
Esta coleção é responsável por guardar os dados de todas as notícias da plataforma. Mais concretamente, cada documento desta coleção tem a seguinte estrutura:

- username: string que guarda o nome do utilizador que deu a notícia;
- resourceName: string que guarda o nome do recurso ao qual a notícia está associada;
- event: string que representa o evento que a notícia reporta;
- date: string que representa a data de submissão da notícia;
- visibility: string que representa a visibilidade da notícia (tem que ser a mesma do recurso ao que está associada).

Desta maneira, toda a informação de cada notícia é guardada na Base de Dados.

## Funcionalidades implementadas
Nesta secção vamos falar, resumidamente, das funcionalidades disponíveis na nossa
plataforma.

### Recursos
Para os recursos, implementamos as seguintes funcionalidades:

1. Adição de novos recursos
2. Edição de recursos
3. Eliminação de recursos
4. Consulta de recursos
5. Download de recursos
6. Avaliação de recursos

#### Adição de recursos

Na adição de novos recursos, é feita uma verificação detalhada sobre a validade do
mesmo:

- É verificado se o nome do recurso já existe na plataforma ou não;
- É verificado se o recurso é um zip ou não;
- É verificado se o recurso contém os ficheiros manifest.txt e PGDRE-SIP.json;
- É verificado se estes dois ficheiros são válidos ou não;
- É verificado se existem mais ficheiros para além dos dois referidos acima (é verificado se existe algum "conteúdo");

Só depois do recurso passar a todas estas as validações é que este é adicionado à
plataforma.

### Posts
Para os posts, implementamos as seguintes funcionalidades:

1. Adição de um post a um recurso
2. Edição de um post
3. Eliminação de um post
4. Consulta de um post
5. Gostar de um post
6. Comentar um post

### Notícias
Para as notícias, implementamos as seguintes funcionalidades:

1. Adição de uma notícia
2. Eliminação de uma notícia
3. Edição de uma notícia

### Utilizadores
Sobre os utilizadores e os seus perfis, todos os níveis de utilizadores podem editar o seu perfil e desativar a sua conta. Os utilizadores podem ainda adicionar uma foto de perfil.

Para além disto, os administradores podem adicionar novas contas, desativar e ativar qualquer conta e investigar contas (ver os detalhes de uma conta).

## Conclusão
Agora concluído o trabalho prático da Unidade Curricular de Engenharia Web, achamos
que cumprimos com a totalidade dos objetivos propostos e ainda tivemos a vontade
e capacidade de cumprir com outros que nós próprios quisemos impor. Acabamos este
projeto com a sensação de que este foi o maior e mais desafiante projeto já realizado por qualquer membro do grupo e que, por isso, houveram vários problemas que ocorreram ao longo do desenvolvimento da plataforma que nos puseram à prova e que nos motivaram a continuar com o projeto.

Acreditamos que, apesar de este projeto ainda não estar em fase final de entrega
(num contexto real), a nossa plataforma poderia servir como uma base sólida para algo orientado para o mundo real.

Concluindo, ficamos satisfeitos com o resultado final do nosso projeto.