FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FutureConnection.API/FutureConnection.API.csproj", "FutureConnection.API/"]
COPY ["FutureConnection.Infrastructure/FutureConnection.Infrastructure.csproj", "FutureConnection.Infrastructure/"]
COPY ["FutureConnection.Core/FutureConnection.Core.csproj", "FutureConnection.Core/"]
RUN dotnet restore "FutureConnection.API/FutureConnection.API.csproj"
COPY . .
WORKDIR "/src/FutureConnection.API"
RUN dotnet build "FutureConnection.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FutureConnection.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FutureConnection.API.dll"]
