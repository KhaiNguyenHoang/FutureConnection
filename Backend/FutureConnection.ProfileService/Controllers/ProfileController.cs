using FutureConnection.Core.DTOs;
using FutureConnection.Core.Utils;
using FutureConnection.ProfileService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.ProfileService.Controllers
{
    [ApiController]
    [Route("api/profiles")]
    [Authorize]
    public class ProfileController(IProfileService profileService) : ControllerBase
    {
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProfile(Guid id)
        {
            var result = await profileService.GetProfileAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateUserDto dto)
        {
            if (id != User.GetUserId()) return Forbid();
            var result = await profileService.UpdateProfileAsync(id, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("{userId:guid}/cvs")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCvs(Guid userId)
            => Ok(await profileService.GetCvsAsync(userId));

        [HttpPost("{userId:guid}/cvs")]
        public async Task<IActionResult> AddCv(Guid userId, [FromBody] CreateCVDto dto)
        {
            if (userId != User.GetUserId()) return Forbid();
            var result = await profileService.AddCvAsync(userId, dto);
            return Ok(result);
        }

        [HttpDelete("cvs/{cvId:guid}")]
        public async Task<IActionResult> DeleteCv(Guid cvId)
            => Ok(await profileService.DeleteCvAsync(User.GetUserId(), cvId));

        [HttpGet("{userId:guid}/certificates")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCertificates(Guid userId)
            => Ok(await profileService.GetCertificatesAsync(userId));

        [HttpPost("{userId:guid}/certificates")]
        public async Task<IActionResult> AddCertificate(Guid userId, [FromBody] CreateCertificateDto dto)
        {
            if (userId != User.GetUserId()) return Forbid();
            return Ok(await profileService.AddCertificateAsync(userId, dto));
        }

        [HttpDelete("certificates/{certId:guid}")]
        public async Task<IActionResult> DeleteCertificate(Guid certId)
            => Ok(await profileService.DeleteCertificateAsync(User.GetUserId(), certId));

        [HttpGet("{userId:guid}/projects")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProjects(Guid userId)
            => Ok(await profileService.GetProjectsAsync(userId));

        [HttpPost("{userId:guid}/projects")]
        public async Task<IActionResult> AddProject(Guid userId, [FromBody] CreatePersonalProjectDto dto)
        {
            if (userId != User.GetUserId()) return Forbid();
            return Ok(await profileService.AddProjectAsync(userId, dto));
        }

        [HttpGet("{userId:guid}/social-media")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSocialMedia(Guid userId)
        {
            var result = await profileService.GetSocialMediaAsync(userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost("{userId:guid}/social-media")]
        public async Task<IActionResult> AddSocialMedia(Guid userId, [FromBody] CreateSocialMediaDto dto)
        {
            if (userId != User.GetUserId()) return Forbid();
            return Ok(await profileService.AddSocialMediaAsync(userId, dto));
        }

        [HttpPost("{userId:guid}/endorsements")]
        public async Task<IActionResult> AddEndorsement(Guid userId, [FromBody] CreateEndorsementDto dto)
        {
            // Endorsement is from current user to userId
            var result = await profileService.AddEndorsementAsync(userId, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("certificates/{certId:guid}")]
        public async Task<IActionResult> UpdateCertificate(Guid certId, [FromBody] UpdateCertificateDto dto)
        {
            var result = await profileService.UpdateCertificateAsync(User.GetUserId(), certId, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("projects/{projectId:guid}")]
        public async Task<IActionResult> UpdateProject(Guid projectId, [FromBody] UpdatePersonalProjectDto dto)
        {
            var result = await profileService.UpdateProjectAsync(User.GetUserId(), projectId, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpDelete("projects/{projectId:guid}")]
        public async Task<IActionResult> DeleteProject(Guid projectId)
            => Ok(await profileService.DeleteProjectAsync(User.GetUserId(), projectId));

        [HttpPut("social-media/{socialMediaId:guid}")]
        public async Task<IActionResult> UpdateSocialMedia(Guid socialMediaId, [FromBody] UpdateSocialMediaDto dto)
        {
            var result = await profileService.UpdateSocialMediaAsync(User.GetUserId(), socialMediaId, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("{userId:guid}/endorsements")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEndorsements(Guid userId)
            => Ok(await profileService.GetEndorsementsAsync(userId));

        [HttpGet("{userId:guid}/open-source")]
        [AllowAnonymous]
        public async Task<IActionResult> GetOpenSources(Guid userId)
            => Ok(await profileService.GetOpenSourcesAsync(userId));

        [HttpPost("{userId:guid}/open-source")]
        public async Task<IActionResult> AddOpenSource(Guid userId, [FromBody] CreateOpenSourceContributionDto dto)
        {
            if (userId != User.GetUserId()) return Forbid();
            return Ok(await profileService.AddOpenSourceAsync(userId, dto));
        }

        [HttpDelete("open-source/{openSourceId:guid}")]
        public async Task<IActionResult> DeleteOpenSource(Guid openSourceId)
            => Ok(await profileService.DeleteOpenSourceAsync(User.GetUserId(), openSourceId));
    }
}
