using System.Text;
using System.Text.Json;
using ChatbotIA.Application.Interfaces;
using ChatbotIA.Domain.Enums;
using Microsoft.Extensions.Options;

namespace ChatbotIA.Infrastructure.AI;

public class GroqAIProvider : IAIProvider
{
    private const string Endpoint = "https://api.groq.com/openai/v1/chat/completions";

    private const string SystemPrompt =
        "Você é um assistente de suporte de TI de uma empresa. Responda a pergunta do usuário de forma " +
        "clara, curta e objetiva, em português do Brasil. Depois, classifique o assunto em UMA destas " +
        "categorias exatas (sem acento, sem espaço): Rede, Impressora, AcessoMfa, Hardware, Software, Outros. " +
        "Responda SOMENTE em JSON, sem markdown, no formato exato: " +
        "{\"resposta\": \"texto da resposta\", \"categoria\": \"uma das categorias acima\"}";

    private readonly HttpClient _httpClient;
    private readonly GroqOptions _options;

    public GroqAIProvider(HttpClient httpClient, IOptions<GroqOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<(string resposta, CategoriaAtendimento categoria)> ResponderAsync(string pergunta)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey) || _options.ApiKey.Contains("SUA_CHAVE"))
            throw new InvalidOperationException(
                "Chave da Groq não configurada. Defina a variável de ambiente Groq__ApiKey antes de rodar.");

        var requestBody = new
        {
            model = _options.Model,
            messages = new object[]
            {
                new { role = "system", content = SystemPrompt },
                new { role = "user", content = pergunta }
            },
            response_format = new { type = "json_object" }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, Endpoint)
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);

        var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Erro ao chamar a API da Groq ({(int)response.StatusCode}): {responseBody}");

        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "{}";

        using var parsed = JsonDocument.Parse(text);
        var resposta = parsed.RootElement.TryGetProperty("resposta", out var respostaEl)
            ? respostaEl.GetString() ?? string.Empty
            : string.Empty;

        var categoriaTexto = parsed.RootElement.TryGetProperty("categoria", out var categoriaEl)
            ? categoriaEl.GetString() ?? string.Empty
            : string.Empty;

        var categoria = Enum.TryParse<CategoriaAtendimento>(categoriaTexto, ignoreCase: true, out var parsedCategoria)
            ? parsedCategoria
            : CategoriaAtendimento.Outros;

        return (resposta, categoria);
    }
}
