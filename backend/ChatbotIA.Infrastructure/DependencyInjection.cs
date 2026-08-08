using ChatbotIA.Application.Interfaces;
using ChatbotIA.Infrastructure.AI;
using ChatbotIA.Infrastructure.Auth;
using ChatbotIA.Infrastructure.Persistence;
using ChatbotIA.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChatbotIA.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("Default")));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();

        services.AddScoped<IAtendimentoRepository, AtendimentoRepository>();
        services.Configure<GroqOptions>(configuration.GetSection("Groq"));
        services.AddHttpClient<IAIProvider, GroqAIProvider>();

        return services;
    }
}
