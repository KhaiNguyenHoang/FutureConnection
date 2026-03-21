using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Repositories;

namespace FutureConnection.CommunityService.Application
{
    public class QuestionService(IUnitOfWork uow, IMapper mapper) : IQuestionService
    {
        public async Task<PagedResponse<QuestionDto>> GetQuestionsAsync(PagedRequest request)
        {
            var questions = await uow.Questions.GetAllAsync();
            if (!string.IsNullOrEmpty(request.Keyword))
                questions = questions.Where(q => q.Title.Contains(request.Keyword, StringComparison.OrdinalIgnoreCase)).ToList();
            return PagedResponse<QuestionDto>.Create(mapper.Map<IEnumerable<QuestionDto>>(questions), request.Page, request.PageSize);
        }

        public async Task<Response<QuestionDto>> GetByIdAsync(Guid id)
        {
            var q = await uow.Questions.GetByIdAsync(id);
            return q == null
                ? new Response<QuestionDto> { Success = false, Message = "Question not found." }
                : new Response<QuestionDto> { Success = true, Data = mapper.Map<QuestionDto>(q) };
        }

        public async Task<Response<QuestionDto>> CreateAsync(CreateQuestionDto dto)
        {
            var question = mapper.Map<Question>(dto);
            question.ViewCount = 0;
            await uow.Questions.CreateAsync(question);
            await uow.CompleteAsync();
            return new Response<QuestionDto> { Success = true, Data = mapper.Map<QuestionDto>(question), Message = "Question posted." };
        }

