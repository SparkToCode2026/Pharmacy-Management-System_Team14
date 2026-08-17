-- ============================================================
-- Oman Pharmacy Management System - Test Data Seed Script
-- Creates 5 authentic Oman-based entries for each table
-- ============================================================

USE FinalProject;
GO

SET NOCOUNT ON;

-- 1. Ensure Roles (1: Admin, 2: Pharmacist, 3: User)
IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE RoleId = 1)
    INSERT INTO [Roles] (RoleName) VALUES ('Admin');
IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE RoleId = 2)
    INSERT INTO [Roles] (RoleName) VALUES ('Pharmacist');
IF NOT EXISTS (SELECT 1 FROM [Roles] WHERE RoleId = 3)
    INSERT INTO [Roles] (RoleName) VALUES ('User');
GO

-- 2. Insert Users (Oman Team & Customers)
-- Password for all new test users is: Password123!
-- BCrypt hash: $2a$11$x9Zb/0dDjuBQOXo/3fhwQuyHwQpXGU29JngtzNBYNrwo44rXSwxbS
IF NOT EXISTS (SELECT 1 FROM [User] WHERE Username = 'tariq_albusaidi')
    INSERT INTO [User] (Username, Email, Password, createdAt, RoleId)
    VALUES ('tariq_albusaidi', 'tariq.busaidi@pharmacy.om', '$2a$11$x9Zb/0dDjuBQOXo/3fhwQuyHwQpXGU29JngtzNBYNrwo44rXSwxbS', GETDATE(), 2);

IF NOT EXISTS (SELECT 1 FROM [User] WHERE Username = 'fatima_albalushi')
    INSERT INTO [User] (Username, Email, Password, createdAt, RoleId)
    VALUES ('fatima_albalushi', 'fatima.balushi@pharmacy.om', '$2a$11$x9Zb/0dDjuBQOXo/3fhwQuyHwQpXGU29JngtzNBYNrwo44rXSwxbS', GETDATE(), 2);

IF NOT EXISTS (SELECT 1 FROM [User] WHERE Username = 'ahmed_alhinai')
    INSERT INTO [User] (Username, Email, Password, createdAt, RoleId)
    VALUES ('ahmed_alhinai', 'ahmed.hinai@gmail.com', '$2a$11$x9Zb/0dDjuBQOXo/3fhwQuyHwQpXGU29JngtzNBYNrwo44rXSwxbS', GETDATE(), 3);

IF NOT EXISTS (SELECT 1 FROM [User] WHERE Username = 'maryam_alrawahi')
    INSERT INTO [User] (Username, Email, Password, createdAt, RoleId)
    VALUES ('maryam_alrawahi', 'maryam.rawahi@gmail.com', '$2a$11$x9Zb/0dDjuBQOXo/3fhwQuyHwQpXGU29JngtzNBYNrwo44rXSwxbS', GETDATE(), 3);

IF NOT EXISTS (SELECT 1 FROM [User] WHERE Username = 'salim_alkharusi')
    INSERT INTO [User] (Username, Email, Password, createdAt, RoleId)
    VALUES ('salim_alkharusi', 'salim.kharusi@gmail.com', '$2a$11$x9Zb/0dDjuBQOXo/3fhwQuyHwQpXGU29JngtzNBYNrwo44rXSwxbS', GETDATE(), 3);
GO

-- 3. Insert Customer Profiles for Oman Users
DECLARE @Uid1 INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'ahmed_alhinai');
DECLARE @Uid2 INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'maryam_alrawahi');
DECLARE @Uid3 INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'salim_alkharusi');
DECLARE @Uid4 INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'tariq_albusaidi');
DECLARE @Uid5 INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'fatima_albalushi');

IF @Uid1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [CustomerProfile] WHERE UserId = @Uid1)
    INSERT INTO [CustomerProfile] (CustomerPhone, CustomerAddress, DateOfBirth, UserId)
    VALUES (93456789, 'Falaj Al Qabail, Sohar, Al Batinah North, Sultanate of Oman', '1988-11-03', @Uid1);

IF @Uid2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [CustomerProfile] WHERE UserId = @Uid2)
    INSERT INTO [CustomerProfile] (CustomerPhone, CustomerAddress, DateOfBirth, UserId)
    VALUES (94567890, 'Firq District, Nizwa, Al Dakhiliyah, Sultanate of Oman', '1995-02-18', @Uid2);

