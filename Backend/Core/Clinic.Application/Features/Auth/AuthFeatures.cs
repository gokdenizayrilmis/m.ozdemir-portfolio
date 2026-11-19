using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Features.Auth;

public record AdminAuthResponse(
    string Token,
    string AccessToken,
    string Email,
    string FullName,
    string Role
);

public record AuthSessionResult(
    AdminAuthResponse Response,
    string RawRefreshToken,
    DateTime RefreshTokenExpiresAt
);

// 1. LoginAdminCommand
public record LoginAdminCommand(string Email, string Password) : IRequest<Result<AuthSessionResult>>;

public class LoginAdminCommandValidator : AbstractValidator<LoginAdminCommand>
{
    public LoginAdminCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Şifre alanı zorunludur.");
    }
}

public class LoginAdminCommandHandler : IRequestHandler<LoginAdminCommand, Result<AuthSessionResult>>
{
    private readonly IAdminUserRepository _adminUserRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginAdminCommandHandler(
        IAdminUserRepository adminUserRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _adminUserRepository = adminUserRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<Result<AuthSessionResult>> Handle(LoginAdminCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var adminUser = await _adminUserRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (adminUser is null || !_passwordHasher.VerifyPassword(request.Password, adminUser.PasswordHash))
        {
            return Result<AuthSessionResult>.Failure("E-posta adresi veya şifre hatalı.");
        }

        var accessToken = _jwtTokenGenerator.GenerateToken(
            adminUser.Id,
            adminUser.Email,
            adminUser.FullName,
            adminUser.Role);

        var rawRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenHash = _jwtTokenGenerator.HashToken(rawRefreshToken);
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);

        var refreshTokenEntity = new RefreshToken
        {
            AdminUserId = adminUser.Id,
            TokenHash = refreshTokenHash,
            ExpiresAt = refreshTokenExpiresAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _refreshTokenRepository.CreateAsync(refreshTokenEntity, cancellationToken);

        var authResponse = new AdminAuthResponse(
            accessToken,
            accessToken,
            adminUser.Email,
            adminUser.FullName,
            adminUser.Role);

        return Result<AuthSessionResult>.Success(
            new AuthSessionResult(authResponse, rawRefreshToken, refreshTokenExpiresAt),
            "Giriş başarılı.");
    }
}

// 2. RefreshTokenCommand (with Token Rotation & Reuse Detection)
public record RefreshTokenCommand(string? RawRefreshToken) : IRequest<Result<AuthSessionResult>>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthSessionResult>>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IAdminUserRepository _adminUserRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RefreshTokenCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IAdminUserRepository adminUserRepository,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _adminUserRepository = adminUserRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<Result<AuthSessionResult>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RawRefreshToken))
        {
            return Result<AuthSessionResult>.Failure("Oturum yenileme anahtarı bulunamadı.");
        }

        var incomingHash = _jwtTokenGenerator.HashToken(request.RawRefreshToken);
        var existingToken = await _refreshTokenRepository.GetByTokenHashAsync(incomingHash, cancellationToken);

        if (existingToken is null)
        {
            return Result<AuthSessionResult>.Failure("Geçersiz oturum yenileme anahtarı.");
        }

        // Reuse Detection: If a previously revoked token is presented again, revoke all active tokens for this user
        if (existingToken.IsRevoked)
        {
            await _refreshTokenRepository.RevokeAllActiveByUserIdAsync(existingToken.AdminUserId, cancellationToken);
            return Result<AuthSessionResult>.Failure("Güvenlik ihlali tespit edildi: İptal edilmiş oturum anahtarı tekrar kullanıldı. Tüm oturumlar sonlandırıldı.");
        }

        if (existingToken.IsExpired)
        {
            return Result<AuthSessionResult>.Failure("Oturum süresi doldu. Lütfen tekrar giriş yapınız.");
        }

        var adminUser = await _adminUserRepository.GetByIdAsync(existingToken.AdminUserId, cancellationToken);
        if (adminUser is null)
        {
            return Result<AuthSessionResult>.Failure("Kullanıcı hesabı bulunamadı.");
        }

        // Rotate refresh token
        var newRawRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var newTokenHash = _jwtTokenGenerator.HashToken(newRawRefreshToken);
        var newExpiresAt = DateTime.UtcNow.AddDays(7);

        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.ReplacedByTokenHash = newTokenHash;
        existingToken.UpdatedAt = DateTime.UtcNow;
        await _refreshTokenRepository.UpdateAsync(existingToken, cancellationToken);

        var rotatedToken = new RefreshToken
        {
            AdminUserId = adminUser.Id,
            TokenHash = newTokenHash,
            ExpiresAt = newExpiresAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _refreshTokenRepository.CreateAsync(rotatedToken, cancellationToken);

        var newAccessToken = _jwtTokenGenerator.GenerateToken(
            adminUser.Id,
            adminUser.Email,
            adminUser.FullName,
            adminUser.Role);

        var authResponse = new AdminAuthResponse(
            newAccessToken,
            newAccessToken,
            adminUser.Email,
            adminUser.FullName,
            adminUser.Role);

        return Result<AuthSessionResult>.Success(
            new AuthSessionResult(authResponse, newRawRefreshToken, newExpiresAt),
            "Oturum başarıyla yenilendi.");
    }
}

