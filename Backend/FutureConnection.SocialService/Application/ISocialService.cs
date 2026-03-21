using FutureConnection.Core.DTOs;
using Microsoft.AspNetCore.Http;

namespace FutureConnection.SocialService.Application
{
    public interface ISocialService
    {
        Task<PagedResponse<PostDto>> GetFeedAsync(Guid? userId, PagedRequest request);
        Task<Response<PostDto>> CreatePostAsync(Guid userId, CreatePostDto dto, IFormFileCollection? mediaFiles);
        Task<Response<CommentDto>> CommentAsync(Guid userId, Guid postId, CreateCommentDto dto, IFormFileCollection? mediaFiles);
        Task<Response<ReactionDto>> ReactAsync(Guid userId, Guid postId, CreateReactionDto dto);
        Task<Response<PostDto>> GetPostByIdAsync(Guid postId);
        Task<Response<PostDto>> UpdatePostAsync(Guid postId, Guid requesterId, UpdatePostDto dto);
        Task<Response<string>> DeletePostAsync(Guid postId, Guid requesterId);

        Task<Response<IEnumerable<CommentDto>>> GetPostCommentsAsync(Guid postId);
        Task<Response<CommentDto>> UpdateCommentAsync(Guid commentId, Guid requesterId, UpdateCommentDto dto);
        Task<Response<string>> DeleteCommentAsync(Guid commentId, Guid requesterId);

        Task<Response<IEnumerable<ReactionDto>>> GetCommentReactionsAsync(Guid commentId);
        Task<Response<ReactionDto>> ReactToCommentAsync(Guid userId, Guid commentId, CreateReactionDto dto);

        Task<Response<string>> RequestConnectionAsync(Guid requesterId, Guid addresseeId);
        Task<Response<string>> RespondConnectionAsync(Guid connectionId, Guid userId, Core.Enums.ConnectionStatus status);
        Task<Response<IEnumerable<ConnectionDto>>> GetConnectionsAsync(Guid userId);
        Task<Response<IEnumerable<ConnectionDto>>> GetPendingConnectionsAsync(Guid userId);
        Task<Response<string>> DeleteConnectionAsync(Guid connectionId, Guid userId);
    }
}
