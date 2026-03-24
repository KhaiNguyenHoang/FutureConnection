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
        public async Task<PagedResponse<PostDto>> GetFeedAsync(Guid? userId, Guid? viewerId, PagedRequest request)
        {
            try
            {
                var posts = userId.HasValue
                    ? await uow.Posts.GetPostsWithDetailsAsync(p => p.UserId == userId.Value && !p.IsDeleted)
                    : await uow.Posts.GetPostsWithDetailsAsync(p => !p.IsDeleted);

                var filtered = string.IsNullOrEmpty(request.Keyword)
                    ? posts
                    : posts.Where(p => (p.Title != null && p.Title.Contains(request.Keyword, StringComparison.OrdinalIgnoreCase))
                                    || (p.Content != null && p.Content.Contains(request.Keyword, StringComparison.OrdinalIgnoreCase)));

                var dtos = mapper.Map<IEnumerable<PostDto>>(filtered).ToList();

                // If viewerId is provided, check if the user has reacted to each post
                if (viewerId.HasValue && viewerId.Value != Guid.Empty)
                {
                    Console.WriteLine($"[SocialService] Processing reactions for viewer: {viewerId.Value}");
                    foreach (var dto in dtos)
                    {
                        var post = filtered.FirstOrDefault(p => p.Id == dto.Id);
                        if (post != null)
                        {
                            if (post.Reactions == null)
                            {
                                Console.WriteLine($"[SocialService] WARNING: Post {post.Id} Reactions collection is null!");
                                dto.UserHasReacted = false;
                            }
                            else
                            {
                                dto.UserHasReacted = post.Reactions.Any(r => r.UserId == viewerId.Value);
                            }
                        }
                    }
                }

                var totalCount = dtos.Count;
                var pagedData = dtos
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                Console.WriteLine($"[SocialService] GetFeedAsync success: returned {pagedData.Count}/{totalCount} items");
                return new PagedResponse<PostDto>
                {
                    Data = pagedData,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SocialService] EXCEPTION in GetFeedAsync: {ex.GetType().Name} - {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[Inner Exception]: {ex.InnerException.Message}");
                }
                Console.WriteLine(ex.StackTrace);
                throw;
            }
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

            Console.WriteLine($"[SocialService] CreatePostAsync: User {userId}");
            
            try
            {
                await uow.BeginTransactionAsync();

                await uow.Posts.CreateAsync(post);
                await uow.CompleteAsync();

                if (dto.Tags != null && dto.Tags.Any())
                {
                    post.PostTags = new List<PostTag>();
                    foreach (var tagName in dto.Tags.Where(t => !string.IsNullOrWhiteSpace(t)).Select(t => t.Trim()))
                    {
                        var tag = (await uow.Tags.FindAsync(t => t.Name.ToLower() == tagName.ToLower())).FirstOrDefault();
                        if (tag == null)
                        {
                            tag = new Tag { Name = tagName };
                            await uow.Tags.CreateAsync(tag);
                            await uow.CompleteAsync();
                        }

                        post.PostTags.Add(new PostTag
                        {
                            PostId = post.Id,
                            TagId = tag.Id
                        });
                    }
                    await uow.CompleteAsync();
                }

                await uow.CommitTransactionAsync();
                Console.WriteLine($"[SocialService] Post saved successfully: ID {post.Id} with {dto.Tags?.Count ?? 0} tags.");
            }
            catch (Exception ex)
            {
                await uow.RollbackTransactionAsync();
                Console.WriteLine($"[SocialService] ERROR saving post: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"[Inner Exception]: {ex.InnerException.Message}");
                throw;
            }

            // Refresh post with full details (Author, Media, etc.)
            var savedPost = await uow.Posts.GetPostWithDetailsByIdAsync(post.Id);
            return new Response<PostDto> { Success = true, Data = mapper.Map<PostDto>(savedPost), Message = "Post created." };
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

            Console.WriteLine($"[SocialService] CommentAsync: User {userId} on Post {postId}");
            try
            {
                await uow.Comments.CreateAsync(comment);
                await uow.CompleteAsync();
                Console.WriteLine($"[SocialService] Comment saved successfully: ID {comment.Id}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SocialService] ERROR saving comment: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"[Inner Exception]: {ex.InnerException.Message}");
                throw;
            }

            // Refresh comment with full details (Author, etc.)
            // Assuming there is a method for this, otherwise we use Find
            var savedComment = (await uow.Comments.GetCommentsWithDetailsByPostIdAsync(postId))
                                .FirstOrDefault(c => c.Id == comment.Id);
            return new Response<CommentDto> { Success = true, Data = mapper.Map<CommentDto>(savedComment), Message = "Comment posted." };
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
            var post = await uow.Posts.GetPostWithDetailsByIdAsync(postId);
            if (post == null) return new Response<PostDto> { Success = false, Message = "Post not found." };
            return new Response<PostDto> { Success = true, Data = mapper.Map<PostDto>(post) };
        }

        public async Task<Response<PostDto>> UpdatePostAsync(Guid postId, Guid requesterId, UpdatePostDto dto)
        {
            var post = await uow.Posts.GetPostWithDetailsByIdAsync(postId);
            if (post == null) return new Response<PostDto> { Success = false, Message = "Post not found." };
            if (post.UserId != requesterId) return new Response<PostDto> { Success = false, Message = "Unauthorized." };
            
            try
            {
                await uow.BeginTransactionAsync();

                if (!string.IsNullOrEmpty(dto.Title)) post.Title = dto.Title;
                if (!string.IsNullOrEmpty(dto.Content)) post.Content = dto.Content;
                
                if (dto.Tags != null)
                {
                    post.PostTags ??= new List<PostTag>();
                    post.PostTags.Clear();
                    
                    foreach (var tagName in dto.Tags.Where(t => !string.IsNullOrWhiteSpace(t)).Select(t => t.Trim()))
                    {
                        var tag = (await uow.Tags.FindAsync(t => t.Name.ToLower() == tagName.ToLower())).FirstOrDefault();
                        if (tag == null)
                        {
                            tag = new Tag { Name = tagName };
                            await uow.Tags.CreateAsync(tag);
                            await uow.CompleteAsync();
                        }

                        post.PostTags.Add(new PostTag
                        {
                            PostId = post.Id,
                            TagId = tag.Id
                        });
                    }
                    await uow.CompleteAsync();
                }

                uow.Posts.Update(post);
                await uow.CompleteAsync();
                await uow.CommitTransactionAsync();

                // Refresh to get full details
                var updatedPost = await uow.Posts.GetPostWithDetailsByIdAsync(postId);
                return new Response<PostDto> { Success = true, Data = mapper.Map<PostDto>(updatedPost), Message = "Post updated." };
            }
            catch (Exception ex)
            {
                await uow.RollbackTransactionAsync();
                Console.WriteLine($"[SocialService] ERROR updating post: {ex.Message}");
                throw;
            }
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
            var comments = await uow.Comments.GetCommentsWithDetailsByPostIdAsync(postId);
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

        public async Task<Response<IEnumerable<TopContributorDto>>> GetTopContributorsAsync(int top = 5)
        {
            var reputations = await uow.Reputations.FindAsync(r => !r.IsDeleted);

            var reputationGroups = reputations.GroupBy(r => r.UserId)
                                             .Select(g => new { UserId = g.Key, TotalPoints = g.Sum(r => r.Points) })
                                             .OrderByDescending(x => x.TotalPoints)
                                             .Take(top)
                                             .ToList();

            var topUserIds = reputationGroups.Select(g => g.UserId).ToList();
            var users = await uow.Users.FindAsync(u => topUserIds.Contains(u.Id));

            var results = reputationGroups.Select(rg => {
                var u = users.FirstOrDefault(user => user.Id == rg.UserId);
                return new TopContributorDto
                {
                    UserId = rg.UserId,
                    FirstName = u?.FirstName ?? "Unknown",
                    LastName = u?.LastName ?? "",
                    AvatarUrl = u?.AvatarUrl,
                    BadgeCount = rg.TotalPoints // Mapping reputation points to BadgeCount for compatibility
                };
            });

            return new Response<IEnumerable<TopContributorDto>> { Success = true, Data = results };
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

        public async Task<Response<TicketResponseDto>> CreateTicketAsync(Guid userId, CreateTicketDto dto)
        {
            var ticket = mapper.Map<SupportTicket>(dto);
            ticket.UserId = userId;
            await uow.SupportTickets.CreateAsync(ticket);
            await uow.CompleteAsync();
            return new Response<TicketResponseDto> { Success = true, Data = mapper.Map<TicketResponseDto>(ticket), Message = "Ticket created." };
        }

        public async Task<Response<IEnumerable<PolicyResponseDto>>> GetPoliciesAsync()
        {
            var policies = await uow.Policies.FindAsync(p => !p.IsDeleted);
            return new Response<IEnumerable<PolicyResponseDto>> { Success = true, Data = mapper.Map<IEnumerable<PolicyResponseDto>>(policies) };
        }

        public async Task<Response<IEnumerable<FAQResponseDto>>> GetFAQsAsync()
        {
            var faqs = await uow.FAQs.FindAsync(f => !f.IsDeleted);
            return new Response<IEnumerable<FAQResponseDto>> { Success = true, Data = mapper.Map<IEnumerable<FAQResponseDto>>(faqs.OrderBy(f => f.DisplayOrder)) };
        }

        public async Task<Response<IEnumerable<TicketResponseDto>>> GetMyTicketsAsync(Guid userId)
        {
            var tickets = await uow.SupportTickets.FindAsync(t => t.UserId == userId);
            return new Response<IEnumerable<TicketResponseDto>> { Success = true, Data = mapper.Map<IEnumerable<TicketResponseDto>>(tickets.OrderByDescending(t => t.CreatedAt)) };
        }

        public async Task<Response<TicketResponseDto>> GetTicketByIdAsync(Guid userId, Guid ticketId)
        {
            var ticket = await uow.SupportTickets.GetByIdAsync(ticketId);
            if (ticket == null || ticket.UserId != userId)
                return new Response<TicketResponseDto> { Success = false, Message = "Ticket not found." };
            return new Response<TicketResponseDto> { Success = true, Data = mapper.Map<TicketResponseDto>(ticket) };
        }
    }
}
