using System.Text;
using System.Text.Json;
using ChatbotIA.Application.Interfaces;
using ChatbotIA.Domain.Enums;
using Microsoft.Extensions.Options;

namespace ChatbotIA.Infrastructure.AI;

public class GeminiAIProvider : IAIProvider
{
    private readonly HttpClient _httpClient;
    private readonly GeminiOptions _options;

    private const string SystemPrompt =
        "Você é um assistente de suporte de TI de uma empresa. Responda a pergunta do usuário de forma " +
        "clara, curta e objetiva, em português do Brasil. Depois, classifique o assunto em UMA destas " +
        "categorias exatas (sem acento, sem espaço): Rede, Impressora, AcessoMfa, Hardware, Software, Outros. " +
        "Responda SOMENTE em JSON, sem markdown, no formato exato: " +
        "{\"resposta\": \"texto da resposta\", \"categoria\": \"uma das categorias acima\"}";

    public GeminiAIProvider(HttpClient httpClient, IOptions<GeminiOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<(string resposta, CategoriaAtendimento categoria)> ResponderAsync(string pergunta)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey) || _options.ApiKey.Contains("SUA_CHAVE"))
            throw new InvalidOperationException(
                "Chave do Gemini não configurada. Preencha Gemini:ApiKey em appsettings.json (ou appsettings.Development.json).");

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent?key={_options.ApiKey}";

        var requestBody = new
        {
            system_instruction = new { parts = new[] { new { text = SystemPrompt } } },
            contents = new[]
            {
                new { role = "user", parts = new[] { new { text = pergunta } } }
            },
            generationConfig = new { response_mime_type = "application/json" }
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Erro ao chamar a API do Gemini ({(int)response.StatusCode}): {responseBody}");

        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
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
