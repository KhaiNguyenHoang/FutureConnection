using FutureConnection.Core.DTOs;
using FutureConnection.Core.Enums;

namespace FutureConnection.FreelanceService.Application
{
    public interface IContractService
    {
        Task<Response<IEnumerable<ContractDto>>> GetContractsAsync(Guid? userId);
        Task<Response<ContractDto>> GetByIdAsync(Guid id);
        Task<Response<ContractDto>> CreateAsync(Guid employerId, CreateContractDto dto);
        Task<Response<ContractDto>> UpdateStatusAsync(Guid id, Guid requesterId, ContractStatus status);

        Task<Response<IEnumerable<ContractMilestoneDto>>> GetMilestonesAsync(Guid contractId);
        Task<Response<ContractMilestoneDto>> AddMilestoneAsync(Guid contractId, Guid requesterId, CreateContractMilestoneDto dto);
        Task<Response<ContractMilestoneDto>> CompleteMilestoneAsync(Guid milestoneId, Guid requesterId);

        Task<Response<DisputeDto>> OpenDisputeAsync(Guid contractId, Guid requesterId, CreateDisputeDto dto);
        Task<Response<string>> ResolveDisputeAsync(Guid disputeId, Core.Enums.DisputeStatus resolutionStatus);

        Task<Response<ReviewDto>> PostReviewAsync(Guid contractId, Guid requesterId, CreateReviewDto dto);
        Task<Response<IEnumerable<ReviewDto>>> GetReviewsAsync(Guid contractId);
        
        Task<Response<IEnumerable<TransactionDto>>> GetTransactionsAsync(Guid contractId);
        
        Task<Response<ContractMilestoneDto>> GetMilestoneByIdAsync(Guid milestoneId);
        Task<Response<string>> PayMilestoneAsync(Guid milestoneId, Guid requesterId);

        Task<Response<IEnumerable<DisputeDto>>> GetAllDisputesAsync();
    }

    public interface IAgencyService
    {
        Task<Response<IEnumerable<AgencyDto>>> GetAgenciesAsync();
        Task<Response<AgencyDto>> GetByIdAsync(Guid agencyId);
        Task<Response<AgencyDto>> CreateAsync(Guid ownerId, CreateAgencyDto dto);
        Task<Response<AgencyDto>> UpdateAsync(Guid agencyId, Guid requesterId, UpdateAgencyDto dto);
        Task<Response<string>> DeleteAsync(Guid agencyId, Guid requesterId);

        Task<Response<AgencyMemberDto>> AddMemberAsync(Guid agencyId, Guid requesterId, CreateAgencyMemberDto dto);
        Task<Response<string>> RemoveMemberAsync(Guid agencyId, Guid requesterId, Guid memberId);
    }
}
