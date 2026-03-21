using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Repositories;

namespace FutureConnection.FreelanceService.Application
{
    public class ContractService(IUnitOfWork uow, IMapper mapper) : IContractService
    {
        public async Task<Response<IEnumerable<ContractDto>>> GetContractsAsync(Guid? userId)
        {
            var contracts = await uow.Contracts.GetAllAsync();
            if (userId.HasValue)
                contracts = contracts.Where(c => c.EmployerId == userId || c.FreelancerId == userId).ToList();
            return new Response<IEnumerable<ContractDto>> { Success = true, Data = mapper.Map<IEnumerable<ContractDto>>(contracts) };
        }

        public async Task<Response<ContractDto>> GetByIdAsync(Guid id)
        {
            var contract = await uow.Contracts.GetByIdAsync(id);
            return contract == null
                ? new Response<ContractDto> { Success = false, Message = "Contract not found." }
                : new Response<ContractDto> { Success = true, Data = mapper.Map<ContractDto>(contract) };
        }

        public async Task<Response<ContractDto>> CreateAsync(Guid employerId, CreateContractDto dto)
        {
            var application = await uow.Applications.GetByIdAsync(dto.ApplicationId);
            if (application == null) return new Response<ContractDto> { Success = false, Message = "Invalid application." };
            if (application.Status != ApplicationStatus.Accepted)
                return new Response<ContractDto> { Success = false, Message = "Contract can only be created from an accepted application." };

            var contract = mapper.Map<Contract>(dto);
            contract.EmployerId = employerId;
            contract.FreelancerId = application.ApplicantId;
            contract.Status = ContractStatus.Active;
            await uow.Contracts.CreateAsync(contract);
            await uow.CompleteAsync();
            return new Response<ContractDto> { Success = true, Data = mapper.Map<ContractDto>(contract), Message = "Contract created." };
        }

        public async Task<Response<ContractDto>> UpdateStatusAsync(Guid id, Guid requesterId, ContractStatus status)
        {
            var contract = await uow.Contracts.GetByIdAsync(id);
            if (contract == null) return new Response<ContractDto> { Success = false, Message = "Contract not found." };
            if (contract.EmployerId != requesterId && contract.FreelancerId != requesterId)
                return new Response<ContractDto> { Success = false, Message = "Unauthorized." };

            if (contract.Status == ContractStatus.Completed && status == ContractStatus.Cancelled)
                return new Response<ContractDto> { Success = false, Message = "A completed contract cannot be cancelled." };

            contract.Status = status;
            if (status == ContractStatus.Completed) contract.EndDate = DateTime.UtcNow;
            uow.Contracts.Update(contract);
            await uow.CompleteAsync();
            return new Response<ContractDto> { Success = true, Data = mapper.Map<ContractDto>(contract), Message = "Contract status updated." };
        }

        public async Task<Response<IEnumerable<ContractMilestoneDto>>> GetMilestonesAsync(Guid contractId)
        {
            var milestones = await uow.ContractMilestones.GetAllAsync();
            return new Response<IEnumerable<ContractMilestoneDto>> { Success = true, Data = mapper.Map<IEnumerable<ContractMilestoneDto>>(milestones.Where(m => m.ContractId == contractId)) };
        }

        public async Task<Response<ContractMilestoneDto>> AddMilestoneAsync(Guid contractId, Guid requesterId, CreateContractMilestoneDto dto)
        {
            var contract = await uow.Contracts.GetByIdAsync(contractId);
            if (contract == null) return new Response<ContractMilestoneDto> { Success = false, Message = "Contract not found." };
            if (contract.EmployerId != requesterId) return new Response<ContractMilestoneDto> { Success = false, Message = "Only the employer can add milestones." };
            if (contract.Status != ContractStatus.Active)
                return new Response<ContractMilestoneDto> { Success = false, Message = "Milestones can only be added to active contracts." };

            dto.ContractId = contractId;
            var milestone = mapper.Map<ContractMilestone>(dto);
            milestone.IsCompleted = false;
            milestone.IsPaid = false;
            await uow.ContractMilestones.CreateAsync(milestone);
            await uow.CompleteAsync();
            return new Response<ContractMilestoneDto> { Success = true, Data = mapper.Map<ContractMilestoneDto>(milestone), Message = "Milestone added." };
        }