IF @Uid3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [CustomerProfile] WHERE UserId = @Uid3)
    INSERT INTO [CustomerProfile] (CustomerPhone, CustomerAddress, DateOfBirth, UserId)
    VALUES (95678901, 'Al Mawaleh South, Seeb, Muscat Governorate, Sultanate of Oman', '1992-07-30', @Uid3);

IF @Uid4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [CustomerProfile] WHERE UserId = @Uid4)
    INSERT INTO [CustomerProfile] (CustomerPhone, CustomerAddress, DateOfBirth, UserId)
    VALUES (91234567, 'Al Khuwair 33, Bowsher, Muscat, Sultanate of Oman', '1990-05-14', @Uid4);

IF @Uid5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [CustomerProfile] WHERE UserId = @Uid5)
    INSERT INTO [CustomerProfile] (CustomerPhone, CustomerAddress, DateOfBirth, UserId)
    VALUES (92345678, 'Al Haffa Beach Road, Salalah, Dhofar, Sultanate of Oman', '1993-08-22', @Uid5);
GO

-- 4. Insert 5 Oman Branches
IF NOT EXISTS (SELECT 1 FROM [Branch] WHERE BranchName = 'Muscat Central Pharmacy - Al Khuwair')
    INSERT INTO [Branch] (BranchName, BranchAddress, BranchCity, BranchPhone)
    VALUES ('Muscat Central Pharmacy - Al Khuwair', 'Sultan Qaboos Street, Al Khuwair', 'Muscat', 968241234);

IF NOT EXISTS (SELECT 1 FROM [Branch] WHERE BranchName = 'Salalah Beach Pharmacy')
    INSERT INTO [Branch] (BranchName, BranchAddress, BranchCity, BranchPhone)
    VALUES ('Salalah Beach Pharmacy', 'As Sultan Qaboos Hospital Road, Al Dahariz', 'Salalah', 968231234);

IF NOT EXISTS (SELECT 1 FROM [Branch] WHERE BranchName = 'Sohar Port Pharmacy')
    INSERT INTO [Branch] (BranchName, BranchAddress, BranchCity, BranchPhone)
    VALUES ('Sohar Port Pharmacy', 'Sohar Main Souq Commercial District', 'Sohar', 968261234);

IF NOT EXISTS (SELECT 1 FROM [Branch] WHERE BranchName = 'Nizwa Heritage Pharmacy')
    INSERT INTO [Branch] (BranchName, BranchAddress, BranchCity, BranchPhone)
    VALUES ('Nizwa Heritage Pharmacy', 'Near Historic Nizwa Fort, Souq Area', 'Nizwa', 968251234);

IF NOT EXISTS (SELECT 1 FROM [Branch] WHERE BranchName = 'Seeb City Center Pharmacy')
    INSERT INTO [Branch] (BranchName, BranchAddress, BranchCity, BranchPhone)
    VALUES ('Seeb City Center Pharmacy', 'Al Mawaleh North, Near City Centre Mall', 'Seeb', 968249876);
GO

-- 5. Insert 5 Oman / Regional Manufacturers
IF NOT EXISTS (SELECT 1 FROM [Manufacturer] WHERE ManufacturerName = 'National Pharmaceutical Industries Co. (NPI Oman)')
    INSERT INTO [Manufacturer] (ManufacturerName, LicenseNumber, ContactNumber, ContactEmail)
    VALUES ('National Pharmaceutical Industries Co. (NPI Oman)', 'MOH-OM-0012', '+968 24446500', 'info@npioman.com');

IF NOT EXISTS (SELECT 1 FROM [Manufacturer] WHERE ManufacturerName = 'Oman Pharmaceutical Products Co. (OPP)')
    INSERT INTO [Manufacturer] (ManufacturerName, LicenseNumber, ContactNumber, ContactEmail)
    VALUES ('Oman Pharmaceutical Products Co. (OPP)', 'MOH-OM-0034', '+968 24449800', 'contact@oppoman.com');

