const express = require("express");
const router = express.Router();
const multer = require("multer");
const ExcelJS = require("exceljs");
const upload = multer({ dest: "uploads/" });
const StudentModel = require("../models/students.js");

router.get("/", async (_req, res, next) => {
  try {
    const students = await StudentModel.find({}, null, { sort: { rollNo: 1 } });
    res.send(students);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data from MongoDB");
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, gender, physics, maths, english } = req.body;
    const lastStudent = await StudentModel.findOne({}, null, {
      sort: { rollNo: -1 },
    });
    const lastRollNo = lastStudent ? lastStudent.rollNo : 0;
    const addStudent = new StudentModel({
      rollNo: lastRollNo + 1,
      name,
      gender,
      physics,
      maths,
      english,
    });

    await addStudent.save();
    res.send("success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data to MongoDB");
  }
});

router.get("/details/:rollNo", async (req, res, next) => {
  try {
    const student = await StudentModel.findOne({ rollNo: req.params.rollNo });
    res.send(student);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching student details from MongoDB");
  }
});

router.delete("/:rollNo", async (req, res, next) => {
  try {
    await StudentModel.findOneAndDelete({ rollNo: req.params.rollNo });
    res.send("success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting student from MongoDB");
  }
});

router.put("/edit/:rollNo", async (req, res) => {
  const rollNo = req.params.rollNo;
  const updatedStudent = req.body;

  try {
    await StudentModel.findOneAndUpdate({ rollNo }, updatedStudent);
    res.send("success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating student in MongoDB");
  }
});

router.put("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const jsonData = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        const rowData = {};

        row.eachCell((cell, colNumber) => {
          const cellValue = cell.value;
          const headerCell = worksheet.getRow(1).getCell(colNumber);
          const headerValue = headerCell.value;
          rowData[headerValue] = cellValue;
        });

        jsonData.push(rowData);
      }
    });

    const students = await StudentModel.create(jsonData);
    res.json(students);

    await fs.promises.unlink(filePath);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to process the file." });
  }
});

module.exports = router;
