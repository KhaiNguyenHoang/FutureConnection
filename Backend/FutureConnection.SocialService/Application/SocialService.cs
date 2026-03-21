using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using Microsoft.AspNetCore.Http;

namespace FutureConnection.SocialService.Application
{
    public class SocialApplicationService(IUnitOfWork uow, IMapper mapper, IMediaService mediaService) : ISocialService
    {
        public async Task<PagedResponse<PostDto>> GetFeedAsync(Guid? userId, PagedRequest request)
        {
            var posts = userId.HasValue
                ? await uow.Posts.FindAsync(p => p.UserId == userId.Value && !p.IsDeleted)
                : await uow.Posts.FindAsync(p => !p.IsDeleted);
            var filtered = string.IsNullOrEmpty(request.Keyword)
                ? posts
                : posts.Where(p => p.Title.Contains(request.Keyword, StringComparison.OrdinalIgnoreCase)
                                || p.Content.Contains(request.Keyword, StringComparison.OrdinalIgnoreCase));
            return PagedResponse<PostDto>.Create(mapper.Map<IEnumerable<PostDto>>(filtered), request.Page, request.PageSize);
        }

        public async Task<Response<PostDto>> CreatePostAsync(Guid userId, CreatePostDto dto, IFormFileCollection? mediaFiles)
        {
            var post = mapper.Map<Post>(dto);
            post.UserId = userId;
            post.Media = new List<PostMedia>();

            if (mediaFiles != null && mediaFiles.Any())
            {
                foreach (var file in mediaFiles)
                {
                    var uploadResult = await mediaService.UploadMediaAsync(file);
                    if (uploadResult != null)
                    {
                        post.Media.Add(new PostMedia
                        {
                            MediaUrl = uploadResult.Url,
                            PublicId = uploadResult.PublicId,
                            ResourceType = uploadResult.ResourceType,
                            Post = post
                        });
                    }
                }
            }

            await uow.Posts.CreateAsync(post);
            await uow.CompleteAsync();
            return new Response<PostDto> { Success = true, Data = mapper.Map<PostDto>(post), Message = "Post created." };
        }

        public async Task<Response<CommentDto>> CommentAsync(Guid userId, Guid postId, CreateCommentDto dto, IFormFileCollection? mediaFiles)
        {
            var post = await uow.Posts.GetByIdAsync(postId);
            if (post == null) return new Response<CommentDto> { Success = false, Message = "Post not found." };

            dto.PostId = postId;
            dto.UserId = userId;
            var comment = mapper.Map<Comment>(dto);
            comment.Media = new List<CommentMedia>();

            if (mediaFiles != null && mediaFiles.Any())
            {
                foreach (var file in mediaFiles)
                {
                    var uploadResult = await mediaService.UploadMediaAsync(file);
                    if (uploadResult != null)
                    {
                        comment.Media.Add(new CommentMedia
                        {
                            MediaUrl = uploadResult.Url,
                            PublicId = uploadResult.PublicId,
                            ResourceType = uploadResult.ResourceType,
                            Comment = comment
                        });
                    }
                }
            }

            await uow.Comments.CreateAsync(comment);
            await uow.CompleteAsync();
            return new Response<CommentDto> { Success = true, Data = mapper.Map<CommentDto>(comment), Message = "Comment posted." };
        }

        public async Task<Response<ReactionDto>> ReactAsync(Guid userId, Guid postId, CreateReactionDto dto)
        {
            var post = await uow.Posts.GetByIdAsync(postId);
            if (post == null) return new Response<ReactionDto> { Success = false, Message = "Post not found." };

            // Toggle: remove existing reaction of the same type from same user
            var existing = (await uow.Reactions.FindAsync(r => r.PostId == postId && r.UserId == userId && r.Type == dto.Type)).FirstOrDefault();
            if (existing != null)
            {
                uow.Reactions.HardDelete(existing);
                await uow.CompleteAsync();
                return new Response<ReactionDto> { Success = true, Message = $"{dto.Type} removed." };
            }

            dto.PostId = postId;
            dto.UserId = userId;
            var reaction = mapper.Map<Reaction>(dto);
            await uow.Reactions.CreateAsync(reaction);
            await uow.CompleteAsync();
            return new Response<ReactionDto> { Success = true, Data = mapper.Map<ReactionDto>(reaction), Message = $"{dto.Type} added." };
        }

        public async Task<Response<PostDto>> GetPostByIdAsync(Guid postId)
        {
            var post = await uow.Posts.GetByIdAsync(postId);
            if (post == null) return new Response<PostDto> { Success = false, Message = "Post not found." };
            return new Response<PostDto> { Success = true, Data = mapper.Map<PostDto>(post) };
        }

        public async Task<Response<PostDto>> UpdatePostAsync(Guid postId, Guid requesterId, UpdatePostDto dto)
        {
            var post = await uow.Posts.GetByIdAsync(postId);
            if (post == null) return new Response<PostDto> { Success = false, Message = "Post not found." };
            if (post.UserId != requesterId) return new Response<PostDto> { Success = false, Message = "Unauthorized." };
            
            if (!string.IsNullOrEmpty(dto.Title)) post.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Content)) post.Content = dto.Content;
            