IF NOT EXISTS (SELECT 1 FROM [Manufacturer] WHERE ManufacturerName = 'Gulf Pharmaceutical Industries (Julphar Oman)')
    INSERT INTO [Manufacturer] (ManufacturerName, LicenseNumber, ContactNumber, ContactEmail)
    VALUES ('Gulf Pharmaceutical Industries (Julphar Oman)', 'MOH-OM-0056', '+968 24597000', 'oman@julphar.com');

IF NOT EXISTS (SELECT 1 FROM [Manufacturer] WHERE ManufacturerName = 'Phamax Laboratories Oman')
    INSERT INTO [Manufacturer] (ManufacturerName, LicenseNumber, ContactNumber, ContactEmail)
    VALUES ('Phamax Laboratories Oman', 'MOH-OM-0078', '+968 24601122', 'sales@phamax.om');

IF NOT EXISTS (SELECT 1 FROM [Manufacturer] WHERE ManufacturerName = 'Muscat Pharma Manufacturing & Distribution')
    INSERT INTO [Manufacturer] (ManufacturerName, LicenseNumber, ContactNumber, ContactEmail)
    VALUES ('Muscat Pharma Manufacturing & Distribution', 'MOH-OM-0090', '+968 24703344', 'support@muscatpharma.om');
GO

-- 6. Insert 5 Oman Suppliers
IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE SupplierName = 'Muscat Pharmacy & Stores LLC')
    INSERT INTO [Suppliers] (SupplierName, SupplierEmail, SupplierPhone, SupplierAddress)
    VALUES ('Muscat Pharmacy & Stores LLC', 'orders@muscatpharmacy.om', '+968 24814501', 'Al Wadi Al Kabir, Muscat, Sultanate of Oman');

IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE SupplierName = 'Waleed Pharmacy LLC')
    INSERT INTO [Suppliers] (SupplierName, SupplierEmail, SupplierPhone, SupplierAddress)
    VALUES ('Waleed Pharmacy LLC', 'supply@waleed.com.om', '+968 24705432', 'Ruwi Commercial High Street, Muscat, Sultanate of Oman');

IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE SupplierName = 'Mazoon Pharmacy & Medical Supplies')
    INSERT INTO [Suppliers] (SupplierName, SupplierEmail, SupplierPhone, SupplierAddress)
    VALUES ('Mazoon Pharmacy & Medical Supplies', 'mazoon@omantel.net.om', '+968 24567890', '18th November Street, Al Azaiba, Muscat, Sultanate of Oman');

IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE SupplierName = 'Taiba Healthcare Oman')
    INSERT INTO [Suppliers] (SupplierName, SupplierEmail, SupplierPhone, SupplierAddress)
    VALUES ('Taiba Healthcare Oman', 'supply@taiba.om', '+968 24491122', 'Knowledge Oasis Muscat (KOM 4), Rusayl, Sultanate of Oman');

IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE SupplierName = 'Ibn Sina Medical Agency LLC')
    INSERT INTO [Suppliers] (SupplierName, SupplierEmail, SupplierPhone, SupplierAddress)
    VALUES ('Ibn Sina Medical Agency LLC', 'ibnsina@ibnsinapharmacy.om', '+968 24698765', 'Al Ghubrah North, Muscat, Sultanate of Oman');
GO

-- 7. Insert 5 Medicine Categories
IF NOT EXISTS (SELECT 1 FROM [MedicineCategories] WHERE MedicineCategoryName = 'Antibiotics & Anti-infectives')
    INSERT INTO [MedicineCategories] (MedicineCategoryName, MedicineCategoryDescription)
    VALUES ('Antibiotics & Anti-infectives', 'Essential antimicrobial medications used to treat and prevent bacterial infections');

IF NOT EXISTS (SELECT 1 FROM [MedicineCategories] WHERE MedicineCategoryName = 'Analgesics & Antipyretics')
    INSERT INTO [MedicineCategories] (MedicineCategoryName, MedicineCategoryDescription)
    VALUES ('Analgesics & Antipyretics', 'Pain relieving, anti-inflammatory, and fever reducing pharmaceutical preparations');

IF NOT EXISTS (SELECT 1 FROM [MedicineCategories] WHERE MedicineCategoryName = 'Cardiovascular & Blood Pressure')
    INSERT INTO [MedicineCategories] (MedicineCategoryName, MedicineCategoryDescription)
    VALUES ('Cardiovascular & Blood Pressure', 'Medications for managing hypertension, heart health, arrhythmia, and cholesterol');

