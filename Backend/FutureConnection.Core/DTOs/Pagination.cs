namespace FutureConnection.Core.DTOs
{
    /// <summary>
    /// Standardized query parameters for paginated requests.
    /// </summary>
    public class PagedRequest
    {
        private int _page = 1;
        private int _pageSize = 20;

        public int Page
        {
            get => _page;
            set => _page = value < 1 ? 1 : value;
        }

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 1 : value > 100 ? 100 : value;
        }

        public string? Keyword { get; set; }
    }

    /// <summary>
    /// Standardized paginated response wrapper enriched with page metadata.
    /// </summary>
    public class PagedResponse<T>
    {
        public IEnumerable<T> Data { get; set; } = Enumerable.Empty<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
        public bool Success { get; set; } = true;
        public string? Message { get; set; }

        public static PagedResponse<T> Create(IEnumerable<T> source, int page, int pageSize)
        {
            var list = source.ToList();
            var paged = list
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagedResponse<T>
            {
                Data = paged,
                Page = page,
                PageSize = pageSize,
                TotalCount = list.Count
            };
        }
    }
}
