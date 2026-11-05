# EVENTA

Aplicativo mobile acadêmico de descoberta, divulgação e gerenciamento de eventos.

## Visão geral

O EVENTA é um app mobile desenvolvido em React Native com Expo para facilitar a descoberta, participação e organização de eventos locais. A estrutura inicial foi criada com navegação funcional para demonstrar os fluxos de participante e organizador.

## Estrutura do projeto

```text
eventa/
├── App.js
├── app.json
├── index.js
├── package.json
├── assets/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── navigation/
│   ├── screens/
│   │   ├── common/
│   │   ├── participant/
│   │   └── organizer/
│   ├── styles/
│   └── utils/
├── README.md
├── .gitignore
└── LICENSE
```

## Tecnologias

- React Native
- Expo
- React Navigation
- JavaScript

## Fluxos implementados

### Participante
- Início
- Explorar
- Minhas inscrições
- Perfil

### Organizador
- Painel
- Meus eventos
- Criar evento
- Perfil

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o projeto Expo:

```bash
npx expo start
```

3. Abra o app no Expo Go ou em um emulador.

## Identidade visual

- Azul-marinho: `#101C35`
- Azul secundário: `#243B63`
- Azul de destaque: `#4778D0`
- Fundo: `#F5F7FB`
- Branco: `#FFFFFF`
- Texto: `#202B3C`
- Texto secundário: `#778397`

## Observações

- A seleção de perfil entre participante e organizador é demonstrativa e visual, conforme solicitado na etapa inicial.
- Os dados atuais são demonstrativos e não representam backend real.
- A etapa de API e banco de dados será evoluída nas próximas partes do desenvolvimento.