IF NOT EXISTS (SELECT 1 FROM [MedicineCategories] WHERE MedicineCategoryName = 'Respiratory & Anti-Allergy')
    INSERT INTO [MedicineCategories] (MedicineCategoryName, MedicineCategoryDescription)
    VALUES ('Respiratory & Anti-Allergy', 'Inhalers, antihistamines, and therapeutic agents for asthma, bronchitis, and allergies');

IF NOT EXISTS (SELECT 1 FROM [MedicineCategories] WHERE MedicineCategoryName = 'Gastrointestinal & Antacids')
    INSERT INTO [MedicineCategories] (MedicineCategoryName, MedicineCategoryDescription)
    VALUES ('Gastrointestinal & Antacids', 'Proton pump inhibitors, H2 blockers, and antacids for stomach acid and digestive comfort');
GO

-- 8. Insert 5 Medicines
DECLARE @MId1 INT = (SELECT TOP 1 ManufacturerId FROM [Manufacturer] WHERE ManufacturerName LIKE '%National Pharmaceutical%');
DECLARE @MId2 INT = (SELECT TOP 1 ManufacturerId FROM [Manufacturer] WHERE ManufacturerName LIKE '%Oman Pharmaceutical%');
DECLARE @MId3 INT = (SELECT TOP 1 ManufacturerId FROM [Manufacturer] WHERE ManufacturerName LIKE '%Julphar%');
DECLARE @MId4 INT = (SELECT TOP 1 ManufacturerId FROM [Manufacturer] WHERE ManufacturerName LIKE '%Phamax%');
DECLARE @MId5 INT = (SELECT TOP 1 ManufacturerId FROM [Manufacturer] WHERE ManufacturerName LIKE '%Muscat Pharma%');

DECLARE @CId1 INT = (SELECT TOP 1 MedicineCategoryId FROM [MedicineCategories] WHERE MedicineCategoryName LIKE 'Antibiotics%');
DECLARE @CId2 INT = (SELECT TOP 1 MedicineCategoryId FROM [MedicineCategories] WHERE MedicineCategoryName LIKE 'Analgesics%');
DECLARE @CId3 INT = (SELECT TOP 1 MedicineCategoryId FROM [MedicineCategories] WHERE MedicineCategoryName LIKE 'Cardiovascular%');
DECLARE @CId4 INT = (SELECT TOP 1 MedicineCategoryId FROM [MedicineCategories] WHERE MedicineCategoryName LIKE 'Respiratory%');
DECLARE @CId5 INT = (SELECT TOP 1 MedicineCategoryId FROM [MedicineCategories] WHERE MedicineCategoryName LIKE 'Gastrointestinal%');

DECLARE @SId1 INT = (SELECT TOP 1 SupplierId FROM [Suppliers] WHERE SupplierName LIKE '%Muscat Pharmacy%');
DECLARE @SId2 INT = (SELECT TOP 1 SupplierId FROM [Suppliers] WHERE SupplierName LIKE '%Waleed%');
DECLARE @SId3 INT = (SELECT TOP 1 SupplierId FROM [Suppliers] WHERE SupplierName LIKE '%Mazoon%');
DECLARE @SId4 INT = (SELECT TOP 1 SupplierId FROM [Suppliers] WHERE SupplierName LIKE '%Taiba%');
DECLARE @SId5 INT = (SELECT TOP 1 SupplierId FROM [Suppliers] WHERE SupplierName LIKE '%Ibn Sina%');

IF NOT EXISTS (SELECT 1 FROM [Medicines] WHERE MedicineName = 'Amoxicillin 500mg Capsules')
    INSERT INTO [Medicines] (MedicineName, MedicineDescription, MedicinePrice, ManufacturerId, MedicineProductionDate, MedicineExpiryDate, MedicineCategoryId, SupplierId)
    VALUES ('Amoxicillin 500mg Capsules', 'Broad-spectrum oral penicillin antibiotic for respiratory, ear, and skin infections', 2.50, @MId1, '2026-01-10', '2028-01-10', @CId1, @SId1);

