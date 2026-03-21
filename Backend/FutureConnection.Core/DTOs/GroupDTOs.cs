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
    }

    public class CreateGroupDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class UpdateGroupDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? AvatarUrl { get; set; }
    }

    // --- GroupMember DTOs ---
    public class GroupMemberDto : BaseDto
    {
        public Guid GroupId { get; set; }
        public Guid UserId { get; set; }
        public GroupRole Role { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class CreateGroupMemberDto
    {
        public Guid GroupId { get; set; }
        public Guid UserId { get; set; }
        public GroupRole Role { get; set; } = GroupRole.Member;
    }

    public class UpdateGroupMemberDto
    {
        public Guid Id { get; set; }
        public GroupRole Role { get; set; }
    }
}
