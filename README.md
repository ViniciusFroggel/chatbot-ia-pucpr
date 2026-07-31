# ChatbotIA API — Checkpoint Encontro 1

Backend do chatbot (Desafio DevOps e IA · PUCPR), em **Clean Architecture**. Implementado:
**registro/login** com JWT e o módulo de **atendimento** (pergunta → resposta do Gemini →
categorização automática → histórico salvo no banco).

## Arquitetura

```
ChatbotIA/
├── ChatbotIA.Domain/            → Entidades puras (User, Atendimento), sem dependências
│   ├── Entities/
│   └── Enums/ (CategoriaAtendimento)
│
├── ChatbotIA.Application/       → Regras de negócio + contratos (interfaces)
│   ├── Interfaces/ (IUserRepository, IAtendimentoRepository, ITokenService, IPasswordHasher, IAIProvider)
│   ├── DTOs/
│   └── Services/ (AuthService, AtendimentoService)
│
├── ChatbotIA.Infrastructure/    → Implementações concretas
│   ├── Persistence/ (AppDbContext, UserRepository, AtendimentoRepository — EF Core + SQLite)
│   ├── Auth/ (JwtTokenService, BCryptPasswordHasher)
│   ├── AI/ (GeminiAIProvider + GeminiOptions — chama a API REST do Gemini)
│   └── DependencyInjection.cs (registra tudo isso no container)
│
└── ChatbotIA.Api/               → Composition root
    ├── Controllers/ (AuthController, AtendimentoController)
    └── Program.cs
```

**Regra de dependência:** `Domain` não depende de nada · `Application` depende só de `Domain` ·
`Infrastructure` implementa as interfaces da `Application` · `Api` referencia `Infrastructure`
(que carrega `Application`/`Domain` transitivamente) e faz a injeção via
`builder.Services.AddInfrastructure(...)`.

## Stack
- ASP.NET Core 8 (Web API)
- Entity Framework Core + SQLite
- JWT Bearer para autenticação
- BCrypt.Net para hash de senha
- Swagger

## Configurando a chave da Groq

Gere uma chave gratuita (sem cartão) em **https://console.groq.com/keys** → "Create API Key".

**Não coloque a chave real dentro de `appsettings.json`** — esse arquivo vai pro Git e pro
professor. Em vez disso, defina uma variável de ambiente antes de rodar (o ASP.NET Core lê
automaticamente `Groq__ApiKey` — com dois underscores — e sobrescreve o valor do JSON):

**Git Bash / MINGW64 (o seu terminal):**
```bash
export Groq__ApiKey="gsk_sua_chave_aqui"
```

**PowerShell:**
```powershell
$env:Groq__ApiKey="gsk_sua_chave_aqui"
```

Isso vale só pra sessão atual do terminal — rode isso e, na sequência (no mesmo terminal), o
`dotnet run`.

## Como rodar

```bash
dotnet restore
dotnet run --project ChatbotIA.Api
```

A API sobe por padrão em `http://localhost:5000` (confira a porta exata no console — pode variar).
O banco SQLite (`chatbotia.db`) é criado automaticamente no primeiro start, dentro de `ChatbotIA.Api/`.

Acesse `http://localhost:5000/swagger` pra ver a documentação interativa.

> Antes de subir pro GitHub (mesmo privado), troque a chave em `ChatbotIA.Api/appsettings.json` →
> `Jwt:Key` por um valor secreto de verdade.

## Endpoints

### `POST /api/auth/register`
Cria um novo usuário e já retorna um token JWT.

```json
{
  "name": "Vinicius Miranda",
  "email": "vinicius@teste.com",
  "password": "senha123"
}
```
**201 Created** →
```json
{
  "token": "eyJhbGciOi...",
  "name": "Vinicius Miranda",
  "email": "vinicius@teste.com",
  "expiresAt": "2026-07-25T20:00:00Z"
}
```
**409 Conflict** se o e-mail já existir.

### `POST /api/auth/login`
Autentica um usuário existente e retorna um token JWT.

```json
{
  "email": "vinicius@teste.com",
  "password": "senha123"
}
```
**200 OK** → mesmo formato do register · **401 Unauthorized** se e-mail/senha inválidos.

### `POST /api/atendimentos` 🔒 (requer token)
Manda uma pergunta pra IA (Groq/Llama), que responde e já classifica o assunto. Salva no
histórico do usuário logado.

Header: `Authorization: Bearer {token}`
```json
{
  "pergunta": "Minha impressora não está imprimindo, o que eu faço?"
}
```
**200 OK** →
```json
{
  "id": 1,
  "pergunta": "Minha impressora não está imprimindo, o que eu faço?",
  "resposta": "Verifique se a impressora está ligada e conectada à rede...",
  "categoria": "Impressora",
  "criadoEm": "2026-07-25T20:00:00Z"
}
```
**401 Unauthorized** sem token válido.

### `GET /api/atendimentos` 🔒 (requer token)
Lista o histórico de atendimentos do usuário logado, mais recentes primeiro.

## Testando no Postman

1. Importe o arquivo `ChatbotIA-Postman-Collection.json` (Postman → Import).
2. Ajuste a variável `baseUrl` da collection se a porta que o `dotnet run` mostrar for diferente de 5000.
3. Rode **Register** ou **Login** — o token é salvo automaticamente na variável de collection `{{token}}`.
4. Rode **Perguntar (IA)** — já usa `Authorization: Bearer {{token}}` sozinho, não precisa colar nada manualmente.
5. Rode **Listar meus atendimentos** pra conferir que ficou salvo no histórico.
6. Confira no Swagger (`/swagger`) que o schema e os status codes batem com o que está documentado acima.

## Próximos passos (Sprint 2+)
- Issues no GitHub com as tarefas do Encontro 2
- Paginação/filtro por categoria em `GET /api/atendimentos`
- Front-end consumindo os 3 endpoints
