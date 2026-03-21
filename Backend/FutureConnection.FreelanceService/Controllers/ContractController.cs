using FutureConnection.Core.DTOs;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Utils;
using FutureConnection.FreelanceService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.FreelanceService.Controllers
{
    [ApiController]
    [Route("api/contracts")]
    [Authorize]
    public class ContractController(IContractService contractService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetContracts()
            => Ok(await contractService.GetContractsAsync(User.GetUserId()));

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetContract(Guid id)
        {
            var result = await contractService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> CreateContract([FromBody] CreateContractDto dto)
        {
            var result = await contractService.CreateAsync(User.GetUserId(), dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id:guid}/status")]
        [Authorize(Roles = "Employer,Freelancer,Admin")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] ContractStatus status)
        {
            var result = await contractService.UpdateStatusAsync(id, User.GetUserId(), status);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:guid}/milestones")]
        public async Task<IActionResult> GetMilestones(Guid id)
            => Ok(await contractService.GetMilestonesAsync(id));

        [HttpPost("{id:guid}/milestones")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> AddMilestone(Guid id, [FromBody] CreateContractMilestoneDto dto)
        {
            var result = await contractService.AddMilestoneAsync(id, User.GetUserId(), dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("milestones/{milestoneId:guid}/complete")]
        [Authorize(Roles = "Freelancer,Admin")]
        public async Task<IActionResult> CompleteMilestone(Guid milestoneId)
        {
            var result = await contractService.CompleteMilestoneAsync(milestoneId, User.GetUserId());
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost("{id:guid}/disputes")]
        public async Task<IActionResult> OpenDispute(Guid id, [FromBody] CreateDisputeDto dto)
        {
            var result = await contractService.OpenDisputeAsync(id, User.GetUserId(), dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:guid}/reviews")]
        public async Task<IActionResult> PostReview(Guid id, [FromBody] CreateReviewDto dto)
        {
            var result = await contractService.PostReviewAsync(id, User.GetUserId(), dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:guid}/reviews")]
        public async Task<IActionResult> GetReviews(Guid id)
            => Ok(await contractService.GetReviewsAsync(id));

        [HttpGet("{id:guid}/transactions")]
        public async Task<IActionResult> GetTransactions(Guid id)
            => Ok(await contractService.GetTransactionsAsync(id));

        [HttpGet("milestones/{milestoneId:guid}")]
        public async Task<IActionResult> GetMilestone(Guid milestoneId)
        {
            var result = await contractService.GetMilestoneByIdAsync(milestoneId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("milestones/{milestoneId:guid}/pay")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> PayMilestone(Guid milestoneId)
        {
            var result = await contractService.PayMilestoneAsync(milestoneId, User.GetUserId());
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("disputes")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllDisputes()
            => Ok(await contractService.GetAllDisputesAsync());

        [HttpPut("disputes/{disputeId:guid}/resolve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResolveDispute(Guid disputeId, [FromQuery] DisputeStatus status)
        {
            var result = await contractService.ResolveDisputeAsync(disputeId, status);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
