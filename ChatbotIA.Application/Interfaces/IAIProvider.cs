using ChatbotIA.Domain.Enums;

namespace ChatbotIA.Application.Interfaces;

// Reservado para a Sprint 2. A implementação concreta (GeminiAIProvider)
// entra em ChatbotIA.Infrastructure/AI quando o módulo de atendimento for feito.
public interface IAIProvider
{
    Task<(string resposta, CategoriaAtendimento categoria)> ResponderAsync(string pergunta);
}