        public async Task<Response<ContractMilestoneDto>> CompleteMilestoneAsync(Guid milestoneId, Guid requesterId)
        {
            var milestone = await uow.ContractMilestones.GetByIdAsync(milestoneId);
            if (milestone == null) return new Response<ContractMilestoneDto> { Success = false, Message = "Milestone not found." };
            
            var contract = await uow.Contracts.GetByIdAsync(milestone.ContractId);
            if (contract == null || contract.FreelancerId != requesterId)
                return new Response<ContractMilestoneDto> { Success = false, Message = "Unauthorized." };

            milestone.IsCompleted = true;
            uow.ContractMilestones.Update(milestone);
            await uow.CompleteAsync();
            return new Response<ContractMilestoneDto> { Success = true, Data = mapper.Map<ContractMilestoneDto>(milestone), Message = "Milestone marked as completed." };
        }

        public async Task<Response<DisputeDto>> OpenDisputeAsync(Guid contractId, Guid requesterId, CreateDisputeDto dto)
        {
            var contract = await uow.Contracts.GetByIdAsync(contractId);
            if (contract == null) return new Response<DisputeDto> { Success = false, Message = "Contract not found." };
            if (contract.Status == ContractStatus.Completed)
                return new Response<DisputeDto> { Success = false, Message = "Cannot open a dispute on a completed contract." };
            if (requesterId != contract.EmployerId && requesterId != contract.FreelancerId)
                return new Response<DisputeDto> { Success = false, Message = "Only parties in the contract can open a dispute." };
 
            dto.ContractId = contractId;
            dto.IssuerId = requesterId;
            var dispute = mapper.Map<Dispute>(dto);
            dispute.Status = DisputeStatus.Open;
            await uow.Disputes.CreateAsync(dispute);
            await uow.CompleteAsync();
            return new Response<DisputeDto> { Success = true, Data = mapper.Map<DisputeDto>(dispute), Message = "Dispute opened." };
        }

        public async Task<Response<ReviewDto>> PostReviewAsync(Guid contractId, Guid requesterId, CreateReviewDto dto)
        {
            var contract = await uow.Contracts.GetByIdAsync(contractId);
            if (contract == null) return new Response<ReviewDto> { Success = false, Message = "Contract not found." };
            if (contract.Status != ContractStatus.Completed)
                return new Response<ReviewDto> { Success = false, Message = "Reviews can only be submitted after contract completion." };
            if (dto.Score < 1 || dto.Score > 5)
                return new Response<ReviewDto> { Success = false, Message = "Score must be between 1 and 5." };
            if (requesterId != contract.EmployerId && requesterId != contract.FreelancerId)
                return new Response<ReviewDto> { Success = false, Message = "Only contract parties can leave a review." };
 
            dto.ContractId = contractId;
            dto.ReviewerId = requesterId;
            var review = mapper.Map<Review>(dto);
            await uow.Reviews.CreateAsync(review);
            await uow.CompleteAsync();
            return new Response<ReviewDto> { Success = true, Data = mapper.Map<ReviewDto>(review), Message = "Review submitted." };
        }

        public async Task<Response<IEnumerable<ReviewDto>>> GetReviewsAsync(Guid contractId)
        {
            var reviews = await uow.Reviews.GetAllAsync();
            return new Response<IEnumerable<ReviewDto>> { Success = true, Data = mapper.Map<IEnumerable<ReviewDto>>(reviews.Where(r => r.ContractId == contractId)) };
        }

        public async Task<Response<IEnumerable<TransactionDto>>> GetTransactionsAsync(Guid contractId)
        {
            var transactions = await uow.Transactions.GetAllAsync();
            return new Response<IEnumerable<TransactionDto>> { Success = true, Data = mapper.Map<IEnumerable<TransactionDto>>(transactions.Where(t => t.RelatedContractId == contractId)) };
        }

        public async Task<Response<ContractMilestoneDto>> GetMilestoneByIdAsync(Guid milestoneId)
        {
            var m = await uow.ContractMilestones.GetByIdAsync(milestoneId);
            return m == null ? new Response<ContractMilestoneDto> { Success = false, Message = "Milestone not found." }
                             : new Response<ContractMilestoneDto> { Success = true, Data = mapper.Map<ContractMilestoneDto>(m) };
        }

        public async Task<Response<string>> PayMilestoneAsync(Guid milestoneId, Guid requesterId)
        {
            var milestone = await uow.ContractMilestones.GetByIdAsync(milestoneId);
            if (milestone == null) return new Response<string> { Success = false, Message = "Milestone not found." };
            
            var contract = await uow.Contracts.GetByIdAsync(milestone.ContractId);
            if (contract == null || contract.EmployerId != requesterId)
                return new Response<string> { Success = false, Message = "Unauthorized." };

            if (!milestone.IsCompleted) return new Response<string> { Success = false, Message = "Cannot pay an incomplete milestone." };
            if (milestone.IsPaid) return new Response<string> { Success = false, Message = "Milestone is already paid." };
 
            milestone.IsPaid = true;
            uow.ContractMilestones.Update(milestone);
            
            // Auto-generate transaction
            var transaction = new Transaction
            {
                UserId = contract.FreelancerId,
                Amount = milestone.Amount,
                Type = TransactionType.EscrowRelease,
                RelatedContractId = contract.Id,
                RelatedMilestoneId = milestone.Id
            };
            await uow.Transactions.CreateAsync(transaction);
            
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Milestone paid." };
        }

