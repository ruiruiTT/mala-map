import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import path from "path";
import XLSX from "xlsx";

const firebaseConfig = {
  apiKey: "AIzaSyCC_rCR54i6BfO1ZnlNpcUOXPpskeenStM",
  authDomain: "maratan-map.firebaseapp.com",
  projectId: "maratan-map",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const filePath = path.resolve("shops.xlsx");
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const shops = XLSX.utils.sheet_to_json(sheet);

async function shopExists(name) {
  const q = query(
    collection(db, "shops"),
    where("name", "==", name)
  );
  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

async function importData() {
  console.log("Excel データのインポートを開始します...");

  for (const shop of shops) {
    const exists = await shopExists(shop.name);

    if (exists) {
      console.log("スキップしました（既に存在）:", shop.name);
      continue;
    }

    await addDoc(collection(db, "shops"), {
      name: shop.name,
      lat: Number(shop.lat),
      lng: Number(shop.lng),
      visited: false,
    });

    console.log("追加しました:", shop.name);
  }

  console.log("すべてのインポートが完了しました");
}

importData();