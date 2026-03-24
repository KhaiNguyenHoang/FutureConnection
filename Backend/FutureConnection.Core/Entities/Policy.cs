using System;

namespace FutureConnection.Core.Entities
{
    public class Policy : BaseEntity
    {
        public required string Title { get; set; }
        public required string Type { get; set; } // privacy, terms
        public required string Content { get; set; } // Markdown or HTML
        public required string Version { get; set; }
    }
}
