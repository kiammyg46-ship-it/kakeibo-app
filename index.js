const express = require("express");
const app = express();

// app.get("/", (req, res) => {
//   res.send("家計簿アプリ起動！");
// });

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use(express.json());
//設定
app.post("/expenses", (req, res) => {
  const { amount, category, date, memo } = req.body;

  const sql = `
    INSERT INTO expenses (amount, category, date, memo)
    VALUES (?, ?, ?, ?)
    `;

  connection.query(sql, [amount, category, date, memo], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("DB保存エラー");
    }

    res.send("DB保存成功");
  })
});

//SQLと接続
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "%Tzk526fXL0911",
  database: "kakeibo"
});

//DBの取得
app.get("/expenses", (req, res) => {
  const sql = "SELECT * FROM expenses";

  connection.query(sql, (err, results) => {
    if(err) {
      console.error(err);
      return res.send("データ取得エラー");
    }

    res.json(results);
  })
})

//更新(Update)の実装
app.put("/expenses/:id", (req, res) => {
  const { id } = req.params;
  const{ amount, category, date, memo } = req.body;

  const sql = `
  UPDATE expenses
  SET amount = ?, category = ?, date = ?, memo = ?
  WHERE id = ?
  `;

  connection.query(sql, [amount, category, date, memo, id], (err) => {
    if(err) {
      console. error(err);
      return res.send("更新エラー");
    }

    res.send("更新成功");
  })
})

//削除(Delete)の実装
app.delete("/expenses/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM expenses WHERE id = ?";
  
  connection.query(sql, [id], (err) => {
    if(err) {
      console.error(err);
      return res.send("削除エラー");
    }

    res.send("削除成功");
  })
})

//フロント公開設定(Node側)
//HTML表示
app.use(express.static("public"));