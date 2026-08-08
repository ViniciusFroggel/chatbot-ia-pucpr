# ChatbotIA

![CI](https://github.com/ViniciusFroggel/chatbot-ia-pucpr/actions/workflows/ci.yml/badge.svg)

Backend de um chatbot de suporte de TI, construído em ASP.NET Core 8 seguindo os princípios da
Clean Architecture. Usuários se autenticam via JWT e podem enviar perguntas para um assistente de
IA, que responde e classifica automaticamente o assunto (rede, impressora, acesso, hardware,
software etc.), mantendo um histórico de atendimentos por usuário.

## Funcionalidades

- Cadastro e login de usuários com autenticação via JWT
- Envio de perguntas para um assistente de IA especializado em suporte de TI
- Classificação automática da categoria do atendimento
- Histórico de atendimentos por usuário

## Arquitetura

Organizado em 4 camadas, seguindo a regra de dependência da Clean Architecture (as camadas de
fora dependem das de dentro, nunca o contrário):

```
ChatbotIA/
├── ChatbotIA.Domain/            → Entidades e enums, sem nenhuma dependência externa
│   ├── Entities/ (User, Atendimento)
│   └── Enums/ (CategoriaAtendimento)
│
├── ChatbotIA.Application/       → Regras de negócio e contratos (interfaces)
│   ├── Interfaces/ (IUserRepository, IAtendimentoRepository, ITokenService, IPasswordHasher, IAIProvider)
│   ├── DTOs/
│   └── Services/ (AuthService, AtendimentoService)
│
├── ChatbotIA.Infrastructure/    → Implementações concretas
│   ├── Persistence/ (AppDbContext, Repositories — EF Core + SQLite)
│   ├── Auth/ (JwtTokenService, BCryptPasswordHasher)
│   ├── AI/ (GroqAIProvider — integração com a API da Groq)
│   └── DependencyInjection.cs
│
└── ChatbotIA.Api/               → Composition root
    ├── Controllers/ (AuthController, AtendimentoController)
    └── Program.cs
```

A camada `IAIProvider` é uma interface — trocar o provedor de IA (Groq, Gemini, OpenAI etc.) não
exige mudanças em nenhuma outra camada, só uma nova implementação em `Infrastructure/AI` e o
registro no `DependencyInjection.cs`.

## Stack

- ASP.NET Core 8 (Web API)
- Entity Framework Core + SQLite
- JWT Bearer para autenticação
- BCrypt.Net para hash de senha
- Groq API (Llama 3.3 70B) para a IA generativa
- Swagger para documentação interativa

## Como rodar

### 1. Configure a chave da Groq

Gere uma chave gratuita em **https://console.groq.com/keys** ("Create API Key").

Defina como variável de ambiente antes de rodar (nunca coloque a chave direto no
`appsettings.json`):

```bash
# Git Bash / Linux / macOS
export Groq__ApiKey="gsk_sua_chave_aqui"
```

```powershell
# PowerShell
$env:Groq__ApiKey="gsk_sua_chave_aqui"
```

### 2. Rode a aplicação

```bash
dotnet restore
dotnet run --project ChatbotIA.Api
```

O banco SQLite (`chatbotia.db`) é criado automaticamente no primeiro start. A API sobe por padrão
em `http://localhost:5000` — confira a porta exata no console. Documentação interativa disponível
em `/swagger`.

## Endpoints

### `POST /api/auth/register`
Cria um novo usuário e retorna um token JWT.
```json
{
  "name": "Nome Completo",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### `POST /api/auth/login`
Autentica um usuário existente e retorna um token JWT.
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### `POST /api/atendimentos` 🔒
Envia uma pergunta para a IA, que responde e classifica o assunto. Requer
`Authorization: Bearer {token}`.
```json
{
  "pergunta": "Minha impressora não está imprimindo, o que eu faço?"
}
```

### `GET /api/atendimentos` 🔒
Lista o histórico de atendimentos do usuário logado, mais recentes primeiro.

## Testando no Postman

Uma collection pronta está disponível em `ChatbotIA-Postman-Collection.json`, com os 4 endpoints
já configurados e uma variável de collection (`token`) que se preenche automaticamente após o
login/registro.

## Roadmap

- Front-end consumindo os endpoints
- Paginação e filtro por categoria em `GET /api/atendimentos`
