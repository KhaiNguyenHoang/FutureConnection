using FutureConnection.Infrastructure;
using FutureConnection.Core;
using FutureConnection.Core.DTOs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCore();

var app = builder.Build();

app.MapGet("/", static () => "Hello World!");

app.Run();
