using ChatbotIA.Domain.Entities;

namespace ChatbotIA.Application.Interfaces;

public interface IAtendimentoRepository
{
    Task AddAsync(Atendimento atendimento);
    Task SaveChangesAsync();
    Task<List<Atendimento>> GetByUserIdAsync(int userId);
}
