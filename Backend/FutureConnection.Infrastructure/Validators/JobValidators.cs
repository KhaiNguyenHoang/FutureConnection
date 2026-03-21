using FluentValidation;
using FutureConnection.Core.DTOs;

namespace FutureConnection.Infrastructure.Validators
{
    public class CreateJobDtoValidator : AbstractValidator<CreateJobDto>
    {
        public CreateJobDtoValidator()
        {
            RuleFor(static x => x.Title)
                .NotEmpty().WithMessage("Job title is required")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

            RuleFor(static x => x.Description)
                .NotEmpty().WithMessage("Job description is required")
                .MinimumLength(20).WithMessage("Description must be at least 20 characters long");

            RuleFor(static x => x.Budget)
                .GreaterThan(0).When(static x => x.Budget.HasValue)
                .WithMessage("Budget must be greater than 0");

            RuleFor(static x => x.Deadline)
                .GreaterThan(DateTime.UtcNow).When(static x => x.Deadline.HasValue)
                .WithMessage("Deadline must be a future date");

            RuleFor(static x => x.EmployerId)
                .NotEmpty().WithMessage("Employer ID is required");

            RuleFor(static x => x.JobTypeId)
                .NotEmpty().WithMessage("Job Type ID is required");
        }
    }

    public class UpdateJobDtoValidator : AbstractValidator<UpdateJobDto>
    {
        public UpdateJobDtoValidator()
        {
            RuleFor(static x => x.Id)
                .NotEmpty().WithMessage("Job ID is required");

            RuleFor(static x => x.Title)
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters")
                .When(static x => !string.IsNullOrEmpty(x.Title));

            RuleFor(static x => x.Budget)
                .GreaterThan(0).When(static x => x.Budget.HasValue)
                .WithMessage("Budget must be greater than 0");
        }
    }

    public class CreateApplicationDtoValidator : AbstractValidator<CreateApplicationDto>
    {
        public CreateApplicationDtoValidator()
        {
            RuleFor(static x => x.CoverLetter)
                .NotEmpty().WithMessage("Cover letter is required")
                .MinimumLength(50).WithMessage("Cover letter should be at least 50 characters long");

            RuleFor(static x => x.ProposedPrice)
                .GreaterThan(0).When(static x => x.ProposedPrice.HasValue)
                .WithMessage("Proposed price must be greater than 0");

            RuleFor(static x => x.JobId)
                .NotEmpty().WithMessage("Job ID is required");

            RuleFor(static x => x.ApplicantId)
                .NotEmpty().WithMessage("Applicant ID is required");
        }
    }
}
