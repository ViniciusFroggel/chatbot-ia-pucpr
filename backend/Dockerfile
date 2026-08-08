# --- Build stage ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia só os .csproj primeiro (cache de layer do restore)
COPY ChatbotIA.sln .
COPY ChatbotIA.Domain/ChatbotIA.Domain.csproj ChatbotIA.Domain/
COPY ChatbotIA.Application/ChatbotIA.Application.csproj ChatbotIA.Application/
COPY ChatbotIA.Infrastructure/ChatbotIA.Infrastructure.csproj ChatbotIA.Infrastructure/
COPY ChatbotIA.Api/ChatbotIA.Api.csproj ChatbotIA.Api/

RUN dotnet restore ChatbotIA.sln

# Copia o resto do código e publica
COPY . .
RUN dotnet publish ChatbotIA.Api/ChatbotIA.Api.csproj -c Release -o /app/publish --no-restore

# --- Runtime stage ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# O Render injeta a variável PORT em tempo de execução — o Kestrel precisa escutar nela
EXPOSE 8080
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet ChatbotIA.Api.dll"]