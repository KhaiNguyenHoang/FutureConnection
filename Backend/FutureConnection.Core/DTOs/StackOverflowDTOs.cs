using System;
using FutureConnection.Core.Enums;

namespace FutureConnection.Core.DTOs
{
    // --- Question DTOs ---
    public class QuestionDto : BaseDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public int ViewCount { get; set; }
        public Guid UserId { get; set; }
    }

    public class CreateQuestionDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public Guid UserId { get; set; }
    }

    public class UpdateQuestionDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
    }

    // --- Answer DTOs ---
    public class AnswerDto : BaseDto
    {
        public required string Content { get; set; }
        public bool IsAccepted { get; set; }
        public Guid QuestionId { get; set; }
        public Guid UserId { get; set; }
    }

    public class CreateAnswerDto
    {
        public required string Content { get; set; }
        public Guid QuestionId { get; set; }
        public Guid UserId { get; set; }
    }

    public class UpdateAnswerDto
    {
        public Guid Id { get; set; }
        public string? Content { get; set; }
        public bool? IsAccepted { get; set; }
    }

    // --- Vote DTOs ---
    public class VoteDto : BaseDto
    {
        public VoteType Type { get; set; }
        public Guid UserId { get; set; }
        public Guid? QuestionId { get; set; }
        public Guid? AnswerId { get; set; }
    }

    public class CreateVoteDto
    {
        public VoteType Type { get; set; }
        public Guid UserId { get; set; }
        public Guid? QuestionId { get; set; }
        public Guid? AnswerId { get; set; }
    }

    // --- Reputation DTOs ---
    public class ReputationDto : BaseDto
    {
        public Guid UserId { get; set; }
        public int Points { get; set; }
        public string? Reason { get; set; }
    }

    // --- Badge DTOs ---
    public class BadgeDto : BaseDto
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public string? ImageUrl { get; set; }
        public BadgeLevel Level { get; set; }
    }

    public class CreateBadgeDto
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public string? ImageUrl { get; set; }
        public BadgeLevel Level { get; set; } = BadgeLevel.Bronze;
    }

    // --- UserBadge DTOs ---
    public class UserBadgeDto : BaseDto
    {
        public Guid UserId { get; set; }
        public Guid BadgeId { get; set; }
    }

    // --- Bounty DTOs ---
    public class BountyDto : BaseDto
    {
        public Guid QuestionId { get; set; }
        public Guid AwarderId { get; set; }
        public Guid? WinnerId { get; set; }
        public int Points { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsAwarded { get; set; }
    }

    public class CreateBountyDto
    {
        public Guid QuestionId { get; set; }
        public Guid AwarderId { get; set; }
        public int Points { get; set; }
        public DateTime ExpiryDate { get; set; }
    }

    // --- QuestionTag DTOs ---
    public class QuestionTagDto : BaseDto
    {
        public Guid QuestionId { get; set; }
        public Guid TagId { get; set; }
    }
}
