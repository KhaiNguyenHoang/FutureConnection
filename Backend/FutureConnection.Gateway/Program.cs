using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddOcelot(builder.Configuration);
builder.Services.AddHealthChecks();

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "FutureConnection.IdentityService";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "FutureConnection.Clients";
var key = System.Text.Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication()
    .AddJwtBearer("IdentityServiceKey", options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// FIX: Restrict CORS to known origins instead of AllowAll
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000", "http://0.0.0.0:3000", "http://127.0.0.1:3000", "http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseAuthentication();

// Must be before UseOcelot — Ocelot intercepts all requests and never reaches MapHealthChecks
app.UseWhen(ctx => ctx.Request.Path == "/healthz", health =>
{
    health.Run(async ctx =>
    {
        ctx.Response.StatusCode = 200;
        ctx.Response.ContentType = "text/plain";
        await ctx.Response.WriteAsync("Healthy");
    });
});

app.UseWebSockets();
await app.UseOcelot();

app.Run();
