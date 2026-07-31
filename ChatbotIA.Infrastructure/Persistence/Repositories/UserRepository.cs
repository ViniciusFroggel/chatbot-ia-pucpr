using ChatbotIA.Application.Interfaces;
using ChatbotIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChatbotIA.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<User?> GetByEmailAsync(string email) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public Task<bool> EmailExistsAsync(string email) =>
        _db.Users.AnyAsync(u => u.Email == email);

    public async Task AddAsync(User user) =>
        await _db.Users.AddAsync(user);

    public Task SaveChangesAsync() =>
        _db.SaveChangesAsync();
}
