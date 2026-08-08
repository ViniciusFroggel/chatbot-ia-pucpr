using System.ComponentModel.DataAnnotations;
using ChatbotIA.Domain.Enums;

namespace ChatbotIA.Application.DTOs;

public class PerguntaDto
{
    [Required(ErrorMessage = "A pergunta é obrigatória.")]
    public string Pergunta { get; set; } = string.Empty;
}

public class AtendimentoResponseDto
{
    public int Id { get; set; }
    public string Pergunta { get; set; } = string.Empty;
    public string Resposta { get; set; } = string.Empty;
    public CategoriaAtendimento Categoria { get; set; }
    public DateTime CriadoEm { get; set; }
}
