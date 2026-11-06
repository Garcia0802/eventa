# EVENTA
### Descubra. Participe. Compartilhe.

## 1. Problema atual identificado

Atualmente, muitas pessoas encontram dificuldades para descobrir eventos que acontecem em sua cidade ou região. Informações sobre festas, campeonatos esportivos, palestras, feiras e atividades culturais costumam estar distribuídas em diferentes redes sociais e plataformas, dificultando sua localização.

Além disso, pequenos organizadores frequentemente utilizam métodos manuais para divulgar eventos, controlar inscrições e acompanhar os participantes, o que pode tornar a organização menos prática e eficiente.

## 2. Contexto e público afetado

O problema afeta principalmente dois grupos:

- **Participantes:** pessoas que desejam encontrar eventos de seu interesse, obter informações e realizar inscrições de maneira simples.
- **Organizadores:** pessoas, grupos ou instituições que promovem eventos e precisam divulgar suas atividades e administrar as inscrições dos participantes.

A aplicação terá como público pessoas interessadas em atividades sociais, esportivas, culturais, educacionais e de lazer, além de organizadores de eventos de diferentes categorias.

## 3. Justificativa

A criação do Eventa se justifica pela necessidade de centralizar a divulgação e o gerenciamento de eventos em uma única plataforma.

A utilização de uma aplicação mobile pode facilitar o acesso às informações, permitir que os participantes encontrem atividades de seu interesse e oferecer aos organizadores uma maneira mais organizada de administrar seus eventos.

Além disso, o projeto proporciona a aplicação prática de conhecimentos de desenvolvimento mobile, integração com APIs, bancos de dados, autenticação e controle de acesso de usuários.

## 4. Proposta de solução

Desenvolver uma aplicação mobile chamada Eventa, destinada à divulgação, consulta e gerenciamento de eventos.

A plataforma permitirá que participantes visualizem eventos disponíveis, consultem informações e realizem inscrições diretamente pelo aplicativo.

Os organizadores poderão cadastrar novos eventos, editar informações, cancelar atividades e consultar os participantes inscritos.

A aplicação contará com diferentes níveis de usuário, garantindo que cada perfil tenha acesso às funcionalidades correspondentes às suas responsabilidades.

## 5. Nome da aplicação

**EVENTA — Descubra. Participe. Compartilhe.**

O nome Eventa foi escolhido por representar diretamente a proposta da aplicação: conectar pessoas a eventos e facilitar a organização de atividades.

## 6. Tipos de usuário

A aplicação contará inicialmente com dois níveis de usuário:

### Participante

Pessoa que utiliza a plataforma para encontrar eventos e realizar inscrições.

### Organizador

Pessoa responsável por cadastrar, divulgar e gerenciar eventos dentro da plataforma.

## 7. Permissões iniciais

As permissões serão divididas conforme o tipo de usuário.

| Funcionalidade | Participante | Organizador |
|---|:---:|:---:|
| Visualizar eventos | ✓ | ✓ |
| Pesquisar eventos | ✓ | ✓ |
| Consultar detalhes | ✓ | ✓ |
| Realizar inscrições | ✓ | — |
| Cancelar próprias inscrições | ✓ | — |
| Consultar próprias inscrições | ✓ | — |
| Criar eventos | — | ✓ |
| Editar próprios eventos | — | ✓ |
| Cancelar próprios eventos | — | ✓ |
| Consultar inscritos | — | ✓ |

O controle das permissões será realizado principalmente no backend, impedindo que usuários executem ações não autorizadas.

O cadastro público criará usuários como participantes. A atribuição do perfil de organizador será realizada por meio de autorização específica, evitando que qualquer pessoa altere livremente seu próprio nível de acesso.

## 8. Principais funcionalidades

### Para participantes

- Cadastro e login.
- Visualização dos eventos disponíveis.
- Pesquisa por nome e categoria.
- Consulta de informações detalhadas dos eventos.
- Realização de inscrições.
- Cancelamento de inscrições.
- Consulta das inscrições realizadas.
- Visualização e edição do próprio perfil.

### Para organizadores

- Cadastro e gerenciamento de eventos.
- Edição das informações dos eventos.
- Cancelamento de eventos.
- Consulta dos eventos cadastrados.
- Visualização dos participantes inscritos.
- Acompanhamento da quantidade de inscrições.

### Recursos gerais

- Autenticação de usuários.
- Controle de níveis de acesso.
- Integração com banco de dados.
- Comunicação entre aplicativo e API REST.
- Armazenamento seguro de senhas.
- Autenticação utilizando JWT.

## 9. Telas previstas

O aplicativo contará inicialmente com as seguintes telas:

### Telas comuns

- **Boas-vindas:** apresentação inicial da aplicação.
- **Login:** acesso à plataforma.
- **Cadastro:** criação de uma conta.

### Área do participante

- **Início:** apresentação dos eventos em destaque e próximos eventos.
- **Explorar:** pesquisa e filtragem de eventos.
- **Detalhes do evento:** informações completas sobre a atividade selecionada.
- **Minhas inscrições:** consulta dos eventos nos quais o participante está inscrito.
- **Perfil:** informações e configurações da conta.

### Área do organizador

- **Painel:** resumo dos eventos e inscrições.
- **Meus eventos:** listagem dos eventos cadastrados.
- **Criar/editar evento:** formulário para gerenciamento das informações.
- **Participantes:** consulta das pessoas inscritas nos eventos.

## 10. Fluxo inicial de navegação

O fluxo inicial da aplicação será organizado de acordo com o nível de acesso do usuário.

### Fluxo geral

1. O usuário abre o aplicativo.
2. Visualiza a tela de boas-vindas.
3. Escolhe entrar em sua conta ou realizar um cadastro.
4. Após o login, o sistema identifica seu nível de acesso.
5. O usuário é direcionado à área correspondente.

### Fluxo do participante

Boas-vindas → Login/Cadastro → Início → Explorar → Detalhes do evento → Inscrição → Minhas inscrições.

### Fluxo do organizador

Boas-vindas → Login → Painel → Meus eventos → Criar ou editar evento → Gerenciar participantes.

A navegação será desenvolvida utilizando React Navigation, com fluxos separados para participantes e organizadores.

---

## Tecnologias previstas

| Tecnologia | Aplicação |
|---|---|
| React Native | Desenvolvimento mobile |
| Expo | Ambiente de desenvolvimento e build |
| React Navigation | Navegação entre telas |
| Node.js | Ambiente do backend |
| Express | Desenvolvimento da API REST |
| MySQL | Banco de dados relacional |
| JavaScript | Linguagem de programação |
| JWT | Autenticação e identificação da sessão |
| bcryptjs | Hash das senhas |
| Git e GitHub | Versionamento do projeto |

## Objetivo do projeto

O objetivo do Eventa é desenvolver uma solução tecnológica que facilite a divulgação e a organização de eventos, oferecendo aos participantes uma maneira prática de encontrar atividades e realizar inscrições, enquanto proporciona aos organizadores ferramentas para gerenciar seus eventos.

O desenvolvimento será realizado incrementalmente, contemplando a criação da interface mobile, integração com banco de dados, implementação de autenticação, controle de permissões, testes e geração do aplicativo Android.

---

**Projeto acadêmico — Desenvolvimento Mobile**

Aplicação desenvolvida como projeto avaliativo, utilizando React Native, Expo, Node.js, Express e MySQL.