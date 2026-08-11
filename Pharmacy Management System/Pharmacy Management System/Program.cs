using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace Pharmacy_Management_System
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 1. Define CORS Policy Name
            var allowAllOrigins = "_allowAllOrigins";

            // Add services to the container.
            builder.Services.AddDbContext<ProjectContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // 2. Register CORS Service
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(name: allowAllOrigins,
                    policy =>
                    {
                        policy.AllowAnyOrigin()
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                    });
            });

            builder.Services.AddControllers(options =>
            {
                options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your JWT token in the box below"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id   = "Bearer"
                            }
                        },
                        new List<string>()
                    }
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // 3. Enable CORS Middleware (Must be before UseAuthorization)
            app.UseCors(allowAllOrigins);

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}