var express = require("express");
var router = express.Router();
const fs = require("fs");
const multer = require("multer");
const ExcelJS = require("exceljs");
const upload = multer({ dest: "uploads/" });

router.get("/", function (_req, res, next) {
  fs.readFile("./student_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }
    const jsonData = JSON.parse(data);
    jsonData.sort((a, b) => {
      return parseInt(a.rollNo) - parseInt(b.rollNo);
    });
    res.send(jsonData);
  });
});

router.post("/", function (req, res, next) {
  fs.readFile("./student_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }
    const jsonData = JSON.parse(data);
    const rollNos = jsonData.map((data) => data.rollNo);
    const lastRollNo = Math.max(...rollNos);
    var addStudent = {
      rollNo: lastRollNo + 1,
      name: req.body.name,
      gender: req.body.gender,
      physics: req.body.physics,
      maths: req.body.maths,
      english: req.body.english,
    };
    jsonData.push(addStudent);
    jsonData.sort((a, b) => {
      return parseInt(a.rollNo) - parseInt(b.rollNo);
    });
    fs.writeFile("./student_data.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error reading data file");
        return;
      }
      res.send("succses");
    });
  });
});

router.get("/details/:rollNo", function (req, res, next) {
  fs.readFile("./student_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }

    jsonData = JSON.parse(data);
    const stud = jsonData.find(
      (s) => JSON.stringify(s.rollNo) === req.params.rollNo
    );
    res.send(stud);
  });
});

router.delete("/:rollNo", function (req, res, next) {
  fs.readFile("./student_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }
    jsonData = JSON.parse(data);
    var jsonData = jsonData.filter(
      (jsonData) => String(jsonData.rollNo) !== req.params.rollNo
    );
    fs.writeFile("./student_data.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error reading data file");
        return;
      }
    });
    setTimeout(() => {
      res.send("succses");
    }, 2000);
  });
});
router.put("/edit/:rollNo", (req, res) => {
  const rollNo = req.params.rollNo;
  const updatedStudent = req.body;

  fs.readFile("./student_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading data file");
    }

    let jsonData = JSON.parse(data);
    jsonData = jsonData.map((student) => {
      if (student.rollNo === rollNo) {
        return { ...student, ...updatedStudent };
      }
      return student;
    });

    fs.writeFile("./student_data.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing data file");
      }

      return res.send("success");
    });
  });
});

router.put("/upload", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const workbook = new ExcelJS.Workbook();

  fs.readFile("./student_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }

    workbook.xlsx
      .readFile(filePath)
      .then(() => {
        const worksheet = workbook.getWorksheet(1);
        const jsonData = [];
        let existingData = JSON.parse(data);

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber !== 1) {
            const rowData = {};

            row.eachCell((cell, colNumber) => {
              const cellValue = cell.value;
              const headerCell = worksheet.getRow(1).getCell(colNumber);
              const headerValue = headerCell.value;
              rowData[headerValue] = cellValue;
            });

            const existingRowIndex = existingData.findIndex(
              (existingRow) => existingRow.rollNo === rowData.rollNo
            );

            if (existingRowIndex !== -1) {
              existingData[existingRowIndex] = rowData; // Overwrite existing row
            } else {
              existingData.push(rowData); // Add new row
            }

            jsonData.push(rowData);
          }
        });

        existingData.sort((a, b) => {
          return parseInt(a.rollNo) - parseInt(b.rollNo);
        });

        fs.writeFile(
          "./student_data.json",
          JSON.stringify(existingData),
          (err) => {
            if (err) {
              console.error(err);
              res.status(500).send("Error writing data file");
              return;
            }

            res.json(existingData);
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(err);
                return;
              }
            });
          }
        );
      })
      .catch((error) => {
        console.log("Error:", error);
        res.status(500).json({ error: "Failed to process the file." });
      });
  });
});

module.exports = router;
