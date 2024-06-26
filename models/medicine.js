const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Medicine {
  constructor(MedicineID, Name, Description, Price, RecommendedDosage, Image) {
    this.MedicineID = MedicineID;
    this.Name = Name;
    this.Description = Description;
    this.Price = Price;
    this.RecommendedDosage = RecommendedDosage;
    this.Image = Image;
  }

  static async getAllMedicines() {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Medicine`;

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset.map(
      (row) =>
        new Medicine(
          row.MedicineID,
          row.Name,
          row.Description,
          row.Price,
          row.RecommendedDosage,
          row.Image
        )
    );
  }

  static async getMedicineById(MedicineID) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Medicine WHERE MedicineID = @MedicineID`;

    const request = connection.request();
    request.input("MedicineID", MedicineID);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset[0]
      ? new Medicine(
          result.recordset[0].MedicineID,
          result.recordset[0].Name,
          result.recordset[0].Description,
          result.recordset[0].Price,
          result.recordset[0].RecommendedDosage,
          result.recordset[0].Image
        )
      : null;
  }

  static async createMedicine(newMedicineData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `INSERT INTO Medicine (Name, Description, Price, RecommendedDosage, Image) VALUES (@Name, @Description, @Price, @RecommendedDosage, @Image); SELECT SCOPE_IDENTITY() AS MedicineID;`;

    const request = connection.request();
    request.input("Name", newMedicineData.Name);
    request.input("Description", newMedicineData.Description);
    request.input("Price", newMedicineData.Price);
    request.input("RecommendedDosage", newMedicineData.RecommendedDosage);
    request.input("Image", newMedicineData.Image);

    const result = await request.query(sqlQuery);

    connection.close();

    return this.getMedicineById(result.recordset[0].MedicineID);
  }

  static async updateMedicine(MedicineID, newMedicineData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `UPDATE Medicine SET Name = @Name, Description = @Description, Price = @Price, RecommendedDosage = @RecommendedDosage, Image = @Image WHERE MedicineID = @MedicineID`;

    const request = connection.request();
    request.input("MedicineID", MedicineID);
    request.input("Name", newMedicineData.Name || null);
    request.input("Description", newMedicineData.Description || null);
    request.input("Price", newMedicineData.Price || null);
    request.input(
      "RecommendedDosage",
      newMedicineData.RecommendedDosage || null
    );
    request.input("Image", newMedicineData.Image || null);

    await request.query(sqlQuery);

    connection.close();

    return this.getMedicineById(MedicineID);
  }

  static async deleteMedicine(MedicineID) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `DELETE FROM Medicine WHERE MedicineID = @MedicineID`;

    const request = connection.request();
    request.input("MedicineID", MedicineID);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.rowsAffected > 0;
  }

  static async getDefaultMedicine() {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `
      SELECT * FROM Medicine WHERE MedicineID IN (1, 2, 3)
    `;

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset.map(
      (row) =>
        new Medicine(
          row.MedicineID,
          row.Name,
          row.Description,
          row.Price,
          row.RecommendedDosage,
          row.Image
        )
    );
  }

  static async getMedicinesByPatientId(PatientID) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `
      SELECT m.MedicineID, m.Name, m.Description, m.Price, m.RecommendedDosage, m.Image
      FROM Medicine m
      JOIN PatientMedicine pm ON m.MedicineID = pm.MedicineID
      WHERE pm.PatientID = @PatientID
    `;

    const request = connection.request();
    request.input("PatientID", PatientID);
    const result = await request.query(sqlQuery);

    const patientMedicines = result.recordset.map(
      (row) =>
        new Medicine(
          row.MedicineID,
          row.Name,
          row.Description,
          row.Price,
          row.RecommendedDosage,
          row.Image
        )
    );

    const defaultMedicines = await this.getDefaultMedicine();

    // Append default medicines if they are not already in the patient's medicines
    const uniqueMedicines = defaultMedicines.filter(
      (defaultMedicine) =>
        !patientMedicines.some(
          (patientMedicine) =>
            patientMedicine.MedicineID === defaultMedicine.MedicineID
        )
    );

    connection.close();

    return [...uniqueMedicines, ...patientMedicines];
  }

  static async updatePatientMedicine(PatientID, newMedicineIDs) {
    const connection = await sql.connect(dbConfig);

    // Remove existing medicines for the patient
    const deleteQuery = `DELETE FROM PatientMedicine WHERE PatientID = @PatientID`;
    const deleteRequest = connection.request();
    deleteRequest.input("PatientID", PatientID);
    await deleteRequest.query(deleteQuery);

    // Add new medicines
    const insertQuery = `INSERT INTO PatientMedicine (PatientID, MedicineID) VALUES (@PatientID, @MedicineID)`;

    for (const medicineID of newMedicineIDs) {
      const insertRequest = connection.request();
      insertRequest.input("PatientID", PatientID);
      insertRequest.input("MedicineID", medicineID);
      await insertRequest.query(insertQuery);
    }

    connection.close();
  }
}

module.exports = Medicine;
