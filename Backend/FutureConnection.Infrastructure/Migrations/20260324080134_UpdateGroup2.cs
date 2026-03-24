using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FutureConnection.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGroup2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("139b686a-d8f6-410f-9a96-dbef32cc7754"));

            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("e5461b9f-e5ae-4190-9218-3e3dcefa4bbc"));

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerId",
                table: "Groups",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.InsertData(
                table: "FAQs",
                columns: new[] { "Id", "Answer", "Category", "CreatedAt", "DisplayOrder", "IsActive", "IsDeleted", "Question", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("d6cb4d23-f9be-412f-bfa5-a15876205d98"), "Use multi-factor authentication.", "Security", new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5371), 1, true, false, "How do I secure my neural link?", new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5371) },
                    { new Guid("f23a986e-d59b-4495-9101-b17e38413f8a"), "It uses high-frequency analysis.", "General", new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5382), 2, true, false, "What is the Smart Matching algorithm?", new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5382) }
                });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5334), new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5334) });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5341), new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5341) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a78b3f5c-1e9d-4c62-bb74-92a3d1e4f8c1"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5200), new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5201) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5208), new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5208) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5212), new DateTime(2026, 3, 24, 8, 1, 33, 501, DateTimeKind.Utc).AddTicks(5212) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("d6cb4d23-f9be-412f-bfa5-a15876205d98"));

            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("f23a986e-d59b-4495-9101-b17e38413f8a"));

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Groups");

            migrationBuilder.InsertData(
                table: "FAQs",
                columns: new[] { "Id", "Answer", "Category", "CreatedAt", "DisplayOrder", "IsActive", "IsDeleted", "Question", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("139b686a-d8f6-410f-9a96-dbef32cc7754"), "Use multi-factor authentication.", "Security", new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1674), 1, true, false, "How do I secure my neural link?", new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1675) },
                    { new Guid("e5461b9f-e5ae-4190-9218-3e3dcefa4bbc"), "It uses high-frequency analysis.", "General", new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1697), 2, true, false, "What is the Smart Matching algorithm?", new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1698) }
                });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1582), new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1583) });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1600), new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1601) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a78b3f5c-1e9d-4c62-bb74-92a3d1e4f8c1"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1194), new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1195) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1211), new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1211) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1222), new DateTime(2026, 3, 24, 7, 18, 51, 459, DateTimeKind.Utc).AddTicks(1222) });
        }
    }
}