IF NOT EXISTS (SELECT 1 FROM [Medicines] WHERE MedicineName = 'Panadol Extra 500mg/65mg')
    INSERT INTO [Medicines] (MedicineName, MedicineDescription, MedicinePrice, ManufacturerId, MedicineProductionDate, MedicineExpiryDate, MedicineCategoryId, SupplierId)
    VALUES ('Panadol Extra 500mg/65mg', 'Fast and effective paracetamol pain reliever boosted with caffeine for headaches and fever', 1.20, @MId2, '2026-02-01', '2028-02-01', @CId2, @SId2);

IF NOT EXISTS (SELECT 1 FROM [Medicines] WHERE MedicineName = 'Concor 5mg (Bisoprolol Fumarate)')
    INSERT INTO [Medicines] (MedicineName, MedicineDescription, MedicinePrice, ManufacturerId, MedicineProductionDate, MedicineExpiryDate, MedicineCategoryId, SupplierId)
    VALUES ('Concor 5mg (Bisoprolol Fumarate)', 'Cardioselective beta-blocker indicated for management of arterial hypertension and angina', 4.80, @MId3, '2026-01-15', '2028-01-15', @CId3, @SId3);

IF NOT EXISTS (SELECT 1 FROM [Medicines] WHERE MedicineName = 'Ventolin Inhaler 100mcg (Salbutamol)')
    INSERT INTO [Medicines] (MedicineName, MedicineDescription, MedicinePrice, ManufacturerId, MedicineProductionDate, MedicineExpiryDate, MedicineCategoryId, SupplierId)
    VALUES ('Ventolin Inhaler 100mcg (Salbutamol)', 'Metered dose inhaler bronchodilator for fast relief of asthma symptoms and wheezing', 3.10, @MId4, '2026-03-01', '2027-09-01', @CId4, @SId4);

IF NOT EXISTS (SELECT 1 FROM [Medicines] WHERE MedicineName = 'Nexium 40mg (Esomeprazole Magnesium)')
    INSERT INTO [Medicines] (MedicineName, MedicineDescription, MedicinePrice, ManufacturerId, MedicineProductionDate, MedicineExpiryDate, MedicineCategoryId, SupplierId)
    VALUES ('Nexium 40mg (Esomeprazole Magnesium)', 'Delayed-release proton pump inhibitor for severe gastroesophageal reflux disease (GERD)', 7.90, @MId5, '2026-01-20', '2028-01-20', @CId5, @SId5);
GO

-- 9. Insert 5 Stock Levels across Oman branches
DECLARE @Med1 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Amoxicillin%');
DECLARE @Med2 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Panadol%');
DECLARE @Med3 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Concor%');
DECLARE @Med4 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Ventolin%');
DECLARE @Med5 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Nexium%');

DECLARE @Br1 INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Muscat Central%');
DECLARE @Br2 INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Salalah Beach%');
DECLARE @Br3 INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Sohar Port%');
DECLARE @Br4 INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Nizwa Heritage%');
DECLARE @Br5 INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Seeb City Center%');

IF NOT EXISTS (SELECT 1 FROM [StockLevel] WHERE MedicineId = @Med1 AND BranchId = @Br1)
    INSERT INTO [StockLevel] (CurrentQuantity, ReorderLevel, LastRestockedDate, MedicineId, BranchId)
    VALUES (150, 30, '2026-08-01', @Med1, @Br1);

IF NOT EXISTS (SELECT 1 FROM [StockLevel] WHERE MedicineId = @Med2 AND BranchId = @Br2)
    INSERT INTO [StockLevel] (CurrentQuantity, ReorderLevel, LastRestockedDate, MedicineId, BranchId)
    VALUES (300, 50, '2026-08-05', @Med2, @Br2);

IF NOT EXISTS (SELECT 1 FROM [StockLevel] WHERE MedicineId = @Med3 AND BranchId = @Br3)
    INSERT INTO [StockLevel] (CurrentQuantity, ReorderLevel, LastRestockedDate, MedicineId, BranchId)
    VALUES (80, 20, '2026-08-10', @Med3, @Br3);

IF NOT EXISTS (SELECT 1 FROM [StockLevel] WHERE MedicineId = @Med4 AND BranchId = @Br4)
    INSERT INTO [StockLevel] (CurrentQuantity, ReorderLevel, LastRestockedDate, MedicineId, BranchId)
    VALUES (60, 15, '2026-08-12', @Med4, @Br4);

