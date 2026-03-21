FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FutureConnection.JobService/FutureConnection.JobService.csproj", "FutureConnection.JobService/"]
COPY ["FutureConnection.Core/FutureConnection.Core.csproj", "FutureConnection.Core/"]
COPY ["FutureConnection.Infrastructure/FutureConnection.Infrastructure.csproj", "FutureConnection.Infrastructure/"]
RUN dotnet restore "FutureConnection.JobService/FutureConnection.JobService.csproj"
COPY . .
WORKDIR "/src/FutureConnection.JobService"
RUN dotnet build "FutureConnection.JobService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FutureConnection.JobService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FutureConnection.JobService.dll"]
