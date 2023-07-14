// Define the Student schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  rollNo: { type: Number, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  physics: { type: Number, required: true },
  maths: { type: Number, required: true },
  english: { type: Number, required: true },
});

// Create the Student model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
