import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import XLSX from "xlsx";
import path from "path";

// 🔥 你的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCC_rCR54i6BfO1ZnlNpcUOXPpskeenStM",
  authDomain: "maratan-map.firebaseapp.com",
  projectId: "maratan-map",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📥 读取 Excel
const filePath = path.resolve("shops.xlsx"); // 文件放项目根目录
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 转 JSON
const shops = XLSX.utils.sheet_to_json(sheet);

// 🔍 去重检查
async function shopExists(name) {
  const q = query(collection(db, "shops"), where("name", "==", name));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// 🚀 导入
async function importData() {
  console.log("开始导入 Excel 数据...");

  for (const shop of shops) {
    const exists = await shopExists(shop.name);

    if (exists) {
      console.log("跳过（已存在）:", shop.name);
      continue;
    }

    await addDoc(collection(db, "shops"), {
      name: shop.name,
      lat: Number(shop.lat),
      lng: Number(shop.lng),
    });

    console.log("已添加:", shop.name);
  }

  console.log("全部导入完成！");
}

importData();