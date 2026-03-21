FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FutureConnection.Gateway/FutureConnection.Gateway.csproj", "FutureConnection.Gateway/"]
RUN dotnet restore "FutureConnection.Gateway/FutureConnection.Gateway.csproj"
COPY . .
WORKDIR "/src/FutureConnection.Gateway"
RUN dotnet build "FutureConnection.Gateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FutureConnection.Gateway.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FutureConnection.Gateway.dll"]
