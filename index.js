// Nạp thư viện cần thiết
const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

dotenv.config(); // Đọc biến môi trường từ .env
app.use(express.json()); // Cho phép đọc JSON từ body POST
app.use(cors());

// Thiết lập kết nối PostgreSQL
// Tạo pool kết nối
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Render yêu cầu phải có dòng này
  },
});

// ✅ Kiểm tra kết nối DB khi server khởi động
pool
  .connect()
  .then(() => {
    console.log("✅ Kết nối đến database thành công!");
  })
  .catch((err) => {
    console.error("❌ Không thể kết nối đến database:", err);
  });

// Route: Lấy danh sách sinh viên từ DB (SELECT)
app.get("/student", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tb_student");
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi SELECT:", err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
});

// Route: Lấy danh sách giáo viên từ DB (SELECT)
app.get("/teacher", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tb_teacher");
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi SELECT:", err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
});

// Route: Lấy danh sách lớp học
app.get("/class", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tb_class");
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi SELECT:", err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
});

// Route: Lấy danh sách môn học
app.get("/subject", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tb_subject");
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi SELECT:", err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
});

// Route: Lấy danh sách Assignment
app.get("/assignment", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tb_assignment");
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi SELECT:", err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
  }
});

// Route: Cập nhật dữ liệu
app.post("/update", async (req, res) => {
  const { table, id, column, value } = req.body;

  // Kiểm tra các tham số bắt buộc
  if (!table || !id || !column || value === undefined) {
    return res.status(400).json({ error: "Thiếu dữ liệu truyền vào" });
  }

  // ⚠️ VALIDATION: tránh SQL injection
  const allowedTables = ["tb_student", "tb_assignment", "tb_subject"]; // thêm bảng hợp lệ
  const allowedColumns = {
    tb_student: ["mail", "name", "phone", "subject_id", "class_id"],
    tb_assignment: ["status", "updated_at"],
    tb_subject: ["name"],
  };

  if (
    !allowedTables.includes(table) ||
    !allowedColumns[table].includes(column)
  ) {
    return res.status(400).json({ error: "Bảng hoặc cột không hợp lệ" });
  }

  try {
    const query = `UPDATE ${table} SET ${column} = $1 WHERE id = $2`;
    const result = await pool.query(query, [value, id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy bản ghi để cập nhật" });
    }

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật:", err);
    res.status(500).json({ error: "Lỗi khi cập nhật dữ liệu" });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${port}`);
});
