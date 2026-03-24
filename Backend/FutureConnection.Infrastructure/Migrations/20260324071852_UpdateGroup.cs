using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FutureConnection.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("2aacfaf6-2320-46c7-a375-c87a221c7b2f"));

            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("6ec4bce5-cdd9-4d67-bad4-e8da4421868f"));

            migrationBuilder.AddColumn<bool>(
                name: "IsPrivate",
                table: "Groups",
                type: "bit",
                nullable: false,
                defaultValue: false);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("139b686a-d8f6-410f-9a96-dbef32cc7754"));

            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("e5461b9f-e5ae-4190-9218-3e3dcefa4bbc"));

            migrationBuilder.DropColumn(
                name: "IsPrivate",
                table: "Groups");

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
    }
}
