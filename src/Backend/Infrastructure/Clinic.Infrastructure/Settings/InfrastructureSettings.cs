namespace Clinic.Infrastructure.Settings;

public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = "ClinicMustafaOzdemir_SuperSecretKey_2026_AtLeast32BytesLong!";
    public string Issuer { get; set; } = "Clinic.WebAPI";
    public string Audience { get; set; } = "Clinic.NextJsClient";
    public int ExpiryMinutes { get; set; } = 720;
}

public class NextJsSettings
{
    public const string SectionName = "NextJsSettings";

    public string BaseUrl { get; set; } = "http://localhost:3000";
    public string RevalidationSecret { get; set; } = "ClinicRevalidationSecret2026";
}