        public async Task<Response<IEnumerable<DisputeDto>>> GetAllDisputesAsync()
        {
            var disputes = await uow.Disputes.GetAllAsync();
            return new Response<IEnumerable<DisputeDto>> { Success = true, Data = mapper.Map<IEnumerable<DisputeDto>>(disputes) };
        }

        public async Task<Response<string>> ResolveDisputeAsync(Guid disputeId, DisputeStatus resolutionStatus)
        {
            var dispute = await uow.Disputes.GetByIdAsync(disputeId);
            if (dispute == null) return new Response<string> { Success = false, Message = "Dispute not found." };

            dispute.Status = resolutionStatus;
            uow.Disputes.Update(dispute);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Dispute resolved." };
        }
    }

    public class AgencyService(IUnitOfWork uow, IMapper mapper) : IAgencyService
    {
        public async Task<Response<IEnumerable<AgencyDto>>> GetAgenciesAsync()
        {
            var agencies = await uow.Agencies.GetAllAsync();
            return new Response<IEnumerable<AgencyDto>> { Success = true, Data = mapper.Map<IEnumerable<AgencyDto>>(agencies) };
        }

        public async Task<Response<AgencyDto>> GetByIdAsync(Guid agencyId)
        {
            var a = await uow.Agencies.GetByIdAsync(agencyId);
            return a == null ? new Response<AgencyDto> { Success = false, Message = "Agency not found." }
                             : new Response<AgencyDto> { Success = true, Data = mapper.Map<AgencyDto>(a) };
        }

        public async Task<Response<AgencyDto>> CreateAsync(Guid ownerId, CreateAgencyDto dto)
        {
            var agency = mapper.Map<Agency>(dto);
            agency.OwnerId = ownerId;
            await uow.Agencies.CreateAsync(agency);
            await uow.CompleteAsync();
            return new Response<AgencyDto> { Success = true, Data = mapper.Map<AgencyDto>(agency) };
        }

        public async Task<Response<AgencyDto>> UpdateAsync(Guid agencyId, Guid requesterId, UpdateAgencyDto dto)
        {
            var a = await uow.Agencies.GetByIdAsync(agencyId);
            if (a == null) return new Response<AgencyDto> { Success = false, Message = "Agency not found." };
            if (a.OwnerId != requesterId) return new Response<AgencyDto> { Success = false, Message = "Unauthorized." };

            if (!string.IsNullOrEmpty(dto.Name)) a.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Description)) a.Description = dto.Description;
            uow.Agencies.Update(a);
            await uow.CompleteAsync();
            return new Response<AgencyDto> { Success = true, Data = mapper.Map<AgencyDto>(a) };
        }

        public async Task<Response<string>> DeleteAsync(Guid agencyId, Guid requesterId)
        {
            var a = await uow.Agencies.GetByIdAsync(agencyId);
            if (a == null) return new Response<string> { Success = false, Message = "Agency not found." };
            if (a.OwnerId != requesterId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.Agencies.SoftDeleteAsync(agencyId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Agency deleted." };
        }

        public async Task<Response<AgencyMemberDto>> AddMemberAsync(Guid agencyId, Guid requesterId, CreateAgencyMemberDto dto)
        {
            var a = await uow.Agencies.GetByIdAsync(agencyId);
            if (a == null || a.OwnerId != requesterId) return new Response<AgencyMemberDto> { Success = false, Message = "Unauthorized." };

            var member = mapper.Map<AgencyMember>(dto);
            member.AgencyId = agencyId;
            await uow.AgencyMembers.CreateAsync(member);
            await uow.CompleteAsync();
            return new Response<AgencyMemberDto> { Success = true, Data = mapper.Map<AgencyMemberDto>(member) };
        }

        public async Task<Response<string>> RemoveMemberAsync(Guid agencyId, Guid requesterId, Guid memberId)
        {
            var a = await uow.Agencies.GetByIdAsync(agencyId);
            if (a == null || a.OwnerId != requesterId) return new Response<string> { Success = false, Message = "Unauthorized." };

            var all = await uow.AgencyMembers.GetAllAsync();
            var member = all.FirstOrDefault(m => m.AgencyId == agencyId && m.Id == memberId);
            if (member != null) { uow.AgencyMembers.HardDelete(member); await uow.CompleteAsync(); }
            return new Response<string> { Success = true, Message = "Member removed." };
        }
    }
}
