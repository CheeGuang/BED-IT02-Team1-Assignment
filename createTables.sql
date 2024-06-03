-- Drop tables if they exist
IF OBJECT_ID('dbo.Appointment', 'U') IS NOT NULL
    DROP TABLE dbo.Appointment;

IF OBJECT_ID('dbo.Medicine', 'U') IS NOT NULL
    DROP TABLE dbo.Medicine;

IF OBJECT_ID('dbo.Doctor', 'U') IS NOT NULL
    DROP TABLE dbo.Doctor;

IF OBJECT_ID('dbo.Patient', 'U') IS NOT NULL
    DROP TABLE dbo.Patient;

-- Create Patient table
CREATE TABLE Patient (
    PatientID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100),
    Email NVARCHAR(100) UNIQUE,
    Password NVARCHAR(100),
    ContactNumber NVARCHAR(15),
    DOB DATE,
    Gender NVARCHAR(10),
    Address NVARCHAR(255),
    eWalletAmount DECIMAL(10, 2),
    resetPasswordCode NVARCHAR(100),
    PCHI DECIMAL(10, 2) -- Per Capita Household Income
);

-- Create Doctor table
CREATE TABLE Doctor (
    DoctorID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100),
    Email NVARCHAR(100) UNIQUE,
    Password NVARCHAR(100),
    ContactNumber NVARCHAR(15),
    DOB DATE,
    Gender NVARCHAR(10),
    Profession NVARCHAR(100),
    resetPasswordCode NVARCHAR(100)
);

-- Create Medicine table
CREATE TABLE Medicine (
    MedicineID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100),
    Description NVARCHAR(255),
    Price DECIMAL(10, 2),
    RecommendedDosage NVARCHAR(100),
    Image NVARCHAR(255)
);

-- Create Appointment table
CREATE TABLE Appointment (
    AppointmentID INT IDENTITY(1,1) PRIMARY KEY,
    PatientID INT,
    DoctorID INT,
    endDateTime DATETIME,
    PatientURL NVARCHAR(1000),
    HostRoomURL NVARCHAR(1000),
    IllnessDescription NVARCHAR(255),
    FOREIGN KEY (PatientID) REFERENCES Patient(PatientID),
    FOREIGN KEY (DoctorID) REFERENCES Doctor(DoctorID)
);
