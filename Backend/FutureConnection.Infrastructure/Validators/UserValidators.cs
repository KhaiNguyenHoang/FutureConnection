using FluentValidation;
using FutureConnection.Core.DTOs;

namespace FutureConnection.Infrastructure.Validators
{
    public class LoginUserDtoValidator : AbstractValidator<LoginUserDto>
    {
        public LoginUserDtoValidator()
        {
            RuleFor(static x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email format is invalid");

            RuleFor(static x => x.Password)
                .NotEmpty().WithMessage("Password is required");
        }
    }

    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserDtoValidator()
        {
            RuleFor(static x => x.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .MaximumLength(50).WithMessage("First name must not exceed 50 characters");

            RuleFor(static x => x.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .MaximumLength(50).WithMessage("Last name must not exceed 50 characters");

            RuleFor(static x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email format is invalid");

            RuleFor(static x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one digit")
                .Matches(@"[\!\?\*\.]").WithMessage("Password must contain at least one special character (!?*.)");

            RuleFor(static x => x.RoleId)
                .NotEmpty().WithMessage("Role ID is required");
        }
    }

    public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
    {
        public UpdateUserDtoValidator()
        {
            RuleFor(static x => x.Id)
                .NotEmpty().WithMessage("User ID is required");

            RuleFor(static x => x.Email)
                .EmailAddress().When(static x => !string.IsNullOrEmpty(x.Email))
                .WithMessage("Email format is invalid");

            RuleFor(static x => x.FirstName)
                .MaximumLength(50).WithMessage("First name must not exceed 50 characters");

            RuleFor(static x => x.LastName)
                .MaximumLength(50).WithMessage("Last name must not exceed 50 characters");
        }
    }
}
