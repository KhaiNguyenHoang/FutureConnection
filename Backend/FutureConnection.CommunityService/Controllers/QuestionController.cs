using FutureConnection.Core.DTOs;
using FutureConnection.Core.Utils;
using FutureConnection.CommunityService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.CommunityService.Controllers
{
    [ApiController]
    [Route("api/questions")]
    [Authorize]
    public class QuestionController(IQuestionService questionService) : ControllerBase
    {
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetQuestions([FromQuery] PagedRequest request)
            => Ok(await questionService.GetQuestionsAsync(request));

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetQuestion(Guid id)
        {
            var result = await questionService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        public async Task<IActionResult> AskQuestion([FromBody] CreateQuestionDto dto)
            => Ok(await questionService.CreateAsync(dto));

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateQuestion(Guid id, [FromBody] UpdateQuestionDto dto)
        {
            var result = await questionService.UpdateAsync(id, User.GetUserId(), dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteQuestion(Guid id)
            => Ok(await questionService.DeleteAsync(id));

        [HttpGet("{id:guid}/answers")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAnswers(Guid id)
            => Ok(await questionService.GetAnswersAsync(id));

        [HttpPost("{id:guid}/answers")]
        public async Task<IActionResult> PostAnswer(Guid id, [FromBody] CreateAnswerDto dto)
        {
            var result = await questionService.PostAnswerAsync(id, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("answers/{answerId:guid}/accept")]
        public async Task<IActionResult> AcceptAnswer(Guid answerId)
        {
            var userId = User.GetUserId();
            var result = await questionService.AcceptAnswerAsync(answerId, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:guid}/vote")]
        public async Task<IActionResult> VoteQuestion(Guid id, [FromBody] CreateVoteDto dto)
        {
            dto.UserId = User.GetUserId();
            var result = await questionService.VoteQuestionAsync(id, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("answers/{answerId:guid}/vote")]
        public async Task<IActionResult> VoteAnswer(Guid answerId, [FromBody] CreateVoteDto dto)
        {
            dto.UserId = User.GetUserId();
            var result = await questionService.VoteAnswerAsync(answerId, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:guid}/bounties")]
        public async Task<IActionResult> AddBounty(Guid id, [FromBody] CreateBountyDto dto)
        {
            var result = await questionService.AddBountyAsync(id, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("reputation/{userId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReputation(Guid userId)
            => Ok(await questionService.GetReputationAsync(userId));

        [HttpPut("answers/{answerId:guid}")]
        public async Task<IActionResult> UpdateAnswer(Guid answerId, [FromBody] UpdateAnswerDto dto)
        {
            var result = await questionService.UpdateAnswerAsync(answerId, User.GetUserId(), dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost("bounties/{bountyId:guid}/award")]
        public async Task<IActionResult> AwardBounty(Guid bountyId, [FromQuery] Guid winnerId)
        {
            var result = await questionService.AwardBountyAsync(bountyId, User.GetUserId(), winnerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:guid}/tags")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddQuestionTag(Guid id, [FromQuery] Guid tagId)
        {
            var result = await questionService.AddQuestionTagAsync(id, tagId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id:guid}/tags/{tagId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveQuestionTag(Guid id, Guid tagId)
            => Ok(await questionService.RemoveQuestionTagAsync(id, tagId));
    }
}
