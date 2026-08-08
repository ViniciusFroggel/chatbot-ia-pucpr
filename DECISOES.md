# Decisões técnicas e aprendizados

## Por que essa stack

Escolhi ASP.NET Core 8 por ser a stack em que tenho mais domínio e maior facilidade de defender
decisões técnicas — já usei em outros projetos pessoais e no trabalho, o que reduziu o tempo gasto
resolvendo dúvidas de linguagem/framework e deixou mais espaço pra focar na arquitetura em si.
Cheguei a considerar Python (FastAPI), que teria uma integração mais direta com SDKs de IA, mas
como o módulo de IA generativa é só uma peça do sistema (o core é autenticação e persistência),
não valia a pena trocar de stack só por causa disso — inclusive, chamar a API REST da IA
diretamente via `HttpClient`, sem depender de um SDK específico de linguagem, acabou sendo uma
vantagem: trocar de provedor de IA no meio do projeto foi trivial.

Optei por Clean Architecture (Domain, Application, Infrastructure, Api) em vez de uma estrutura
mais simples de Controller-Service porque o projeto tem uma peça que sabidamente ia mudar — o
provedor de IA generativa. Modelar isso como uma interface (`IAIProvider`) na camada de Application
significou que trocar de Gemini pra Groq, no meio do desenvolvimento, não exigiu tocar em nenhuma
outra camada: só uma nova implementação em `Infrastructure/AI` e uma linha a mais no registro de
DI. Isso validou na prática o motivo de se pagar o custo extra de organização dessa arquitetura.

Para persistência, usei SQLite em vez de PostgreSQL/SQL Server por simplicidade — não exige subir
um container de banco separado, o que facilita tanto testar localmente quanto fazer o deploy inicial
sem depender de infraestrutura externa. Sei que isso tem trade-offs em produção (o disco do Render
free tier não é persistente entre deploys), mas pro escopo atual do projeto foi a escolha certa.

## O que aprendi

O maior aprendizado não foi de código, e sim de infraestrutura de terceiros: durante os testes,
a API do Gemini passou a gerar chaves com cota zero pra várias contas novas (um problema conhecido,
não específico deste projeto), o que me forçou a trocar de provedor de IA sob pressão de prazo.
Foi exatamente aí que a decisão de isolar a IA atrás de uma interface se provou valiosa — a troca
pra Groq levou minutos, não horas. Isso reforçou uma lição prática: abstrair dependências externas
não é excesso de engenharia, é redução de risco.

Também aprendi (ou revisei) o fluxo de deploy com Docker multi-stage e a diferença entre rodar
localmente vs. em produção — principalmente detalhes como o Render injetar a porta via variável de
ambiente `PORT`, que precisa ser lida dinamicamente pelo Kestrel (`ASPNETCORE_URLS`), e a
importância de nunca commitar segredos (chaves de API, `Jwt:Key`) direto no `appsettings.json`,
preferindo variáveis de ambiente tanto localmente quanto no provedor de hospedagem.
