# ChatbotIA

![CI](https://github.com/ViniciusFroggel/chatbot-ia-pucpr/actions/workflows/ci.yml/badge.svg)

Chatbot de suporte de TI: os usuários se autenticam, enviam perguntas técnicas para uma IA
generativa e recebem respostas já classificadas por categoria (rede, impressora, acesso, hardware,
software), com histórico de atendimentos salvo por usuário.

**🔗 Aplicação em produção:** https://chatbot-ia-pucpr.vercel.app/login
**🔗 API em produção:** https://chatbot-ia-pucpr.onrender.com

> O backend gratuito "dorme" após um período de inatividade — a primeira requisição pode levar
> 30-50s pra responder enquanto o serviço acorda.

## Estrutura do repositório

Monorepo dividido em dois projetos independentes:

```
chatbot-ia-pucpr/
├── backend/          → API em ASP.NET Core 8 (Clean Architecture)
├── frontend/         → Interface web em React + TypeScript
├── DECISOES.md        → decisões técnicas e aprendizados do projeto
└── .github/workflows/  → pipeline de CI
```

Cada um tem seu próprio README com detalhes de arquitetura e como rodar:
- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

## Stack

**Backend:** ASP.NET Core 8 · Clean Architecture (Domain/Application/Infrastructure/Api) · Entity
Framework Core + SQLite · JWT + BCrypt · Groq API (Llama 3.3 70B) · Docker · deploy no Render

**Frontend:** React 19 + TypeScript · Vite · React Router · deploy na Vercel

**CI/CD:** GitHub Actions builda a cada push · Render e Vercel fazem deploy automático a partir do
mesmo repositório

## Principais endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cria um novo usuário e retorna um token JWT |
| `POST` | `/api/auth/login` | Autentica um usuário existente |
| `POST` | `/api/atendimentos` 🔒 | Envia uma pergunta pra IA, que responde e classifica o assunto |
| `GET` | `/api/atendimentos` 🔒 | Lista o histórico de atendimentos do usuário logado |

Detalhes completos (bodies, respostas, exemplos) em [`backend/README.md`](./backend/README.md).

## Documentação adicional

- [`DECISOES.md`](./DECISOES.md) — por que essa stack, e o que foi aprendido no processo
- Collection do Postman: [`backend/ChatbotIA-Postman-Collection.json`](./backend/ChatbotIA-Postman-Collection.json)