IF NOT EXISTS (SELECT 1 FROM [StockLevel] WHERE MedicineId = @Med5 AND BranchId = @Br5)
    INSERT INTO [StockLevel] (CurrentQuantity, ReorderLevel, LastRestockedDate, MedicineId, BranchId)
    VALUES (95, 25, '2026-08-14', @Med5, @Br5);
GO

-- 10. Insert 5 Prescriptions from Oman Doctors
DECLARE @Usr1 INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'ahmed_alhinai');
DECLARE @Usr2 INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'maryam_alrawahi');
DECLARE @Usr3 INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'salim_alkharusi');

IF NOT EXISTS (SELECT 1 FROM [Prescriptions] WHERE PrescriptionDoctorName = 'Dr. Abdullah Al Maamari (Royal Hospital Muscat)')
    INSERT INTO [Prescriptions] (PrescriptionDoctorName, PrescriptionDate, PrescriptionDosage, PrescriptionDuration, PrescriptionStatus, UserId)
    VALUES ('Dr. Abdullah Al Maamari (Royal Hospital Muscat)', '2026-08-10', '500mg twice daily with food', '7 Days', 'Approved', @Usr1);

IF NOT EXISTS (SELECT 1 FROM [Prescriptions] WHERE PrescriptionDoctorName = 'Dr. Salma Al Harthy (SQU Hospital Muscat)')
    INSERT INTO [Prescriptions] (PrescriptionDoctorName, PrescriptionDate, PrescriptionDosage, PrescriptionDuration, PrescriptionStatus, UserId)
    VALUES ('Dr. Salma Al Harthy (SQU Hospital Muscat)', '2026-08-12', '5mg once daily every morning', '30 Days', 'Approved', @Usr2);

IF NOT EXISTS (SELECT 1 FROM [Prescriptions] WHERE PrescriptionDoctorName = 'Dr. Khalid Al Shanfari (Sultan Qaboos Hospital Salalah)')
    INSERT INTO [Prescriptions] (PrescriptionDoctorName, PrescriptionDate, PrescriptionDosage, PrescriptionDuration, PrescriptionStatus, UserId)
    VALUES ('Dr. Khalid Al Shanfari (Sultan Qaboos Hospital Salalah)', '2026-08-14', '2 puffs as needed for bronchospasm', '14 Days', 'Pending', @Usr3);

IF NOT EXISTS (SELECT 1 FROM [Prescriptions] WHERE PrescriptionDoctorName = 'Dr. Mona Al Shehhi (Sohar Hospital)')
    INSERT INTO [Prescriptions] (PrescriptionDoctorName, PrescriptionDate, PrescriptionDosage, PrescriptionDuration, PrescriptionStatus, UserId)
    VALUES ('Dr. Mona Al Shehhi (Sohar Hospital)', '2026-08-15', '40mg once daily before breakfast', '14 Days', 'Completed', @Usr1);

IF NOT EXISTS (SELECT 1 FROM [Prescriptions] WHERE PrescriptionDoctorName = 'Dr. Hilal Al Riyami (Nizwa Hospital)')
    INSERT INTO [Prescriptions] (PrescriptionDoctorName, PrescriptionDate, PrescriptionDosage, PrescriptionDuration, PrescriptionStatus, UserId)
    VALUES ('Dr. Hilal Al Riyami (Nizwa Hospital)', '2026-08-16', '2 tablets every 8 hours as needed for fever', '5 Days', 'Pending', @Usr2);
GO

-- 11. Link Medicine to Prescriptions (MedicinePrescription)
DECLARE @P1 INT = (SELECT TOP 1 PrescriptionId FROM [Prescriptions] WHERE PrescriptionDoctorName LIKE '%Al Maamari%');
DECLARE @P2 INT = (SELECT TOP 1 PrescriptionId FROM [Prescriptions] WHERE PrescriptionDoctorName LIKE '%Al Harthy%');
DECLARE @P3 INT = (SELECT TOP 1 PrescriptionId FROM [Prescriptions] WHERE PrescriptionDoctorName LIKE '%Al Shanfari%');
DECLARE @P4 INT = (SELECT TOP 1 PrescriptionId FROM [Prescriptions] WHERE PrescriptionDoctorName LIKE '%Al Shehhi%');
DECLARE @P5 INT = (SELECT TOP 1 PrescriptionId FROM [Prescriptions] WHERE PrescriptionDoctorName LIKE '%Al Riyami%');

