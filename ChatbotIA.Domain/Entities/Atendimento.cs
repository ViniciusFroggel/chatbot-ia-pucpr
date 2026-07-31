using ChatbotIA.Domain.Enums;

namespace ChatbotIA.Domain.Entities;

// Reservado para a Sprint 2: histórico de perguntas feitas ao chatbot,
// já modelado agora para a estrutura nascer certa desde o Encontro 1.
public class Atendimento
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Pergunta { get; set; } = string.Empty;
    public string Resposta { get; set; } = string.Empty;
    public CategoriaAtendimento Categoria { get; set; } = CategoriaAtendimento.Outros;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
