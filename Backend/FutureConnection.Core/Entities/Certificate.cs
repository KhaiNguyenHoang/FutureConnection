namespace FutureConnection.Core.Entities
{
    public class Certificate : BaseEntity
    {
        public required string Name { get; set; }
        public string? IssuingOrganization { get; set; }
        public string? CertificateUrl { get; set; }
        public string? CredentialId { get; set; }
        public DateTime? DateIssued { get; set; }
        public DateTime? ExpiredAt { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
    }
}
