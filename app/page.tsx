"use client";

import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";

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

  const selected =
    markers.find((marker) => marker.id === selectedId) || null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "shops"));

      const data = querySnapshot.docs
        .map((docItem) => {
          const shop = docItem.data();

          return {
            id: docItem.id,
            name: String(shop.name ?? ""),
            lat: Number(shop.lat),
            lng: Number(shop.lng),
            visited: Boolean(shop.visited),
          };
        })
        .filter(
          (shop) =>
            shop.name &&
            Number.isFinite(shop.lat) &&
            Number.isFinite(shop.lng)
        );

      setMarkers(data);
      setIsLoaded(true);
    }

    fetchData();
  }, []);

  const toggleVisited = async () => {
    if (!selected) return;

    const nextVisited = !selected.visited;
    const ref = doc(db, "shops", selected.id);

    await updateDoc(ref, {
      visited: nextVisited,
    });

    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === selected.id
          ? {
              ...marker,
              visited: nextVisited,
            }
          : marker
      )
    );
  };

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
                className="mt-2 rounded bg-orange-500 px-2 py-1 text-white"
                type="button"
              >
                {selected.visited
                  ? "食べてないに戻す"
                  : "食べたにマークする"}
              </button>
            </div>
          </InfoWindow>
        )}

        {isMobile && selected && (
          <div className="fixed bottom-0 left-0 z-50 w-full rounded-t-2xl bg-white p-4 shadow-lg">
            <div className="mx-auto mb-2 h-1 w-10 rounded bg-gray-300" />

            <h2 className="text-lg font-bold text-gray-900">
              {selected.name}
            </h2>

            <button
              onClick={toggleVisited}
              className="mt-3 w-full rounded bg-orange-500 px-3 py-2 text-white"
              type="button"
            >
              {selected.visited
                ? "食べてないに戻す"
                : "食べたにマークする"}
            </button>

            <button
              onClick={() => setSelectedId(null)}
              className="mt-2 w-full text-sm text-gray-500"
              type="button"
            >
              close
            </button>
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
}