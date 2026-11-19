namespace Clinic.Domain.Constants;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string SuperAdmin = "SuperAdmin";
}

public static class LeadConversionTypes
{
    public const string WhatsAppClick = "WhatsAppClick";
    public const string PhoneClick = "PhoneClick";
}

public static class MongoCollectionNames
{
    public const string Categories = "categories";
    public const string Treatments = "treatments";
    public const string BlogPosts = "blog_posts";
    public const string SiteSettings = "site_settings";
    public const string Leads = "leads";
    public const string AdminUsers = "admin_users";
    public const string RefreshTokens = "refresh_tokens";
}

public static class RateLimitPolicies
{
    public const string AuthLogin = "auth-login";
    public const string AuthRefresh = "auth-refresh";
    public const string LeadsTrack = "leads-track";
}

public static class AuthConstants
{
    public const string RefreshTokenCookieName = "refresh_token";
    public const string RefreshTokenCookiePath = "/api/auth";
}
