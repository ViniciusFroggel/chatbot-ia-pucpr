namespace ChatbotIA.Application.DTOs;

public class AuthResult
{
    public bool Success { get; private set; }
    public string? Error { get; private set; }
    public AuthResponseDto? Data { get; private set; }

    public static AuthResult Ok(AuthResponseDto data) => new() { Success = true, Data = data };
    public static AuthResult Fail(string error) => new() { Success = false, Error = error };
}