// 3. LogoutAdminCommand
public record LogoutAdminCommand(string? RawRefreshToken) : IRequest<Result>;

public class LogoutAdminCommandHandler : IRequestHandler<LogoutAdminCommand, Result>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LogoutAdminCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<Result> Handle(LogoutAdminCommand request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.RawRefreshToken))
        {
            var tokenHash = _jwtTokenGenerator.HashToken(request.RawRefreshToken);
            var existingToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

            if (existingToken is not null && !existingToken.IsRevoked)
            {
                existingToken.RevokedAt = DateTime.UtcNow;
                existingToken.UpdatedAt = DateTime.UtcNow;
                await _refreshTokenRepository.UpdateAsync(existingToken, cancellationToken);
            }
        }

        return Result.Success("Oturum başarıyla sonlandırıldı.");
    }
}

// 4. ChangeAdminPasswordCommand
public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword);

public record ChangeAdminPasswordCommand(
    string AdminUserId,
    string CurrentPassword,
    string NewPassword
) : IRequest<Result>;

public class ChangeAdminPasswordCommandValidator : AbstractValidator<ChangeAdminPasswordCommand>
{
    public ChangeAdminPasswordCommandValidator()
    {
        RuleFor(x => x.AdminUserId).NotEmpty().WithMessage("Kullanıcı kimliği doğrulanamadı.");
        RuleFor(x => x.CurrentPassword).NotEmpty().WithMessage("Mevcut şifre zorunludur.");
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Yeni şifre zorunludur.")
            .MinimumLength(6).WithMessage("Yeni şifre en az 6 karakter olmalıdır.");
    }
}

public class ChangeAdminPasswordCommandHandler : IRequestHandler<ChangeAdminPasswordCommand, Result>
{
    private readonly IAdminUserRepository _adminUserRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordHasher _passwordHasher;

    public ChangeAdminPasswordCommandHandler(
        IAdminUserRepository adminUserRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordHasher passwordHasher)
    {
        _adminUserRepository = adminUserRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result> Handle(ChangeAdminPasswordCommand request, CancellationToken cancellationToken)
    {
        var adminUser = await _adminUserRepository.GetByIdAsync(request.AdminUserId, cancellationToken);
        if (adminUser is null)
        {
            return Result.Failure("Yönetici hesabı bulunamadı.");
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, adminUser.PasswordHash))
        {
            return Result.Failure("Mevcut şifreniz hatalı.");
        }

        adminUser.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        adminUser.UpdatedAt = DateTime.UtcNow;
        await _adminUserRepository.UpdateAsync(adminUser, cancellationToken);

        // Revoke all active refresh tokens for security after password change
        await _refreshTokenRepository.RevokeAllActiveByUserIdAsync(adminUser.Id, cancellationToken);

        return Result.Success("Şifreniz başarıyla güncellendi ve tüm aktif oturumlarınız güvenlik amacıyla yenilendi.");
    }
}
