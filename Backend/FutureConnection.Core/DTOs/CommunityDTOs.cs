using System;
using FutureConnection.Core.Enums;

namespace FutureConnection.Core.DTOs
{
    // --- Post DTOs ---
    public class PostDto : BaseDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public Guid UserId { get; set; }
        
        public string? AuthorFirstName { get; set; }
        public string? AuthorLastName { get; set; }
        public string? AuthorAvatarUrl { get; set; }
        
        public int ReactionCount { get; set; }
        public int CommentCount { get; set; }
        public int ShareCount { get; set; }
        public int ViewCount { get; set; }
        public bool UserHasReacted { get; set; }
        public List<PostMediaDto>? Media { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class CreatePostDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public Guid UserId { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class UpdatePostDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class PostMediaDto : BaseDto
    {
        public required string MediaUrl { get; set; }
        public string? PublicId { get; set; }
        public string? ResourceType { get; set; }
    }

    // --- PostTag DTOs ---
    public class PostTagDto : BaseDto
    {
        public Guid PostId { get; set; }
        public Guid TagId { get; set; }
    }

    public class CreatePostTagDto
    {
        public Guid PostId { get; set; }
        public Guid TagId { get; set; }
    }

    // --- Comment DTOs ---
    public class CommentDto : BaseDto
    {
        public required string Content { get; set; }
        public Guid? ParentCommentId { get; set; }
        public Guid PostId { get; set; }
        public Guid UserId { get; set; }

        public string? AuthorFirstName { get; set; }
        public string? AuthorLastName { get; set; }
        public string? AuthorAvatarUrl { get; set; }
    }

    public class CreateCommentDto
    {
        public required string Content { get; set; }
        public Guid? ParentCommentId { get; set; }
        public Guid PostId { get; set; }
        public Guid UserId { get; set; }
    }

    public class UpdateCommentDto
    {
        public Guid Id { get; set; }
        public string? Content { get; set; }
    }

    // --- Reaction DTOs ---
    public class ReactionDto : BaseDto
    {
        public ReactionType Type { get; set; }
        public Guid? PostId { get; set; }
        public Guid? CommentId { get; set; }
        public Guid UserId { get; set; }
    }

    public class CreateReactionDto
    {
        public ReactionType Type { get; set; }
        public Guid? PostId { get; set; }
        public Guid? CommentId { get; set; }
        public Guid UserId { get; set; }
    }

    // --- Message DTOs ---
    public class MessageDto : BaseDto
    {
        public required string Content { get; set; }
        public Guid SenderId { get; set; }
        public string? SenderFirstName { get; set; }
        public string? SenderLastName { get; set; }
        public string? SenderAvatarUrl { get; set; }
        public Guid? ReceiverId { get; set; }
        public Guid? GroupId { get; set; }
        public Guid? ChannelId { get; set; }
    }

    public class CreateMessageDto
    {
        public required string Content { get; set; }
        public Guid SenderId { get; set; }
        public Guid? ReceiverId { get; set; }
        public Guid? GroupId { get; set; }
        public Guid? ChannelId { get; set; }
    }

    public class UpdateMessageDto
    {
        public Guid Id { get; set; }
        public string? Content { get; set; }
    }

    // --- Channel DTOs ---
    public class ChannelDto : BaseDto
    {
        public Guid GroupId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public ChannelType Type { get; set; }
    }

    public class CreateChannelDto
    {
        public Guid GroupId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public ChannelType Type { get; set; }
    }

    public class UpdateChannelDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public ChannelType? Type { get; set; }
    }

    // --- Top Contributor DTOs ---
    public class TopContributorDto
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public int BadgeCount { get; set; }
    }
}
