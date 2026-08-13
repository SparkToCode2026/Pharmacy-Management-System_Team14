# Pharmacy Management System

## 📌 Project Overview

The **Pharmacy Management System** is a full-stack application developed as part of the **Spark to Code 2026 Final Capstone Project**.

The system provides a centralized platform for managing pharmacy operations, including medicines, suppliers, manufacturers, prescriptions, customers, orders, payments, stock, and pharmacy branches.

The main goal is to organize pharmacy data, reduce manual work, improve accuracy, and provide secure access to essential pharmacy operations.

---

## 💡 Business Idea

Pharmacies manage large amounts of information related to medicines, customers, suppliers, prescriptions, orders, and stock.

Managing this information manually can lead to:

- Incorrect stock information
- Difficulties tracking customer orders
- Disorganized supplier and manufacturer records
- Prescription management issues
- Data entry errors
- Limited visibility of pharmacy operations

This system provides a centralized solution for managing these activities while keeping the data organized and consistent.

---

## ✨ Main Features

- User registration and login
- JWT authentication and authorization
- Medicine management
- Medicine category management
- Supplier and manufacturer management
- Customer profile management
- Prescription management
- Order and order item management
- Payment management
- Stock level management
- Pharmacy branch management
- CRUD operations
- Filtering and sorting
- LINQ queries and aggregation
- Input validation
- Protected API endpoints
- Email notifications
- Database persistence

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| C# | Main programming language |
| ASP.NET Core Web API | Backend API |
| Entity Framework Core | Database communication |
| Microsoft SQL Server | Database |
| JWT | Authentication and authorization |
| Bootstrap | Frontend |
| HTML / CSS / JavaScript | Frontend development |
| Swagger / OpenAPI | API documentation and testing |
| Postman | API testing |
| Git | Version control |
| GitHub | Team collaboration |
| Visual Studio | Development environment |
| MailKit / SMTP | Email service |

---

## ⚙️ How to Run the Project

### Prerequisites

Before running the project, make sure you have:

- Visual Studio
- .NET SDK
- Microsoft SQL Server
- SQL Server Management Studio
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Open the Project

Open the solution in **Visual Studio** and locate the ASP.NET Core Web API project.

### 3. Configure the Database

The project uses Microsoft SQL Server.

Database name:

```text
Pharmacy_Management_System_DB
```

Example local connection string:

```text
Server=localhost\SQLEXPRESS;Database=Pharmacy_Management_System_DB;Trusted_Connection=True;TrustServerCertificate=True;
```

If your SQL Server instance is different, update the connection string for your local environment. Avoid committing machine-specific settings.

### 4. Restore Dependencies

Run:

```bash
dotnet restore
```

### 5. Update the Database

Use the existing Entity Framework Core migrations:

```bash
dotnet ef database update
```

### 6. Run the Application

Run the project from Visual Studio or use:

```bash
dotnet run
```

Swagger will be available when the application starts.

---

## 🗄️ Final ERD

Add the final ERD diagram here.

---

## 👥 Team Members and Responsibilities

| Team Member | Responsibility |
|-------------|----------------|
| Haitham  | User & Manufacturer |
| Mariyam 2 | MedicineCategory & Medicine |
| Abdul Rahman 3 | Supplier & Prescription |
| Amal 4 | Order & OrderItem |
| Mohammed 5 | Payment & StockLevel |
| Noora 6 | Branch & CustomerProfile |

---


## 🚀 Project Status

### Completed

- Backend API development
- Entity Framework Core integration
- SQL Server integration
- Database models and relationships
- CRUD operations
- JWT authentication and authorization
- Swagger API testing
- Postman API testing
- Filtering and sorting
- Input validation

### In Progress / Final Integration

- Frontend integration
- Email notification service
- Final system testing
- Final ERD and documentation

---


## 📄 Project Requirements

The project is based on the **Spark to Code 2026 Final Capstone Project — Pharmacy Management System** and includes a minimum of 12 models, JWT authentication, email notifications, Web API controllers, Swagger/Postman testing, and a Bootstrap frontend.
