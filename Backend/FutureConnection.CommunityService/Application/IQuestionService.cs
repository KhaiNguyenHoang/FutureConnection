using FutureConnection.Core.DTOs;

namespace FutureConnection.CommunityService.Application
{
    public interface IQuestionService
    {
        Task<PagedResponse<QuestionDto>> GetQuestionsAsync(PagedRequest request);
        Task<Response<QuestionDto>> GetByIdAsync(Guid id);
        Task<Response<QuestionDto>> CreateAsync(CreateQuestionDto dto);
        Task<Response<QuestionDto>> UpdateAsync(Guid id, Guid requesterId, UpdateQuestionDto dto);
        Task<Response<string>> DeleteAsync(Guid id);

        Task<Response<IEnumerable<AnswerDto>>> GetAnswersAsync(Guid questionId);
        Task<Response<AnswerDto>> PostAnswerAsync(Guid questionId, CreateAnswerDto dto);
        Task<Response<AnswerDto>> AcceptAnswerAsync(Guid answerId, Guid questionOwnerId);

        Task<Response<string>> VoteQuestionAsync(Guid questionId, CreateVoteDto dto);
        Task<Response<string>> VoteAnswerAsync(Guid answerId, CreateVoteDto dto);

        Task<Response<BountyDto>> AddBountyAsync(Guid questionId, CreateBountyDto dto);
    Task<Response<BountyDto>> AwardBountyAsync(Guid bountyId, Guid requesterId, Guid winnerId);

        Task<Response<object>> GetReputationAsync(Guid userId);

        Task<Response<IEnumerable<TagDto>>> GetTagsAsync();
        Task<Response<TagDto>> CreateTagAsync(CreateTagDto dto);

        Task<Response<QuestionTagDto>> AddQuestionTagAsync(Guid questionId, Guid tagId);
        Task<Response<string>> RemoveQuestionTagAsync(Guid questionId, Guid tagId);

        Task<Response<IEnumerable<BadgeDto>>> GetBadgesAsync();
        Task<Response<BadgeDto>> CreateBadgeAsync(CreateBadgeDto dto);

        Task<Response<AnswerDto>> UpdateAnswerAsync(Guid answerId, Guid requesterId, UpdateAnswerDto dto);
    }
}
