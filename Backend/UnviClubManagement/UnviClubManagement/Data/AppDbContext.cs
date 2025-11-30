using Microsoft.EntityFrameworkCore;
using UnviClubManagement.Data.Models;

namespace UnviClubManagement.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Club> Clubs { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<ClubMember> ClubMembers { get; set; }
        public DbSet<EventMember> EventMembers { get; set; }
        public DbSet<ClubUpdate> ClubUpdates { get; set; }
        public DbSet<EventUpdate> EventUpdates { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ClubMember>().HasKey(c => new {c.UserID, c.ClubID});
            modelBuilder.Entity<EventMember>().HasKey(e => new {e.UserID, e.EventID});
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Club>().Property(c => c.CreatedAt).HasDefaultValueSql("GETDATE()");
            modelBuilder.Entity<Event>().Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<ClubMember>()
                .HasOne(cm => cm.User)
                .WithMany(u => u.JoinedClubs) // or WithMany(u => u.ClubMembers)
                .HasForeignKey(cm => cm.UserID)
                .OnDelete(DeleteBehavior.Cascade); // No cascade

            modelBuilder.Entity<ClubMember>()
                .HasOne(cm => cm.Club)
                .WithMany(c => c.Members) // or WithMany(c => c.Members)
                .HasForeignKey(cm => cm.ClubID)
                .OnDelete(DeleteBehavior.Restrict); // No cascade

            modelBuilder.Entity<EventMember>()
                .HasOne(cm => cm.User)
                .WithMany(u => u.JoinedEvents) // or WithMany(u => u.ClubMembers)
                .HasForeignKey(cm => cm.UserID)
                .OnDelete(DeleteBehavior.Cascade); // No cascade

            modelBuilder.Entity<EventMember>()
                .HasOne(cm => cm.Event)
                .WithMany(e => e.Members) // or WithMany(c => c.Members)
                .HasForeignKey(cm => cm.EventID)
                .OnDelete(DeleteBehavior.Restrict); // No cascade

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, RoleName = "Admin" },
                new Role { Id = 2, RoleName = "ClubLeader" },
                new Role { Id = 3, RoleName = "Student" }
                );

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    UserName = "Admin",
                    Password = "Admin123",
                    Email = "Admin@gmail.com",
                    Phone = "123456789",   
                    RoleID = 1,
                }
                );
        }
    }
}
