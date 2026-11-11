using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Features.Auth;

public record AdminAuthResponse(
    string Token,
    string Email,
    string FullName,
    string Role
);

public record LoginAdminCommand(string Email, string Password) : IRequest<Result<AdminAuthResponse>>;

public class LoginAdminCommandValidator : AbstractValidator<LoginAdminCommand>
{
    public LoginAdminCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Şifre alanı zorunludur.");
    }
}

public class LoginAdminCommandHandler : IRequestHandler<LoginAdminCommand, Result<AdminAuthResponse>>
{
    private readonly IAdminUserRepository _adminUserRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginAdminCommandHandler(
        IAdminUserRepository adminUserRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _adminUserRepository = adminUserRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<Result<AdminAuthResponse>> Handle(LoginAdminCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var adminUser = await _adminUserRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (adminUser is null || !_passwordHasher.VerifyPassword(request.Password, adminUser.PasswordHash))
        {
            return Result<AdminAuthResponse>.Failure("E-posta adresi veya şifre hatalı.");
        }

        var token = _jwtTokenGenerator.GenerateToken(
            adminUser.Id,
            adminUser.Email,
            adminUser.FullName,
            adminUser.Role);

        var response = new AdminAuthResponse(token, adminUser.Email, adminUser.FullName, adminUser.Role);
        return Result<AdminAuthResponse>.Success(response, "Giriş başarılı.");
    }
}