DECLARE @M1 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Amoxicillin%');
DECLARE @M2 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Panadol%');
DECLARE @M3 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Concor%');
DECLARE @M4 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Ventolin%');
DECLARE @M5 INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Nexium%');

IF @P1 IS NOT NULL AND @M1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [MedicinePrescription] WHERE MedicinesMedicineId = @M1 AND PrescriptionsPrescriptionId = @P1)
    INSERT INTO [MedicinePrescription] (MedicinesMedicineId, PrescriptionsPrescriptionId) VALUES (@M1, @P1);

IF @P2 IS NOT NULL AND @M3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [MedicinePrescription] WHERE MedicinesMedicineId = @M3 AND PrescriptionsPrescriptionId = @P2)
    INSERT INTO [MedicinePrescription] (MedicinesMedicineId, PrescriptionsPrescriptionId) VALUES (@M3, @P2);

IF @P3 IS NOT NULL AND @M4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [MedicinePrescription] WHERE MedicinesMedicineId = @M4 AND PrescriptionsPrescriptionId = @P3)
    INSERT INTO [MedicinePrescription] (MedicinesMedicineId, PrescriptionsPrescriptionId) VALUES (@M4, @P3);

IF @P4 IS NOT NULL AND @M5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [MedicinePrescription] WHERE MedicinesMedicineId = @M5 AND PrescriptionsPrescriptionId = @P4)
    INSERT INTO [MedicinePrescription] (MedicinesMedicineId, PrescriptionsPrescriptionId) VALUES (@M5, @P4);

IF @P5 IS NOT NULL AND @M2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [MedicinePrescription] WHERE MedicinesMedicineId = @M2 AND PrescriptionsPrescriptionId = @P5)
    INSERT INTO [MedicinePrescription] (MedicinesMedicineId, PrescriptionsPrescriptionId) VALUES (@M2, @P5);
GO

-- 12. Insert 5 Orders in Oman Branches
DECLARE @U_Ahmed INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'ahmed_alhinai');
DECLARE @U_Maryam INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'maryam_alrawahi');
DECLARE @U_Salim INT = (SELECT TOP 1 UserId FROM [User] WHERE Username = 'salim_alkharusi');

DECLARE @B_Muscat INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Muscat Central%');
DECLARE @B_Salalah INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Salalah Beach%');
DECLARE @B_Sohar INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Sohar Port%');
DECLARE @B_Nizwa INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Nizwa Heritage%');
DECLARE @B_Seeb INT = (SELECT TOP 1 BranchId FROM [Branch] WHERE BranchName LIKE '%Seeb City Center%');

IF (SELECT COUNT(*) FROM [Order]) = 0
BEGIN
    INSERT INTO [Order] (OrderDate, TotalAmount, Status, UserId, BranchId)
    VALUES ('2026-08-12 10:30:00', 7.50, 'Completed', @U_Ahmed, @B_Muscat);

    INSERT INTO [Order] (OrderDate, TotalAmount, Status, UserId, BranchId)
    VALUES ('2026-08-13 14:15:00', 4.80, 'Completed', @U_Maryam, @B_Nizwa);

    INSERT INTO [Order] (OrderDate, TotalAmount, Status, UserId, BranchId)
    VALUES ('2026-08-14 18:45:00', 6.20, 'Preparing', @U_Salim, @B_Salalah);

    INSERT INTO [Order] (OrderDate, TotalAmount, Status, UserId, BranchId)
    VALUES ('2026-08-15 11:20:00', 7.90, 'Confirmed', @U_Ahmed, @B_Sohar);

    INSERT INTO [Order] (OrderDate, TotalAmount, Status, UserId, BranchId)
    VALUES ('2026-08-16 16:00:00', 2.40, 'Pending', @U_Maryam, @B_Seeb);
END
GO

-- 13. Insert 5 Order Items corresponding to the orders
DECLARE @Med_Amox INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Amoxicillin%');
DECLARE @Med_Panadol INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Panadol%');
DECLARE @Med_Concor INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Concor%');
DECLARE @Med_Ventolin INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Ventolin%');
DECLARE @Med_Nexium INT = (SELECT TOP 1 MedicineId FROM [Medicines] WHERE MedicineName LIKE 'Nexium%');

