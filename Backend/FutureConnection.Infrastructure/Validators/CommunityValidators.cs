using FluentValidation;
using FutureConnection.Core.DTOs;

namespace FutureConnection.Infrastructure.Validators
{
    public class CreatePostDtoValidator : AbstractValidator<CreatePostDto>
    {
        public CreatePostDtoValidator()
        {
            RuleFor(static x => x.Title)
                .NotEmpty().WithMessage("Post title is required")
                .MaximumLength(255).WithMessage("Title must not exceed 255 characters");

            RuleFor(static x => x.Content)
                .NotEmpty().WithMessage("Post content is required");

            RuleFor(static x => x.UserId)
                .NotEmpty().WithMessage("User ID is required");
        }
    }

    public class CreateCommentDtoValidator : AbstractValidator<CreateCommentDto>
    {
        public CreateCommentDtoValidator()
        {
            RuleFor(static x => x.Content)
                .NotEmpty().WithMessage("Comment content is required")
                .MaximumLength(1000).WithMessage("Comment must not exceed 1000 characters");

            RuleFor(static x => x.PostId)
                .NotEmpty().WithMessage("Post ID is required");

            RuleFor(static x => x.UserId)
                .NotEmpty().WithMessage("User ID is required");
        }
    }

    public class CreateMessageDtoValidator : AbstractValidator<CreateMessageDto>
    {
        public CreateMessageDtoValidator()
        {
            RuleFor(static x => x.Content)
                .NotEmpty().WithMessage("Message content is required");

            RuleFor(static x => x.SenderId)
                .NotEmpty().WithMessage("Sender ID is required");

            RuleFor(static x => x.Content)
                .MaximumLength(2000).WithMessage("Message is too long (maximum 2000 characters)");
        }
    }
}
