# EVENTA
### Descubra. Participe. Compartilhe.

## Visão geral

O Eventa é uma plataforma de eventos com foco em participantes, organizadores e administração. A mudança principal implementada nesta versão é a criação de um modelo de permissões em três níveis:

- PARTICIPANT: usuário padrão, que pode participar e explorar eventos.
- ORGANIZER: usuário aprovado pela administração para criar e gerir eventos próprios.
- ADMIN: responsável pela moderação e aprovação de solicitações.

A aplicação continua mantendo a identidade visual atual do projeto e o fluxo de uso do mobile, com foco em segurança e controle de acesso.

## 1. Níveis de usuário

### PARTICIPANT
Perfil padrão atribuído ao realizar cadastro.

Permissões:
- Visualizar eventos.
- Pesquisar eventos.
- Consultar detalhes.
- Realizar inscrições.
- Cancelar suas próprias inscrições.
- Consultar suas inscrições.
- Editar o próprio perfil.
- Solicitar autorização para organizar eventos.

Restrições:
- Não pode criar eventos.
- Não pode editar eventos de terceiros.
- Não pode consultar participantes de eventos de terceiros.
- Não pode acessar funções administrativas.

### ORGANIZER
Usuário que foi aprovado por um administrador.

Permissões:
- Todas as permissões de PARTICIPANT.
- Criar eventos.
- Editar seus próprios eventos.
- Cancelar seus próprios eventos.
- Consultar participantes dos próprios eventos.
- Gerenciar seus eventos.

Restrições:
- Não pode editar eventos de outros organizadores.
- Não pode aprovar solicitações.
- Não pode acessar funções administrativas.

### ADMIN
Usuário administrativo responsável pela plataforma.

Permissões:
- Consultar usuários.
- Consultar todos os eventos.
- Moderar eventos.
- Aprovar ou rejeitar solicitações de organizadores.
- Gerenciar níveis de acesso.
- Consultar informações administrativas.

O admin também pode visualizar eventos e realizar inscrições, desde que respeite as regras gerais da aplicação.

## 2. Autenticação e autorização

Autenticação e autorização são conceitos diferentes:

- Autenticação: confirmar quem é o usuário no sistema (login com JWT).
- Autorização: definir quais ações um usuário pode executar com base no seu papel.

No projeto, o backend valida o token e depois consulta o usuário no banco para garantir que o perfil atual seja usado. Isso evita que um token antigo ou um valor manipulado no frontend mantenha um usuário com permissão incorreta.

## 3. Cadastro seguro

Todos os usuários começam como PARTICIPANT.

O cadastro público não aceita `role` vindo do cliente. Mesmo que o mobile envie: `role: "ADMIN"`, o backend ignora esse valor e grava o usuário como PARTICIPANT.

Isso garante que qualquer promoção de acesso só possa acontecer por processo autorizado na administração.

## 4. Solicitação para se tornar organizador

No perfil do participante, existe a opção:

- Quero me tornar organizador

Ao clicar, o usuário abre uma tela com:
- explicação sobre o processo;
- campo obrigatório: "Por que você deseja se tornar organizador?";
- limite de 300 caracteres;
- botão "Enviar solicitação";
- mensagens de confirmação e erro.

A solicitação é gravada na tabela `organizer_requests`.

## 5. Status das solicitações

Cada solicitação pode ter um destes status:

- PENDING: aguardando análise.
- APPROVED: aprovada.
- REJECTED: rejeitada.

### Quando a solicitação está PENDING
- Exibe: "Solicitação em análise."
- Não permite nova solicitação enquanto houver uma pendente.

### Quando a solicitação está APPROVED
- Exibe: "Parabéns! Sua solicitação foi aprovada. Agora você pode organizar eventos no Eventa."
- O usuário recebe o papel ORGANIZER.
- A opção de solicitar acesso desaparece.

### Quando a solicitação está REJECTED
- Exibe: "Sua solicitação não foi aprovada."
- O usuário continua como PARTICIPANT.
- Pode enviar uma nova solicitação depois.

## 6. Alterações no MySQL

A tabela `users` foi atualizada para:

```sql
ENUM('PARTICIPANT', 'ORGANIZER', 'ADMIN')
```

Com padrão `PARTICIPANT`.

Foi criada a tabela `organizer_requests`:

