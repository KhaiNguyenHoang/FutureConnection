using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Infrastructure.Data;
using FutureConnection.Infrastructure.Repositories;
using FutureConnection.Infrastructure.Services;
using FutureConnection.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using System.Reflection;

namespace FutureConnection.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<FutureConnectionDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Register FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", builder =>
            {
                builder.WithOrigins("http://localhost:3000", "http://0.0.0.0:3000", "http://127.0.0.1:3000")
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials();
            });
        });

        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));

        // Register all specific repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAgencyRepository, AgencyRepository>();
        services.AddScoped<IAgencyMemberRepository, AgencyMemberRepository>();
        services.AddScoped<IAnswerRepository, AnswerRepository>();
        services.AddScoped<IApplicationRepository, ApplicationRepository>();
        services.AddScoped<IBadgeRepository, BadgeRepository>();
        services.AddScoped<IBlacklistedTokenRepository, BlacklistedTokenRepository>();
        services.AddScoped<IBountyRepository, BountyRepository>();
        services.AddScoped<ICVRepository, CVRepository>();
        services.AddScoped<ICertificateRepository, CertificateRepository>();
        services.AddScoped<IChannelRepository, ChannelRepository>();
        services.AddScoped<ICodeLanguageRepository, CodeLanguageRepository>();
        services.AddScoped<ICommentRepository, CommentRepository>();
        services.AddScoped<ICommentMediaRepository, CommentMediaRepository>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<ICompanyFollowerRepository, CompanyFollowerRepository>();
        services.AddScoped<IConnectionRepository, ConnectionRepository>();
        services.AddScoped<IContractRepository, ContractRepository>();
        services.AddScoped<IContractMilestoneRepository, ContractMilestoneRepository>();
        services.AddScoped<IDisputeRepository, DisputeRepository>();
        services.AddScoped<IEndorsementRepository, EndorsementRepository>();
        services.AddScoped<IFrameworkRepository, FrameworkRepository>();
        services.AddScoped<IFrameworkTypeRepository, FrameworkTypeRepository>();
        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<IGroupMemberRepository, GroupMemberRepository>();
        services.AddScoped<IJobRepository, JobRepository>();
        services.AddScoped<IJobTagRepository, JobTagRepository>();
        services.AddScoped<IJobTypeRepository, JobTypeRepository>();
        services.AddScoped<IMajorRepository, MajorRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IOpenSourceContributionRepository, OpenSourceContributionRepository>();
        services.AddScoped<IPersonalProjectRepository, PersonalProjectRepository>();
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddScoped<IPostMediaRepository, PostMediaRepository>();
        services.AddScoped<IPostTagRepository, PostTagRepository>();
        services.AddScoped<IProjectRoleRepository, ProjectRoleRepository>();
        services.AddScoped<IQuestionRepository, QuestionRepository>();
        services.AddScoped<IQuestionTagRepository, QuestionTagRepository>();
        services.AddScoped<IReactionRepository, ReactionRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IReputationRepository, ReputationRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<ISocialMediaRepository, SocialMediaRepository>();
        services.AddScoped<ITagRepository, TagRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IUserBadgeRepository, UserBadgeRepository>();
        services.AddScoped<IVoteRepository, VoteRepository>();

        // Register Infrastructure Services (with resilient connection strings)
        services.AddSingleton<ICacheService, RedisCacheService>();
        services.AddSingleton<IEventPublisher, KafkaEventPublisher>();
        services.AddScoped<IMediaService, CloudinaryService>();
        services.AddScoped<IEmailService, EmailService>();

        // Register JWT Bearer Authentication (centralized for all services)
        var jwtKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured. Set it via the Jwt__Key environment variable.");
        var jwtIssuer = configuration["Jwt:Issuer"] ?? "FutureConnection.IdentityService";
        var jwtAudience = configuration["Jwt:Audience"] ?? "FutureConnection.Clients";
        var key = Encoding.ASCII.GetBytes(jwtKey);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization();

        return services;
    }
}
