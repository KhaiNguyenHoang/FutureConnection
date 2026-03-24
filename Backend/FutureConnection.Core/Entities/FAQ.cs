using System;

namespace FutureConnection.Core.Entities
{
    public class FAQ : BaseEntity
    {
        public required string Question { get; set; }
        public required string Answer { get; set; }
        public required string Category { get; set; } // e.g., Profile, Billing, Security
        public int DisplayOrder { get; set; }
    }
}