```sql
CREATE TABLE IF NOT EXISTS organizer_requests (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  reason VARCHAR(300) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_request_status (status),
  INDEX idx_request_user (user_id),
  INDEX idx_request_created (created_at),
  CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_request_admin FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

Regras de negócio:
- Não pode haver duas solicitações PENDING ao mesmo tempo para o mesmo usuário.
- Usuários que já sejam ORGANIZER ou ADMIN não podem enviar nova solicitação.
- Solicitações rejeitadas podem ser reenviadas.
- O histórico é preservado.

## 7. Endpoints implementados

### Solicitação do usuário

- `POST /api/organizer-requests`
- Permissão: PARTICIPANT
- Payload:

```json
{
  "reason": "Desejo organizar campeonatos esportivos na minha cidade."
}
```

- `GET /api/organizer-requests/me`
- Permissão: usuário autenticado
- Retorna o status e o histórico do usuário.

### Administração

- `GET /api/admin/organizer-requests`
- Permissão: ADMIN
- Filtragem opcional por status:

```http
GET /api/admin/organizer-requests?status=PENDING
```

- `PATCH /api/admin/organizer-requests/:id/review`
- Permissão: ADMIN
- Payload:

```json
{
  "decision": "APPROVE"
}
```

ou

```json
{
  "decision": "REJECT"
}
```

## 8. Lógica de aprovação

A aprovação é feita em transação MySQL com `SELECT ... FOR UPDATE` para garantir consistência.

Fluxo:
1. Inicia a transação.
2. Busca a solicitação com lock.
3. Verifica se existe.
4. Confirma se está `PENDING`.
5. Identifica o usuário solicitante.
6. Verifica o papel atual.
7. Se APPROVE: atualiza `users.role` para `ORGANIZER` e a solicitação para `APPROVED`.
8. Se REJECT: mantém `PARTICIPANT` e atualiza para `REJECTED`.
9. Registra `reviewed_by` e `reviewed_at`.
10. Realiza `COMMIT`.

Se falhar, executa `ROLLBACK`.

## 9. Permissões de rotas existentes

### Eventos
- Criação: ORGANIZER e ADMIN.
- Edição de próprios eventos: ORGANIZER e ADMIN.
- Cancelamento de próprios eventos: ORGANIZER e ADMIN.
- Consulta de participantes: ORGANIZER responsável e ADMIN.

### Inscrições
- Realizar inscrição: PARTICIPANT, ORGANIZER, ADMIN.
- Cancelar própria inscrição: PARTICIPANT, ORGANIZER, ADMIN.
- Consultar inscrições próprias: PARTICIPANT, ORGANIZER, ADMIN.

## 10. Navegação mobile

A navegação foi ajustada para refletir os papéis:

### PARTICIPANT
- Início
- Explorar
- Detalhes do evento
- Minhas inscrições
- Perfil
- Solicitação para se tornar organizador

### ORGANIZER
- Mantém o fluxo do participante.
- Adiciona painel e criação de eventos.

### ADMIN
- Mantém acesso geral.
- Adiciona painel de solicitações de organizadores.

## 11. Criação segura do administrador

Foi incluído um script em:

- `backend/scripts/create-admin.js`

Ele lê dados de ambiente e cria o primeiro administrador com hash bcrypt, evitando duplicidade e sem permitir promoção pública a partir do cadastro comum.

Exemplo de variáveis:

```env
ADMIN_NAME=Administrador Eventa
ADMIN_EMAIL=admin@eventa.com
ADMIN_PASSWORD=SenhaForte123
```

## 12. Testes executados

Foi executado test básico de validação de permissões com a regra de cadastro e acesso por perfil:

- Cadastro com tentativa de `role: "ADMIN"` resulta em `PARTICIPANT`.
- Usuário PARTICIPANT não consegue acessar rota administrativa.
- Usuário PARTICIPANT pode acessar rota de participante.

## 13. Como executar

### Backend

1. Crie o banco `eventa_db` no MySQL.
2. Ajuste as variáveis de ambiente em `.env`.
3. Execute o script SQL de inicialização.
4. Inicie o servidor:

```bash
cd backend
npm install
npm run dev
```

### Frontend mobile

```bash
npm install
npm start
```

## 14. Arquivos relevantes

Arquivos criados:
- `backend/src/controllers/organizerRequestController.js`
- `backend/src/controllers/adminController.js`
- `backend/src/routes/organizerRequestRoutes.js`
- `backend/src/routes/adminRoutes.js`
- `backend/scripts/create-admin.js`
- `backend/tests/role-permissions.test.js`
- `src/screens/participant/OrganizerRequestScreen.js`
- `src/screens/admin/OrganizerRequestsScreen.js`

Arquivos modificados:
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/controllers/authController.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/middleware/roleMiddleware.js`
- `backend/db.sql`
- `backend/migrations/001_roles_and_organizer_requests.sql`
- `src/context/AuthContext.js`
- `src/navigation/AppNavigator.js`
- `src/screens/participant/ProfileScreen.js`

## 15. Resultado esperado

Com esta implementação, qualquer pessoa pode se cadastrar como participante, solicitar autorização para organizar eventos e somente obter essa permissão após aprovação de um administrador. Depois da aprovação, o usuário passa a poder organizar seus próprios eventos e continuar participando dos eventos de terceiros dentro das regras do sistema.

---

## Tecnologias do projeto

| Tecnologia | Aplicação |
|---|---|
| React Native | Desenvolvimento mobile |
| Expo | Ambiente de desenvolvimento e build |
| React Navigation | Navegação entre telas |
| Node.js | Ambiente do backend |
| Express | Desenvolvimento da API REST |
| MySQL | Banco de dados relacional |
| JavaScript | Linguagem principal |
| JWT | Autenticação e sessão |
| bcryptjs | Hash de senhas |
| Git & GitHub | Versionamento do projeto |

## Objetivo do projeto

O objetivo do Eventa é desenvolver uma solução tecnológica que facilite a divulgação, organização e inscrição em eventos, oferecendo aos participantes uma experiência intuitiva e aos organizadores ferramentas para gerenciar seus eventos de maneira segura e organizada.

---

**Projeto acadêmico — Eventa**

Aplicação desenvolvida para demonstrar integração entre frontend mobile, API backend e banco de dados relacional, com foco em autenticação, autorização e gestão de usuários.