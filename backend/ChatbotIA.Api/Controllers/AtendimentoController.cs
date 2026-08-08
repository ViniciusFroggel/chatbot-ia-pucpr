using System.Security.Claims;
using ChatbotIA.Application.DTOs;
using ChatbotIA.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChatbotIA.Api.Controllers;

[ApiController]
[Route("api/atendimentos")]
[Authorize]
public class AtendimentoController : ControllerBase
{
    private readonly AtendimentoService _atendimentoService;

    public AtendimentoController(AtendimentoService atendimentoService)
    {
        _atendimentoService = atendimentoService;
    }

    // POST /api/atendimentos
    [HttpPost]
    public async Task<ActionResult<AtendimentoResponseDto>> Perguntar(PerguntaDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var userId = GetUserId();
        var result = await _atendimentoService.PerguntarAsync(userId, dto);

        return Ok(result);
    }

    // GET /api/atendimentos
    [HttpGet]
    public async Task<ActionResult<List<AtendimentoResponseDto>>> Listar()
    {
        var userId = GetUserId();
        var result = await _atendimentoService.ListarPorUsuarioAsync(userId);

        return Ok(result);
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
