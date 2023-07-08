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
    res.send(jsonData);
  });
  console.log("Hello");
});

router.post("/", function (req, res, next) {
  var addStudent = {
    rollNo: req.body.rollNo,
    name: req.body.name,
    gender: req.body.gender,
    physics: req.body.physics,
    maths: req.body.maths,
    english: req.body.english,
  };
  fs.readFile("./student_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }
    const jsonData = JSON.parse(data);
    jsonData.push(addStudent);
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

    const jsonData = JSON.parse(data);
    var stud = jsonData.find((s) => req.params.rollNo === s.rollNo);
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
      (jsonData) => jsonData.rollNo !== req.params.rollNo
    );
    console.log(jsonData);
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

router.post("/upload", upload.single("file"), (req, res) => {
  const filePath = req.file.path;

  const workbook = new ExcelJS.Workbook();
  workbook.xlsx
    .readFile(filePath)
    .then((workbook) => {
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
      
      fs.readFile("./student_data.json", "utf8", (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error reading data file");
          return;
        }
        // const jsonData = JSON.parse(data);
        // jsonData.push(addStudent);
        fs.writeFile("./student_data.json", JSON.stringify(jsonData), (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error reading data file");
            return;
          }
          res.send("succses");
        });
      });
      res.json(jsonData);
    })
    .catch((error) => {
      console.log("Error:", error);
      res.status(500).json({ error: "Failed to process the file." });
    });
});
module.exports = router;
