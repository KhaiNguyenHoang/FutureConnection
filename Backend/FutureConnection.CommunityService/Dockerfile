FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FutureConnection.CommunityService/FutureConnection.CommunityService.csproj", "FutureConnection.CommunityService/"]
COPY ["FutureConnection.Core/FutureConnection.Core.csproj", "FutureConnection.Core/"]
COPY ["FutureConnection.Infrastructure/FutureConnection.Infrastructure.csproj", "FutureConnection.Infrastructure/"]
RUN dotnet restore "FutureConnection.CommunityService/FutureConnection.CommunityService.csproj"
COPY . .
WORKDIR "/src/FutureConnection.CommunityService"
RUN dotnet build "FutureConnection.CommunityService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FutureConnection.CommunityService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FutureConnection.CommunityService.dll"]