DECLARE @Ord1 INT, @Ord2 INT, @Ord3 INT, @Ord4 INT, @Ord5 INT;
SELECT @Ord1 = OrderId FROM [Order] ORDER BY OrderId OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT @Ord2 = OrderId FROM [Order] ORDER BY OrderId OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT @Ord3 = OrderId FROM [Order] ORDER BY OrderId OFFSET 2 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT @Ord4 = OrderId FROM [Order] ORDER BY OrderId OFFSET 3 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT @Ord5 = OrderId FROM [Order] ORDER BY OrderId OFFSET 4 ROWS FETCH NEXT 1 ROWS ONLY;

IF (SELECT COUNT(*) FROM [OrderItem]) = 0
BEGIN
    IF @Ord1 IS NOT NULL INSERT INTO [OrderItem] (Quantity, UnitPrice, Subtotal, OrderId, MedicineId) VALUES (3, 2.50, 7.50, @Ord1, @Med_Amox);
    IF @Ord2 IS NOT NULL INSERT INTO [OrderItem] (Quantity, UnitPrice, Subtotal, OrderId, MedicineId) VALUES (1, 4.80, 4.80, @Ord2, @Med_Concor);
    IF @Ord3 IS NOT NULL INSERT INTO [OrderItem] (Quantity, UnitPrice, Subtotal, OrderId, MedicineId) VALUES (2, 3.10, 6.20, @Ord3, @Med_Ventolin);
    IF @Ord4 IS NOT NULL INSERT INTO [OrderItem] (Quantity, UnitPrice, Subtotal, OrderId, MedicineId) VALUES (1, 7.90, 7.90, @Ord4, @Med_Nexium);
    IF @Ord5 IS NOT NULL INSERT INTO [OrderItem] (Quantity, UnitPrice, Subtotal, OrderId, MedicineId) VALUES (2, 1.20, 2.40, @Ord5, @Med_Panadol);
END
GO

-- 14. Insert 5 Payments for the Orders
-- PaymentMethod: 0: Cash, 1: CreditCard, 2: DebitCard, 3: Insurance
-- PaymentStatus: 0: Pending, 1: Completed, 2: Failed, 3: Refunded
DECLARE @O1 INT, @O2 INT, @O3 INT, @O4 INT, @O5 INT;
SELECT @O1 = OrderId FROM [Order] ORDER BY OrderId OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT @O2 = OrderId FROM [Order] ORDER BY OrderId OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT @O3 = OrderId FROM [Order] ORDER BY OrderId OFFSET 2 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT @O4 = OrderId FROM [Order] ORDER BY OrderId OFFSET 3 ROWS FETCH NEXT 1 ROWS ONLY;
SELECT @O5 = OrderId FROM [Order] ORDER BY OrderId OFFSET 4 ROWS FETCH NEXT 1 ROWS ONLY;

IF (SELECT COUNT(*) FROM [Payment]) = 0
BEGIN
    IF @O1 IS NOT NULL INSERT INTO [Payment] (Amount, PaymentDate, PaymentMethod, PaymentStatus, OrderId) VALUES (7.50, '2026-08-12 10:32:00', 1, 1, @O1);
    IF @O2 IS NOT NULL INSERT INTO [Payment] (Amount, PaymentDate, PaymentMethod, PaymentStatus, OrderId) VALUES (4.80, '2026-08-13 14:18:00', 2, 1, @O2);
    IF @O3 IS NOT NULL INSERT INTO [Payment] (Amount, PaymentDate, PaymentMethod, PaymentStatus, OrderId) VALUES (6.20, '2026-08-14 18:48:00', 3, 1, @O3);
    IF @O4 IS NOT NULL INSERT INTO [Payment] (Amount, PaymentDate, PaymentMethod, PaymentStatus, OrderId) VALUES (7.90, '2026-08-15 11:25:00', 1, 1, @O4);
    IF @O5 IS NOT NULL INSERT INTO [Payment] (Amount, PaymentDate, PaymentMethod, PaymentStatus, OrderId) VALUES (2.40, '2026-08-16 16:05:00', 0, 0, @O5);
END
GO