            uow.Posts.Update(post);
            await uow.CompleteAsync();
            return new Response<PostDto> { Success = true, Data = mapper.Map<PostDto>(post), Message = "Post updated." };
        }

        public async Task<Response<string>> DeletePostAsync(Guid postId, Guid requesterId)
        {
            var post = await uow.Posts.GetByIdAsync(postId);
            if (post == null) return new Response<string> { Success = false, Message = "Post not found." };
            if (post.UserId != requesterId) return new Response<string> { Success = false, Message = "You can only delete your own posts." };

            await uow.Posts.SoftDeleteAsync(postId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Post deleted." };
        }

        public async Task<Response<IEnumerable<CommentDto>>> GetPostCommentsAsync(Guid postId)
        {
            var comments = await uow.Comments.FindAsync(c => c.PostId == postId);
            return new Response<IEnumerable<CommentDto>> { Success = true, Data = mapper.Map<IEnumerable<CommentDto>>(comments) };
        }

        public async Task<Response<CommentDto>> UpdateCommentAsync(Guid commentId, Guid requesterId, UpdateCommentDto dto)
        {
            var comment = await uow.Comments.GetByIdAsync(commentId);
            if (comment == null) return new Response<CommentDto> { Success = false, Message = "Comment not found." };
            if (comment.UserId != requesterId) return new Response<CommentDto> { Success = false, Message = "Unauthorized." };
            
            if (!string.IsNullOrEmpty(dto.Content)) comment.Content = dto.Content;
            uow.Comments.Update(comment);
            await uow.CompleteAsync();
            return new Response<CommentDto> { Success = true, Data = mapper.Map<CommentDto>(comment), Message = "Comment updated." };
        }

        public async Task<Response<string>> DeleteCommentAsync(Guid commentId, Guid requesterId)
        {
            var comment = await uow.Comments.GetByIdAsync(commentId);
            if (comment == null) return new Response<string> { Success = false, Message = "Comment not found." };
            if (comment.UserId != requesterId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.Comments.SoftDeleteAsync(commentId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Comment deleted." };
        }

        public async Task<Response<IEnumerable<ReactionDto>>> GetCommentReactionsAsync(Guid commentId)
        {
            var reactions = await uow.Reactions.FindAsync(r => r.CommentId == commentId);
            return new Response<IEnumerable<ReactionDto>> { Success = true, Data = mapper.Map<IEnumerable<ReactionDto>>(reactions) };
        }

        public async Task<Response<ReactionDto>> ReactToCommentAsync(Guid userId, Guid commentId, CreateReactionDto dto)
        {
            var comment = await uow.Comments.GetByIdAsync(commentId);
            if (comment == null) return new Response<ReactionDto> { Success = false, Message = "Comment not found." };

            var existing = (await uow.Reactions.FindAsync(r => r.CommentId == commentId && r.UserId == userId && r.Type == dto.Type)).FirstOrDefault();
            if (existing != null)
            {
                uow.Reactions.HardDelete(existing);
                await uow.CompleteAsync();
                return new Response<ReactionDto> { Success = true, Message = $"{dto.Type} removed." };
            }

            var reaction = mapper.Map<Reaction>(dto);
            reaction.CommentId = commentId;
            reaction.UserId = userId;
            await uow.Reactions.CreateAsync(reaction);
            await uow.CompleteAsync();
            return new Response<ReactionDto> { Success = true, Data = mapper.Map<ReactionDto>(reaction), Message = $"{dto.Type} added to comment." };
        }

        public async Task<Response<string>> RequestConnectionAsync(Guid requesterId, Guid addresseeId)
        {
            if (requesterId == addresseeId)
                return new Response<string> { Success = false, Message = "You cannot connect with yourself." };

            // Check both directions for an existing connection
            var existingConnections = await uow.Connections.FindAsync(c =>
                (c.RequesterId == requesterId && c.AddresseeId == addresseeId) ||
                (c.RequesterId == addresseeId && c.AddresseeId == requesterId));
            if (existingConnections.Any())
                return new Response<string> { Success = false, Message = "A connection between these users already exists." };

            var conn = new Connection { RequesterId = requesterId, AddresseeId = addresseeId, Status = ConnectionStatus.Pending };
            await uow.Connections.CreateAsync(conn);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Connection request sent." };
        }

        public async Task<Response<string>> RespondConnectionAsync(Guid connectionId, Guid userId, ConnectionStatus status)
        {
            var conn = await uow.Connections.GetByIdAsync(connectionId);
            if (conn == null) return new Response<string> { Success = false, Message = "Connection request not found." };
            if (conn.AddresseeId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };
            if (conn.Status != ConnectionStatus.Pending)
                return new Response<string> { Success = false, Message = "Connection request is no longer pending." };

            conn.Status = status;
            uow.Connections.Update(conn);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = $"Connection {status}." };
        }

        public async Task<Response<IEnumerable<ConnectionDto>>> GetConnectionsAsync(Guid userId)
        {
            var userConns = await uow.Connections.FindAsync(c => (c.RequesterId == userId || c.AddresseeId == userId) && c.Status == ConnectionStatus.Accepted);
            return new Response<IEnumerable<ConnectionDto>> { Success = true, Data = mapper.Map<IEnumerable<ConnectionDto>>(userConns) };
        }

        public async Task<Response<IEnumerable<ConnectionDto>>> GetPendingConnectionsAsync(Guid userId)
        {
            var pending = await uow.Connections.FindAsync(c => c.AddresseeId == userId && c.Status == ConnectionStatus.Pending);
            return new Response<IEnumerable<ConnectionDto>> { Success = true, Data = mapper.Map<IEnumerable<ConnectionDto>>(pending) };
        }

        public async Task<Response<string>> DeleteConnectionAsync(Guid connectionId, Guid userId)
        {
            var conn = await uow.Connections.GetByIdAsync(connectionId);
            if (conn == null) return new Response<string> { Success = false, Message = "Not found." };
            if (conn.RequesterId != userId && conn.AddresseeId != userId)
                return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.Connections.SoftDeleteAsync(connectionId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Connection removed." };
        }
    }
}
