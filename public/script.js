//JavaScript作成

const API_URL = "http://localhost:3000/expenses";

let editingId = null;   //編集対象のIDを記憶する変数

let expenseChart = null;   //グローバル変数としてチャートを保持

//一覧取得
async function fetchExpenses() {
    const res = await fetch(API_URL);
    const data = await res.json();  //データを取得してJSONに変換
    const monthInput = document.getElementById("monthFilter").value;  //月フィルターの値を取得

    const now = new Date();

    const currentMonth =
        monthInput ||   //月フィルターが設定されていない場合は現在の年月を使用
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    const monthlyExpenses = data.filter(expense => {

        const localDate = new Date(expense.date);

        const localMonth =
         `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}`;

        return localMonth === currentMonth;
    });

    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);   //今月の合計金額を計算
    document.getElementById("monthlyTotal").textContent = `${currentMonth} 合計: ${monthlyTotal.toLocaleString()}円`;   //合計金額を表示

    const keyword = document.getElementById("search").value;    //検索キーワード取得

    const filteredExpenses = data.filter(expense =>    //カテゴリにキーワードが含まれているか
        expense.category.includes(keyword)
    );

    const list = document.getElementById("expenseList");
    list.innerHTML = "";

    let total = 0;  //合計用

    filteredExpenses.forEach(exp => {   //絞り込んだデータを表示

        const localDate = new Date(exp.date);

        const displayDate =
            `${localDate.getFullYear()}-${
            String(localDate.getMonth() + 1).padStart(2, "0")
            }-${
               String(localDate.getDate()).padStart(2, "0")
            }`;


        const localMonth =
            `${localDate.getFullYear()}-${
            String(localDate.getMonth() + 1).padStart(2, "0")
        }`;

        total = total + Number(exp.amount); //合計加算
        
        const row =`
        <tr>
            <td>${exp.id}</td>
            <td class = "amount">${exp.amount.toLocaleString()}円</td>
            <td>${exp.category}</td>
            <td>${displayDate}</td>
            <td>${exp.memo}</td>
            <td>
                <button class="edit-btn" onclick='editExpense(${exp.id}, ${exp.amount}, "${exp.category}", "${exp.date}", "${exp.memo}")'>      
                 編集
                </button>   
                <button class="delete-btn" onclick="deleteExpense(${exp.id})">削除</button>
            </td>

        </tr>
        `;
        list.innerHTML = list.innerHTML + row;
    });

    //合計表示
    document.getElementById("totalAmount").textContent = total.toLocaleString("ja-JP");

    const categoryTotals = {};  //カテゴリごとの合計を計算

    monthlyExpenses.forEach(exp => {    //今月のデータをループ

        if(!categoryTotals[exp.category]){  //カテゴリがまだ存在しない場合は初期化
            categoryTotals[exp.category] = 0;   //初期化
        }

        categoryTotals[exp.category] += Number(exp.amount); //カテゴリの合計に金額を加算
    });

    const ctx = document.getElementById("expenseChart");    //チャートのコンテキストを取得

    if (expenseChart) { //既にチャートが存在する場合は破棄してから新しいチャートを作成
        expenseChart.destroy(); //古いチャートを破棄
    }

    expenseChart = new Chart(ctx, { //新しいチャートを作成

        type: "pie",    //円グラフ

        data: { //チャートのデータ

            labels: Object.keys(categoryTotals),    //カテゴリ名をラベルに使用

            datasets: [{    //データセット
                label: "支出",  //データセットのラベル

                data: Object.values(categoryTotals),    //カテゴリごとの合計金額をデータに使用

                backgroundColor: [  //データポイントの背景色
                    "#FF6384",  //赤
                    "#36A2EB",  //青
                    "#FFCE56",  //黄色
                    "#4BC0C0",  //緑
                    "#9966FF",  //紫
                    "#FF9F40"   //オレンジ
                ],

                borderWidth: 1,  //データポイントの境界線の幅

                hoverOffset: 20 //ホバー時のオフセット
            }]
        }
    })
}

//追加処理
async function addExpense() {

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

    document.getElementById("amount").value = amount;
    document.getElementById("category").value = category;
    const localDate = date.substring(0, 10);  //日付部分だけ切り取る
    document.getElementById("date").value = localDate;  //日付をinputにセット

    document.getElementById("memo").value = memo;

    editingId = id;  //編集対象を記憶

    document.getElementById("submitButton").textContent = "更新";
}

document.getElementById("monthFilter").addEventListener("change", fetchExpenses);   //月フィルターが変更されたら再取得

window.onload = () => { //ページが読み込まれたときに実行
    const now = new Date(); //現在の日付を取得

    const currentMonth =    //現在の年月を"YYYY-MM"形式で作成
        `${now.getFullYear()}-${    //月は0始まりなので+1して2桁にする
            String(now.getMonth() + 1).padStart(2, "0") //月を2桁にするための処理
        }`

    document.getElementById("monthFilter").value = currentMonth;    //月フィルターに現在の年月をセット

    fetchExpenses();    //データ取得
}