        public async Task<Response<QuestionDto>> UpdateAsync(Guid id, Guid requesterId, UpdateQuestionDto dto)
        {
            var question = await uow.Questions.GetByIdAsync(id);
            if (question == null) return new Response<QuestionDto> { Success = false, Message = "Question not found." };
            if (question.UserId != requesterId) return new Response<QuestionDto> { Success = false, Message = "Only the question owner can edit it." };

            if (!string.IsNullOrEmpty(dto.Title)) question.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Content)) question.Content = dto.Content;
            uow.Questions.Update(question);
            await uow.CompleteAsync();
            return new Response<QuestionDto> { Success = true, Data = mapper.Map<QuestionDto>(question), Message = "Question updated." };
        }

        public async Task<Response<string>> DeleteAsync(Guid id)
        {
            await uow.Questions.SoftDeleteAsync(id);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Question deleted." };
        }

        public async Task<Response<IEnumerable<AnswerDto>>> GetAnswersAsync(Guid questionId)
        {
            var answers = await uow.Answers.GetAllAsync();
            return new Response<IEnumerable<AnswerDto>> { Success = true, Data = mapper.Map<IEnumerable<AnswerDto>>(answers.Where(a => a.QuestionId == questionId)) };
        }

        public async Task<Response<AnswerDto>> PostAnswerAsync(Guid questionId, CreateAnswerDto dto)
        {
            if (await uow.Questions.GetByIdAsync(questionId) == null)
                return new Response<AnswerDto> { Success = false, Message = "Question not found." };

            dto.QuestionId = questionId;
            var answer = mapper.Map<Answer>(dto);
            answer.IsAccepted = false;
            await uow.Answers.CreateAsync(answer);
            await uow.CompleteAsync();
            return new Response<AnswerDto> { Success = true, Data = mapper.Map<AnswerDto>(answer), Message = "Answer posted." };
        }

        public async Task<Response<AnswerDto>> AcceptAnswerAsync(Guid answerId, Guid questionOwnerId)
        {
            var answer = await uow.Answers.GetByIdAsync(answerId);
            if (answer == null) return new Response<AnswerDto> { Success = false, Message = "Answer not found." };

            var question = await uow.Questions.GetByIdAsync(answer.QuestionId);
            if (question == null || question.UserId != questionOwnerId)
                return new Response<AnswerDto> { Success = false, Message = "Only the question owner can accept an answer." };

            // Unaccept previous and refund reputation
            var all = await uow.Answers.GetAllAsync();
            var prev = all.FirstOrDefault(a => a.QuestionId == answer.QuestionId && a.IsAccepted);
            if (prev != null)
            {
                prev.IsAccepted = false;
                uow.Answers.Update(prev);
                // Refund the +15 rep given when that answer was previously accepted
                await uow.Reputations.CreateAsync(new Reputation { UserId = prev.UserId, Points = -15, Reason = "Answer Acceptance Revoked" });
            }

            answer.IsAccepted = true;
            uow.Answers.Update(answer);
            await uow.Reputations.CreateAsync(new Reputation { UserId = answer.UserId, Points = 15, Reason = "Answer Accepted" });
            await uow.CompleteAsync();
            return new Response<AnswerDto> { Success = true, Data = mapper.Map<AnswerDto>(answer), Message = "Answer accepted. +15 reputation awarded." };
        }

        public async Task<Response<string>> VoteQuestionAsync(Guid questionId, CreateVoteDto dto)
        {
            var question = await uow.Questions.GetByIdAsync(questionId);
            if (question == null) return new Response<string> { Success = false, Message = "Question not found." };
            if (question.UserId == dto.UserId) return new Response<string> { Success = false, Message = "You cannot vote on your own question." };

            var allVotes = await uow.Votes.GetAllAsync();
            var existingVote = allVotes.FirstOrDefault(v => v.QuestionId == questionId && v.UserId == dto.UserId);

            if (existingVote != null)
            {
                if (existingVote.Type == dto.Type)
                {
                    // Toggle: remove vote and reverse reputation
                    uow.Votes.HardDelete(existingVote);
                    int reversal = dto.Type == VoteType.Upvote ? -10 : 2;
                    await uow.Reputations.CreateAsync(new Reputation { UserId = question.UserId, Points = reversal, Reason = $"{dto.Type} Removed" });
                    await uow.CompleteAsync();
                    return new Response<string> { Success = true, Message = $"{dto.Type} removed." };
                }
                else
                {
                    // Change vote: reverse old, apply new
                    int reversal = existingVote.Type == VoteType.Upvote ? -10 : 2;
                    int newPoints = dto.Type == VoteType.Upvote ? 10 : -2;
                    existingVote.Type = dto.Type;
                    uow.Votes.Update(existingVote);
                    await uow.Reputations.CreateAsync(new Reputation { UserId = question.UserId, Points = reversal + newPoints, Reason = $"Vote Changed to {dto.Type}" });
                    await uow.CompleteAsync();
                    return new Response<string> { Success = true, Message = $"Vote changed to {dto.Type}. {newPoints + reversal:+0;-#} net reputation applied." };
                }
            }

            dto.QuestionId = questionId;
            await uow.Votes.CreateAsync(mapper.Map<Vote>(dto));
            int points = dto.Type == VoteType.Upvote ? 10 : -2;
            await uow.Reputations.CreateAsync(new Reputation { UserId = question.UserId, Points = points, Reason = dto.Type.ToString() });
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = $"{dto.Type} recorded. {points:+0;-#} reputation applied." };
        }

        public async Task<Response<string>> VoteAnswerAsync(Guid answerId, CreateVoteDto dto)
        {
            var answer = await uow.Answers.GetByIdAsync(answerId);
            if (answer == null) return new Response<string> { Success = false, Message = "Answer not found." };
            if (answer.UserId == dto.UserId) return new Response<string> { Success = false, Message = "You cannot vote on your own answer." };

            var allVotes = await uow.Votes.GetAllAsync();
            var existingVote = allVotes.FirstOrDefault(v => v.AnswerId == answerId && v.UserId == dto.UserId);

            if (existingVote != null)
            {
                if (existingVote.Type == dto.Type)
                {
                    // Toggle: remove vote and reverse reputation
                    uow.Votes.HardDelete(existingVote);
                    int reversal = dto.Type == VoteType.Upvote ? -10 : 2;
                    await uow.Reputations.CreateAsync(new Reputation { UserId = answer.UserId, Points = reversal, Reason = $"Answer {dto.Type} Removed" });
                    await uow.CompleteAsync();
                    return new Response<string> { Success = true, Message = $"{dto.Type} removed." };
                }
                else
                {
                    // Change vote: reverse old, apply new
                    int reversal = existingVote.Type == VoteType.Upvote ? -10 : 2;
                    int newPoints = dto.Type == VoteType.Upvote ? 10 : -2;
                    existingVote.Type = dto.Type;
                    uow.Votes.Update(existingVote);
                    await uow.Reputations.CreateAsync(new Reputation { UserId = answer.UserId, Points = reversal + newPoints, Reason = $"Answer Vote Changed to {dto.Type}" });
                    await uow.CompleteAsync();
                    return new Response<string> { Success = true, Message = $"Vote changed to {dto.Type}. {newPoints + reversal:+0;-#} net reputation applied." };
                }
            }

            dto.AnswerId = answerId;
            await uow.Votes.CreateAsync(mapper.Map<Vote>(dto));
            int pts = dto.Type == VoteType.Upvote ? 10 : -2;
            await uow.Reputations.CreateAsync(new Reputation { UserId = answer.UserId, Points = pts, Reason = "Answer " + dto.Type });
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = $"{dto.Type} recorded. {pts:+0;-#} reputation applied." };
        }

        public async Task<Response<BountyDto>> AddBountyAsync(Guid questionId, CreateBountyDto dto)
        {
            if (await uow.Questions.GetByIdAsync(questionId) == null)
                return new Response<BountyDto> { Success = false, Message = "Question not found." };
            if (dto.Points < 50) return new Response<BountyDto> { Success = false, Message = "Bounty must be at least 50 points." };

            // Only one active bounty per question
            var existing = await uow.Bounties.GetAllAsync();
            if (existing.Any(b => b.QuestionId == questionId && !b.IsAwarded))
                return new Response<BountyDto> { Success = false, Message = "This question already has an active bounty." };

            dto.QuestionId = questionId;
            var bounty = mapper.Map<Bounty>(dto);
            bounty.IsAwarded = false;
            bounty.ExpiryDate = DateTime.UtcNow.AddDays(7);
            await uow.Bounties.CreateAsync(bounty);
            await uow.CompleteAsync();
            return new Response<BountyDto> { Success = true, Data = mapper.Map<BountyDto>(bounty), Message = "Bounty posted." };
        }

        public async Task<Response<BountyDto>> AwardBountyAsync(Guid bountyId, Guid requesterId, Guid winnerId)
        {
            var bounty = await uow.Bounties.GetByIdAsync(bountyId);
            if (bounty == null) return new Response<BountyDto> { Success = false, Message = "Bounty not found." };
            if (bounty.AwarderId != requesterId) return new Response<BountyDto> { Success = false, Message = "Only the bounty creator can award it." };
            if (bounty.IsAwarded) return new Response<BountyDto> { Success = false, Message = "This bounty has already been awarded." };

            // Verify winner posted an answer on this question
            var answers = await uow.Answers.GetAllAsync();
            if (!answers.Any(a => a.QuestionId == bounty.QuestionId && a.UserId == winnerId))
                return new Response<BountyDto> { Success = false, Message = "Winner must have an answer on this question." };

            bounty.WinnerId = winnerId;
            bounty.IsAwarded = true;
            uow.Bounties.Update(bounty);

            // Transfer points to winner
            await uow.Reputations.CreateAsync(new Reputation { UserId = winnerId, Points = bounty.Points, Reason = "Bounty Award" });
            await uow.CompleteAsync();
            return new Response<BountyDto> { Success = true, Data = mapper.Map<BountyDto>(bounty), Message = $"Bounty awarded. +{bounty.Points} reputation given to winner." };
        }

        public async Task<Response<object>> GetReputationAsync(Guid userId)
        {
            var reps = (await uow.Reputations.GetAllAsync()).Where(r => r.UserId == userId).ToList();
            return new Response<object>
            {
                Success = true,
                Data = new { UserId = userId, TotalPoints = reps.Sum(r => r.Points), History = mapper.Map<IEnumerable<ReputationDto>>(reps) }
            };
        }

        public async Task<Response<IEnumerable<TagDto>>> GetTagsAsync()
        {
            var tags = await uow.Tags.GetAllAsync();
            return new Response<IEnumerable<TagDto>> { Success = true, Data = mapper.Map<IEnumerable<TagDto>>(tags) };
        }

        public async Task<Response<TagDto>> CreateTagAsync(CreateTagDto dto)
        {
            var tag = mapper.Map<Tag>(dto);
            await uow.Tags.CreateAsync(tag);
            await uow.CompleteAsync();
            return new Response<TagDto> { Success = true, Data = mapper.Map<TagDto>(tag) };
        }

        public async Task<Response<QuestionTagDto>> AddQuestionTagAsync(Guid questionId, Guid tagId)
        {
            if (await uow.Questions.GetByIdAsync(questionId) == null)
                return new Response<QuestionTagDto> { Success = false, Message = "Question not found." };
            if (await uow.Tags.GetByIdAsync(tagId) == null)
                return new Response<QuestionTagDto> { Success = false, Message = "Tag not found." };

            var all = await uow.QuestionTags.GetAllAsync();
            if (all.Any(qt => qt.QuestionId == questionId && qt.TagId == tagId))
                return new Response<QuestionTagDto> { Success = false, Message = "Tag already added to this question." };

            var qTag = new QuestionTag { QuestionId = questionId, TagId = tagId };
            await uow.QuestionTags.CreateAsync(qTag);
            await uow.CompleteAsync();
            return new Response<QuestionTagDto> { Success = true, Data = mapper.Map<QuestionTagDto>(qTag) };
        }

        public async Task<Response<string>> RemoveQuestionTagAsync(Guid questionId, Guid tagId)
        {
            var all = await uow.QuestionTags.GetAllAsync();
            var qTag = all.FirstOrDefault(qt => qt.QuestionId == questionId && qt.TagId == tagId);
            if (qTag != null) { uow.QuestionTags.HardDelete(qTag); await uow.CompleteAsync(); }
            return new Response<string> { Success = true, Message = "Tag removed." };
        }

        public async Task<Response<IEnumerable<BadgeDto>>> GetBadgesAsync()
        {
            var badges = await uow.Badges.GetAllAsync();
            return new Response<IEnumerable<BadgeDto>> { Success = true, Data = mapper.Map<IEnumerable<BadgeDto>>(badges) };
        }

        public async Task<Response<BadgeDto>> CreateBadgeAsync(CreateBadgeDto dto)
        {
            var badge = mapper.Map<Badge>(dto);
            await uow.Badges.CreateAsync(badge);
            await uow.CompleteAsync();
            return new Response<BadgeDto> { Success = true, Data = mapper.Map<BadgeDto>(badge) };
        }

        public async Task<Response<AnswerDto>> UpdateAnswerAsync(Guid answerId, Guid requesterId, UpdateAnswerDto dto)
        {
            var ans = await uow.Answers.GetByIdAsync(answerId);
            if (ans == null) return new Response<AnswerDto> { Success = false, Message = "Answer not found." };
            if (ans.UserId != requesterId) return new Response<AnswerDto> { Success = false, Message = "Only the answer author can edit it." };

            if (!string.IsNullOrEmpty(dto.Content)) ans.Content = dto.Content;
            uow.Answers.Update(ans);
            await uow.CompleteAsync();
            return new Response<AnswerDto> { Success = true, Data = mapper.Map<AnswerDto>(ans) };
        }
    }
}
