using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FutureConnection.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixDecimalPrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("5d0615f1-c077-4f50-850e-4dd4bbc5dbd4"));

            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("6d2f48a3-1602-4717-bf29-7ccb7aaf7be6"));

            migrationBuilder.InsertData(
                table: "FAQs",
                columns: new[] { "Id", "Answer", "Category", "CreatedAt", "DisplayOrder", "IsActive", "IsDeleted", "Question", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("2aacfaf6-2320-46c7-a375-c87a221c7b2f"), "Use multi-factor authentication.", "Security", new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1795), 1, true, false, "How do I secure my neural link?", new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1795) },
                    { new Guid("6ec4bce5-cdd9-4d67-bad4-e8da4421868f"), "It uses high-frequency analysis.", "General", new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1806), 2, true, false, "What is the Smart Matching algorithm?", new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1806) }
                });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1756), new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1757) });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1765), new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1765) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a78b3f5c-1e9d-4c62-bb74-92a3d1e4f8c1"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1574), new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1575) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1584), new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1584) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1589), new DateTime(2026, 3, 24, 6, 44, 9, 162, DateTimeKind.Utc).AddTicks(1589) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("2aacfaf6-2320-46c7-a375-c87a221c7b2f"));

            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("6ec4bce5-cdd9-4d67-bad4-e8da4421868f"));

            migrationBuilder.InsertData(
                table: "FAQs",
                columns: new[] { "Id", "Answer", "Category", "CreatedAt", "DisplayOrder", "IsActive", "IsDeleted", "Question", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("5d0615f1-c077-4f50-850e-4dd4bbc5dbd4"), "It uses high-frequency analysis.", "General", new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(9188), 2, true, false, "What is the Smart Matching algorithm?", new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(9188) },
                    { new Guid("6d2f48a3-1602-4717-bf29-7ccb7aaf7be6"), "Use multi-factor authentication.", "Security", new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(9177), 1, true, false, "How do I secure my neural link?", new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(9178) }
                });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(9134), new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(9134) });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(9142), new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(9142) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a78b3f5c-1e9d-4c62-bb74-92a3d1e4f8c1"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(8977), new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(8977) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(8984), new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(8985) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(8989), new DateTime(2026, 3, 24, 6, 34, 16, 946, DateTimeKind.Utc).AddTicks(8989) });
        }
    }
}
