using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FutureConnection.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExpandDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("64f092bb-5afe-4a03-bd60-203016728f06"));

            migrationBuilder.DeleteData(
                table: "FAQs",
                keyColumn: "Id",
                keyValue: new Guid("92832b31-72d0-41a0-baa0-1024ae653297"));

            migrationBuilder.CreateTable(
                name: "AnswerMedia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PublicId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnswerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnswerMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnswerMedia_Answers_AnswerId",
                        column: x => x.AnswerId,
                        principalTable: "Answers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionMedia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PublicId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionMedia_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_AnswerMedia_AnswerId",
                table: "AnswerMedia",
                column: "AnswerId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionMedia_QuestionId",
                table: "QuestionMedia",
                column: "QuestionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnswerMedia");

            migrationBuilder.DropTable(
                name: "QuestionMedia");

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
                    { new Guid("64f092bb-5afe-4a03-bd60-203016728f06"), "It uses high-frequency analysis.", "General", new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7798), 2, true, false, "What is the Smart Matching algorithm?", new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7799) },
                    { new Guid("92832b31-72d0-41a0-baa0-1024ae653297"), "Use multi-factor authentication.", "Security", new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7788), 1, true, false, "How do I secure my neural link?", new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7789) }
                });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7738), new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7738) });

            migrationBuilder.UpdateData(
                table: "Policies",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7748), new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7748) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("a78b3f5c-1e9d-4c62-bb74-92a3d1e4f8c1"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7571), new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7572) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7578), new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7579) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7583), new DateTime(2026, 3, 22, 19, 29, 51, 525, DateTimeKind.Utc).AddTicks(7583) });
        }
    }
}
