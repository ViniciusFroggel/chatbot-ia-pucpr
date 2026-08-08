using ChatbotIA.Application.Interfaces;
using ChatbotIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChatbotIA.Infrastructure.Persistence.Repositories;

public class AtendimentoRepository : IAtendimentoRepository
{
    private readonly AppDbContext _db;

    public AtendimentoRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Atendimento atendimento) =>
        await _db.Atendimentos.AddAsync(atendimento);

    public Task SaveChangesAsync() => _db.SaveChangesAsync();

    public Task<List<Atendimento>> GetByUserIdAsync(int userId) =>
        _db.Atendimentos
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CriadoEm)
            .ToListAsync();
}
