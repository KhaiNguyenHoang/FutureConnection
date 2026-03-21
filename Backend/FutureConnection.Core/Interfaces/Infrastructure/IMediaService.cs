using FutureConnection.Core.DTOs;
using Microsoft.AspNetCore.Http;

namespace FutureConnection.Core.Interfaces.Infrastructure
{
    public interface IMediaService
    {
        Task<MediaUploadResult?> UploadMediaAsync(IFormFile file);
        Task<bool> DeleteMediaAsync(string publicId, string resourceType = "image");
    }
}
