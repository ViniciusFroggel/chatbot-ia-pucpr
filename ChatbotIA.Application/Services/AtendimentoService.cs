using ChatbotIA.Application.DTOs;
using ChatbotIA.Application.Interfaces;
using ChatbotIA.Domain.Entities;

namespace ChatbotIA.Application.Services;

public class AtendimentoService
{
    private readonly IAtendimentoRepository _atendimentoRepository;
    private readonly IAIProvider _aiProvider;

    public AtendimentoService(IAtendimentoRepository atendimentoRepository, IAIProvider aiProvider)
    {
        _atendimentoRepository = atendimentoRepository;
        _aiProvider = aiProvider;
    }

    public async Task<AtendimentoResponseDto> PerguntarAsync(int userId, PerguntaDto dto)
    {
        var (resposta, categoria) = await _aiProvider.ResponderAsync(dto.Pergunta);

        var atendimento = new Atendimento
        {
            UserId = userId,
            Pergunta = dto.Pergunta,
            Resposta = resposta,
            Categoria = categoria
        };

        await _atendimentoRepository.AddAsync(atendimento);
        await _atendimentoRepository.SaveChangesAsync();

        return ToDto(atendimento);
    }

    public async Task<List<AtendimentoResponseDto>> ListarPorUsuarioAsync(int userId)
    {
        var atendimentos = await _atendimentoRepository.GetByUserIdAsync(userId);
        return atendimentos.Select(ToDto).ToList();
    }

    private static AtendimentoResponseDto ToDto(Atendimento a) => new()
    {
        Id = a.Id,
        Pergunta = a.Pergunta,
        Resposta = a.Resposta,
        Categoria = a.Categoria,
        CriadoEm = a.CriadoEm
    };
}
