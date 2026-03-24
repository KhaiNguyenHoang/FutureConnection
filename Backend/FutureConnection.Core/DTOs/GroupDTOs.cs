using System;
using FutureConnection.Core.Enums;

namespace FutureConnection.Core.DTOs
{
    // --- Group DTOs ---
    public class GroupDto : BaseDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsPrivate { get; set; }
        public Guid OwnerId { get; set; }
    }

    public class CreateGroupDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsPrivate { get; set; }
    }

    public class UpdateGroupDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsPrivate { get; set; }
    }

    // --- GroupMember DTOs ---
    public class GroupMemberDto : BaseDto
    {
        public Guid GroupId { get; set; }
        public Guid UserId { get; set; }
        public string? UserFirstName { get; set; }
        public string? UserLastName { get; set; }
        public string? UserAvatarUrl { get; set; }
        public GroupRole Role { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class CreateGroupMemberDto
    {
        public Guid GroupId { get; set; }
        public Guid? UserId { get; set; }
        public string? Email { get; set; }
        public GroupRole Role { get; set; } = GroupRole.Member;
    }

    public class UpdateGroupMemberDto
    {
        public Guid Id { get; set; }
        public GroupRole Role { get; set; }
    }
}
