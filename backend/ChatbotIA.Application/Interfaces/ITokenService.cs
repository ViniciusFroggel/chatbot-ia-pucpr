using ChatbotIA.Domain.Entities;

namespace ChatbotIA.Application.Interfaces;

public interface ITokenService
{
    (string token, DateTime expiresAt) GenerateToken(User user);
}
