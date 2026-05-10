//JavaScript作成

const API_URL = "http://localhost:3000/expenses";

let editingId = null;

console.log("script読み込み");
//一覧取得
async function fetchExpenses() {
    const res = await fetch(API_URL);
    const data = await res.json();

    const list = document.getElementById("expenseList");
    list.innerHTML = "";

    let total = 0;  //合計用

    data.forEach(exp => {
        total = total + Number(exp.amount); //合計加算
        const row =`
        <tr>
            <td>${exp.id}</td>
            <td>${exp.amount}</td>
            <td>${exp.category}</td>
            <td>${new Date(exp.date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
            })}
                </td>
            <td>${exp.memo}</td>
            <td>
                <button onclick='editExpense(${exp.id}, ${exp.amount}, "${exp.category}", "${exp.date}", "${exp.memo}")'>
                 編集
                </button>
                <button onclick="deleteExpense(${exp.id})">削除</button>
            </td>

        </tr>
        `;
        list.innerHTML = list.innerHTML + row;
    });

    //合計表示
    document.getElementById("totalAmount").textContent = total.toLocaleString("ja-JP");
}

//追加処理
async function addExpense() {
    console.log("add押した時:", editingId);

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const memo = document.getElementById("memo").value;

    if (!amount || !category || !date) {
        alert("必須項目を入力してください");
        return;
    }
    if (editingId) {
    console.log("更新処理入った");
    } else {
    console.log("新規追加処理");
    }

    if (editingId) {
        //更新(PUT)
        await fetch(`${API_URL}/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ amount, category, date, memo })
        });

        editingId = null;   //リセット
    } else {
        //新規追加(POST)
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
         },
         body: JSON.stringify({ amount, category, date, memo})
        });
    }
    console.log("editingId:", editingId);
    document.getElementById("submitButton").textContent = "追加";

    fetchExpenses();
}

//削除処理
async function deleteExpense(id) {
    if (!confirm("本当に削除しますか？")) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    fetchExpenses();    //再読み込み
}

//編集ボタン処理
function editExpense(id, amount, category, date, memo) {
    console.log("edit押された", id);

    document.getElementById("amount").value = amount;
    document.getElementById("category").value = category;
    const localDate = new Date(date);

    localDate.setHours(localDate.getHours() + 9);
    document.getElementById("date").value = localDate.toISOString().split("T")[0];
    document.getElementById("memo").value = memo;

    editingId = id;  //編集対象を記憶

    document.getElementById("submitButton").textContent = "更新";
}
//初期表示
fetchExpenses();