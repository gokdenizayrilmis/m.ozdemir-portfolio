# Stage 1: Build & Publish (.NET 10 SDK)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files first for optimal Docker layer caching
COPY Clinic-MustafaOzdemir.slnx ./
COPY Core/Clinic.Domain/Clinic.Domain.csproj Core/Clinic.Domain/
COPY Core/Clinic.Application/Clinic.Application.csproj Core/Clinic.Application/
COPY Infrastructure/Clinic.Infrastructure/Clinic.Infrastructure.csproj Infrastructure/Clinic.Infrastructure/
COPY Infrastructure/Clinic.Persistence/Clinic.Persistence.csproj Infrastructure/Clinic.Persistence/
COPY Presentation/Clinic.WebAPI/Clinic.WebAPI.csproj Presentation/Clinic.WebAPI/

RUN dotnet restore Presentation/Clinic.WebAPI/Clinic.WebAPI.csproj

# Copy the rest of the backend source code
COPY . .

# Publish Release build
RUN dotnet publish Presentation/Clinic.WebAPI/Clinic.WebAPI.csproj -c Release -o /app/publish --no-restore

# Stage 2: Runtime (.NET 10 ASP.NET Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Ensure uploads directory exists at runtime
RUN mkdir -p /app/wwwroot/uploads

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Bind dynamically to Render's $PORT environment variable (defaults to 8080)
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet Clinic.WebAPI.dll"]
