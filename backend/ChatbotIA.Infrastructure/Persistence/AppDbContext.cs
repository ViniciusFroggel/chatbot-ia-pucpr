using ChatbotIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChatbotIA.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Atendimento> Atendimentos => Set<Atendimento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Atendimento>()
            .HasOne(a => a.User)
            .WithMany(u => u.Atendimentos)
            .HasForeignKey(a => a.UserId);
    }
}
