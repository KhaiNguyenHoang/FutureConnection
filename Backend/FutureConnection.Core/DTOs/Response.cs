namespace FutureConnection.Core.DTOs
{
    public class Response<T>
    {
        public T? Data { get; set; }
        public string? Message { get; set; }
        public bool Success { get; set; }
    }
}
