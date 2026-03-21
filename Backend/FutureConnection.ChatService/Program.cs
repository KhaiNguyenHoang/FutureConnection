using FutureConnection.Infrastructure;
using FutureConnection.Infrastructure.Logging;
using FutureConnection.Infrastructure.Middleware;
using Serilog;
using FutureConnection.Core;
using FutureConnection.ChatService;
using FutureConnection.ChatService.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Host.ConfigureFutureConnectionLogging();

builder.Services.AddControllers().AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCore();
builder.Services.AddChatServices();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseSerilogRequestLogging();
app.UseCorrelationId();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");
app.MapHealthChecks("/healthz");
app.Run();
