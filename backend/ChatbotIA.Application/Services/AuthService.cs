using ChatbotIA.Application.DTOs;
using ChatbotIA.Application.Interfaces;
using ChatbotIA.Domain.Entities;

namespace ChatbotIA.Application.Services;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResult> RegisterAsync(RegisterDto dto)
    {
        if (await _userRepository.EmailExistsAsync(dto.Email))
            return AuthResult.Fail("Já existe um usuário cadastrado com esse e-mail.");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password)
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return AuthResult.Ok(BuildResponse(user));
    }

    public async Task<AuthResult> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user is null || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
            return AuthResult.Fail("E-mail ou senha inválidos.");

        return AuthResult.Ok(BuildResponse(user));
    }

    private AuthResponseDto BuildResponse(User user)
    {
        var (token, expiresAt) = _tokenService.GenerateToken(user);
        return new AuthResponseDto
        {
            Token = token,
            Name = user.Name,
            Email = user.Email,
            ExpiresAt = expiresAt
        };
    }
}
