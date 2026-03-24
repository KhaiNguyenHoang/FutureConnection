using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Infrastructure.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FutureConnection.Infrastructure.Services
{
    public class CloudinaryService : IMediaService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryService> _logger;

        public CloudinaryService(IOptions<CloudinarySettings> config, ILogger<CloudinaryService> logger)
        {
            _logger = logger;
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<MediaUploadResult?> UploadMediaAsync(IFormFile file)
        {
            if (file.Length == 0) return null;

            await using var stream = file.OpenReadStream();
            // Auto detection of resource type (image vs video)
            // Or we check content type
            bool isVideo = file.ContentType.StartsWith("video/");

            if (isVideo)
            {
                var uploadParams = new VideoUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "FutureConnection/Videos"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                {
                    _logger.LogError("Failed to upload video to Cloudinary: {Error}", uploadResult.Error.Message);
                    return null;
                }

                return new MediaUploadResult
                {
                    Url = uploadResult.SecureUrl.ToString(),
                    PublicId = uploadResult.PublicId,
                    ResourceType = "video"
                };
            }
            else
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "FutureConnection/Images",
                    // Optional: keep it original size or transform
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                {
                    _logger.LogError("Failed to upload image to Cloudinary: {Error}", uploadResult.Error.Message);
                    return null;
                }

                return new MediaUploadResult
                {
                    Url = uploadResult.SecureUrl.ToString(),
                    PublicId = uploadResult.PublicId,
                    ResourceType = "image"
                };
            }
        }

        public async Task<bool> DeleteMediaAsync(string publicId, string resourceType = "image")
        {
            var deleteParams = new DeletionParams(publicId)
            {
                ResourceType = resourceType == "video" ? ResourceType.Video : ResourceType.Image
            };
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }
    }
}
