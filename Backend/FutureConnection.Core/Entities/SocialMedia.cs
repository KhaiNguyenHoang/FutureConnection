namespace FutureConnection.Core.Entities
{
    public class SocialMedia : BaseEntity
    {
        public string? LinkedInUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? YoutubeUrl { get; set; }
        public string? GithubUrl { get; set; }
    }
}
