using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Mappers
{
    public class AppProfile : Profile
    {
        public AppProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : null))
                .ReverseMap()
                .ForMember(dest => dest.Role, opt => opt.Ignore());  // Role is navigation property, not set from string
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));
            CreateMap<LoginUserDto, User>();

            CreateMap<UserLanguage, UserLanguageDto>()
                .ForMember(d => d.Name, o => o.MapFrom(s => s.CodeLanguage != null ? s.CodeLanguage.Name : string.Empty))
                .ForMember(d => d.DocumentationUrl, o => o.MapFrom(s => s.CodeLanguage != null ? s.CodeLanguage.DocumentationUrl : null));

            CreateMap<UserFramework, UserFrameworkDto>()
                .ForMember(d => d.Name, o => o.MapFrom(s => s.Framework != null ? s.Framework.Name : string.Empty));

            CreateMap<CV, CVDto>().ReverseMap();
            CreateMap<CreateCVDto, CV>();
            CreateMap<UpdateCVDto, CV>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<PersonalProject, PersonalProjectDto>().ReverseMap();
            CreateMap<CreatePersonalProjectDto, PersonalProject>();
            CreateMap<UpdatePersonalProjectDto, PersonalProject>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Connection, ConnectionDto>().ReverseMap();
            CreateMap<CreateConnectionDto, Connection>();
            CreateMap<UpdateConnectionDto, Connection>();

            CreateMap<Endorsement, EndorsementDto>().ReverseMap();
            CreateMap<CreateEndorsementDto, Endorsement>();

            CreateMap<Certificate, CertificateDto>().ReverseMap();
            CreateMap<CreateCertificateDto, Certificate>();
            CreateMap<UpdateCertificateDto, Certificate>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<SocialMedia, SocialMediaDto>().ReverseMap();
            CreateMap<CreateSocialMediaDto, SocialMedia>();
            CreateMap<UpdateSocialMediaDto, SocialMedia>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Job, JobDto>().ReverseMap();
            CreateMap<CreateJobDto, Job>();
            CreateMap<UpdateJobDto, Job>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<JobTag, JobTagDto>().ReverseMap();
            CreateMap<CreateJobTagDto, JobTag>();

            CreateMap<JobType, JobTypeDto>().ReverseMap();
            CreateMap<CreateJobTypeDto, JobType>();
            CreateMap<UpdateJobTypeDto, JobType>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Application, ApplicationDto>().ReverseMap();
            CreateMap<CreateApplicationDto, Application>();
            CreateMap<UpdateApplicationDto, Application>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Post, PostDto>()
                .ForMember(d => d.AuthorFirstName, o => o.MapFrom(s => s.User != null ? s.User.FirstName : null))
                .ForMember(d => d.AuthorLastName, o => o.MapFrom(s => s.User != null ? s.User.LastName : null))
                .ForMember(d => d.AuthorAvatarUrl, o => o.MapFrom(s => s.User != null ? s.User.AvatarUrl : null))
                .ForMember(d => d.ReactionCount, o => o.MapFrom(s => s.Reactions != null ? s.Reactions.Count : 0))
                .ForMember(d => d.CommentCount, o => o.MapFrom(s => s.Comments != null ? s.Comments.Count : 0))
                .ForMember(d => d.Tags, o => o.MapFrom(s => s.PostTags != null 
                    ? s.PostTags.Where(pt => pt.Tag != null).Select(pt => pt.Tag.Name).ToList() 
                    : new List<string>()))

                .ReverseMap();
            CreateMap<CreatePostDto, Post>();
            CreateMap<UpdatePostDto, Post>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));
            CreateMap<PostMedia, PostMediaDto>().ReverseMap();

            CreateMap<PostTag, PostTagDto>().ReverseMap();
            CreateMap<CreatePostTagDto, PostTag>();

            CreateMap<Comment, CommentDto>()
                .ForMember(d => d.AuthorFirstName, o => o.MapFrom(s => s.User != null ? s.User.FirstName : null))
                .ForMember(d => d.AuthorLastName, o => o.MapFrom(s => s.User != null ? s.User.LastName : null))
                .ForMember(d => d.AuthorAvatarUrl, o => o.MapFrom(s => s.User != null ? s.User.AvatarUrl : null))
                .ReverseMap();
            CreateMap<CreateCommentDto, Comment>();
            CreateMap<UpdateCommentDto, Comment>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Reaction, ReactionDto>().ReverseMap();
            CreateMap<CreateReactionDto, Reaction>();

            CreateMap<Message, MessageDto>()
                .ForMember(d => d.SenderFirstName, o => o.MapFrom(s => s.Sender != null ? s.Sender.FirstName : null))
                .ForMember(d => d.SenderLastName, o => o.MapFrom(s => s.Sender != null ? s.Sender.LastName : null))
                .ForMember(d => d.SenderAvatarUrl, o => o.MapFrom(s => s.Sender != null ? s.Sender.AvatarUrl : null))
                .ReverseMap();
            CreateMap<CreateMessageDto, Message>();
            CreateMap<UpdateMessageDto, Message>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Channel, ChannelDto>().ReverseMap();
            CreateMap<CreateChannelDto, Channel>();
            CreateMap<UpdateChannelDto, Channel>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Group, GroupDto>().ReverseMap();
            CreateMap<CreateGroupDto, Group>();
            CreateMap<UpdateGroupDto, Group>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<GroupMember, GroupMemberDto>()
                .ForMember(d => d.UserFirstName, o => o.MapFrom(s => s.User != null ? s.User.FirstName : null))
                .ForMember(d => d.UserLastName, o => o.MapFrom(s => s.User != null ? s.User.LastName : null))
                .ForMember(d => d.UserAvatarUrl, o => o.MapFrom(s => s.User != null ? s.User.AvatarUrl : null))
                .ReverseMap();
            CreateMap<CreateGroupMemberDto, GroupMember>();
            CreateMap<UpdateGroupMemberDto, GroupMember>();

            CreateMap<Question, QuestionDto>()
                .ForMember(d => d.AuthorFirstName, o => o.MapFrom(s => s.User != null ? s.User.FirstName : null))
                .ForMember(d => d.AuthorLastName, o => o.MapFrom(s => s.User != null ? s.User.LastName : null))
                .ForMember(d => d.AuthorAvatarUrl, o => o.MapFrom(s => s.User != null ? s.User.AvatarUrl : null))
                .ForMember(d => d.AnswerCount, o => o.MapFrom(s => s.Answers != null ? s.Answers.Count : 0))
                .ForMember(d => d.VoteCount, o => o.MapFrom(s => s.Votes != null ? s.Votes.Sum(v => (int)v.Type) : 0))
                .ForMember(d => d.Tags, o => o.MapFrom(s => s.QuestionTags != null 
                    ? s.QuestionTags.Where(qt => qt.Tag != null).Select(qt => qt.Tag.Name).ToList() 
                    : new List<string>()))
                .ReverseMap();
            CreateMap<CreateQuestionDto, Question>();
            CreateMap<UpdateQuestionDto, Question>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Answer, AnswerDto>()
                .ForMember(d => d.AuthorFirstName, o => o.MapFrom(s => s.User != null ? s.User.FirstName : null))
                .ForMember(d => d.AuthorLastName, o => o.MapFrom(s => s.User != null ? s.User.LastName : null))
                .ForMember(d => d.AuthorAvatarUrl, o => o.MapFrom(s => s.User != null ? s.User.AvatarUrl : null))
                .ForMember(d => d.AuthorReputation, o => o.MapFrom(s => s.User != null && s.User.Reputations != null ? s.User.Reputations.Sum(r => r.Points) : 0))
                .ForMember(d => d.VoteCount, o => o.MapFrom(s => s.Votes != null ? s.Votes.Sum(v => (int)v.Type) : 0))
                .ReverseMap();
            CreateMap<CreateAnswerDto, Answer>();
            CreateMap<UpdateAnswerDto, Answer>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<AnswerMedia, AnswerMediaDto>().ReverseMap();
            CreateMap<QuestionMedia, QuestionMediaDto>().ReverseMap();

            CreateMap<Vote, VoteDto>().ReverseMap();
            CreateMap<CreateVoteDto, Vote>();

            CreateMap<Reputation, ReputationDto>().ReverseMap();

            CreateMap<Badge, BadgeDto>().ReverseMap();
            CreateMap<CreateBadgeDto, Badge>();

            CreateMap<UserBadge, UserBadgeDto>().ReverseMap();

            CreateMap<Bounty, BountyDto>().ReverseMap();
            CreateMap<CreateBountyDto, Bounty>();

            CreateMap<QuestionTag, QuestionTagDto>().ReverseMap();

            CreateMap<Agency, AgencyDto>().ReverseMap();
            CreateMap<CreateAgencyDto, Agency>();
            CreateMap<UpdateAgencyDto, Agency>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<AgencyMember, AgencyMemberDto>().ReverseMap();
            CreateMap<CreateAgencyMemberDto, AgencyMember>();

            CreateMap<Contract, ContractDto>().ReverseMap();
            CreateMap<CreateContractDto, Contract>();
            CreateMap<UpdateContractDto, Contract>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<ContractMilestone, ContractMilestoneDto>().ReverseMap();
            CreateMap<CreateContractMilestoneDto, ContractMilestone>();
            CreateMap<UpdateContractMilestoneDto, ContractMilestone>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Transaction, TransactionDto>().ReverseMap();

            CreateMap<Dispute, DisputeDto>().ReverseMap();
            CreateMap<CreateDisputeDto, Dispute>();
            CreateMap<UpdateDisputeDto, Dispute>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Review, ReviewDto>().ReverseMap();
            CreateMap<CreateReviewDto, Review>();

            CreateMap<Company, CompanyDto>().ReverseMap();
            CreateMap<CreateCompanyDto, Company>();
            CreateMap<UpdateCompanyDto, Company>().ForAllMembers(static opts => opts.Condition(static (__, _, srcMember) => srcMember != null));

            CreateMap<CompanyFollower, CompanyFollowerDto>().ReverseMap();
            CreateMap<CreateCompanyFollowerDto, CompanyFollower>();

            CreateMap<Tag, TagDto>().ReverseMap();
            CreateMap<CreateTagDto, Tag>();

            CreateMap<CodeLanguage, CodeLanguageDto>().ReverseMap();
            CreateMap<CreateCodeLanguageDto, CodeLanguage>();

            CreateMap<Framework, FrameworkDto>().ReverseMap();
            CreateMap<CreateFrameworkDto, Framework>();

            CreateMap<FrameworkType, FrameworkTypeDto>().ReverseMap();
            CreateMap<CreateFrameworkTypeDto, FrameworkType>();

            CreateMap<Major, MajorDto>().ReverseMap();
            CreateMap<CreateMajorDto, Major>();

            CreateMap<Role, RoleDto>().ReverseMap();
            CreateMap<CreateRoleDto, Role>();

            CreateMap<ProjectRole, ProjectRoleDto>().ReverseMap();
            CreateMap<CreateProjectRoleDto, ProjectRole>();

            CreateMap<OpenSourceContribution, OpenSourceContributionDto>().ReverseMap();
            CreateMap<CreateOpenSourceContributionDto, OpenSourceContribution>();

            CreateMap<RefreshToken, RefreshTokenDto>().ReverseMap();

            CreateMap<BlacklistedToken, BlacklistedTokenDto>().ReverseMap();

            CreateMap<SupportTicket, TicketResponseDto>().ReverseMap();
            CreateMap<CreateTicketDto, SupportTicket>();
            CreateMap<Policy, PolicyResponseDto>().ReverseMap();
            CreateMap<FAQ, FAQResponseDto>().ReverseMap();
        }
    }
}
