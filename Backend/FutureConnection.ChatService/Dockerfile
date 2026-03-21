FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FutureConnection.ChatService/FutureConnection.ChatService.csproj", "FutureConnection.ChatService/"]
COPY ["FutureConnection.Core/FutureConnection.Core.csproj", "FutureConnection.Core/"]
COPY ["FutureConnection.Infrastructure/FutureConnection.Infrastructure.csproj", "FutureConnection.Infrastructure/"]
RUN dotnet restore "FutureConnection.ChatService/FutureConnection.ChatService.csproj"
COPY . .
WORKDIR "/src/FutureConnection.ChatService"
RUN dotnet build "FutureConnection.ChatService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FutureConnection.ChatService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FutureConnection.ChatService.dll"]
