"use client";

import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { useState, useEffect } from "react";

import { db } from "../lib/firebase";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 35.68,
  lng: 139.76,
};

type Shop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  visited: boolean;
};

export default function Home() {
  const [markers, setMarkers] = useState<Shop[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ 当前选中的店铺
  const selected =
    markers.find((m) => m.id === selectedId) || null;

  // 📱 判断手机
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () =>
      window.removeEventListener("resize", checkMobile);
  }, []);

  // 📦 读取数据
  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(
        collection(db, "shops")
      );

      const data = querySnapshot.docs.map((docItem) => ({
        id: docItem.id,
        visited: false,
        ...docItem.data(),
      })) as Shop[];

      setMarkers(data);

      setIsLoaded(true);
    }

    fetchData();
  }, []);

  // 🔥 切换 visited
  const toggleVisited = async () => {
    if (!selected) return;

    const ref = doc(db, "shops", selected.id);

    await updateDoc(ref, {
      visited: !selected.visited,
    });

    // ✅ 更新 UI
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === selected.id
          ? {
              ...m,
              visited: !m.visited,
            }
          : m
      )
    );
  };

  // 🚨 SSR 防崩
  if (!isLoaded) return null;

  return (
    <LoadScript
      googleMapsApiKey={
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      }
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        {/* 📍 Marker */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{
              lat: marker.lat,
              lng: marker.lng,
            }}
            onClick={() => setSelectedId(marker.id)}
            icon={{
              url: marker.visited
                ? "/visited.png"
                : "/not-visited.png",
            }}
          />
        ))}

        {/* 💻 PC InfoWindow */}
        {!isMobile && selected && (
          <InfoWindow
            position={{
              lat: selected.lat,
              lng: selected.lng,
            }}
            onCloseClick={() => setSelectedId(null)}
          >
            <div
              style={{
                fontFamily:
                  '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
              }}
            >
              <h3 className="text-lg font-bold text-gray-900">
                {selected.name}
              </h3>

              <button
                onClick={toggleVisited}
                className="bg-orange-500 text-white px-2 py-1 mt-2 rounded"
              >
                {selected.visited
                  ? "食べた ✔"
                  : "食べ済みにマークする"}
              </button>
            </div>
          </InfoWindow>
        )}

        {/* 📱 手机 Bottom Sheet */}
        {isMobile && selected && (
          <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 rounded-t-2xl z-50">
            {/* 小横条 */}
            <div className="w-10 h-1 bg-gray-300 rounded mx-auto mb-2"></div>

            <h2 className="text-lg font-bold">
              {selected.name}
            </h2>

            <button
              onClick={toggleVisited}
              className="bg-orange-500 text-white px-3 py-2 mt-3 rounded w-full"
            >
              {selected.visited
                ? "食べた ✔"
                : "食べ済みにマークする"}
            </button>

            <button
              onClick={() => setSelectedId(null)}
              className="mt-2 text-gray-500 text-sm w-full"
            >
              close
            </button>
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
}