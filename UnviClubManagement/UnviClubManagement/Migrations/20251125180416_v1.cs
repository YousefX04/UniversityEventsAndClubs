using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UnviClubManagement.Migrations
{
    /// <inheritdoc />
    public partial class v1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClubUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    OldName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClubUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClubUpdates_Clubs_Id",
                        column: x => x.Id,
                        principalTable: "Clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    OldName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldStart = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NewStart = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OldEnd = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NewEnd = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OldDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventUpdates_Events_Id",
                        column: x => x.Id,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClubUpdates");

            migrationBuilder.DropTable(
                name: "EventUpdates");
        }
    }
}
