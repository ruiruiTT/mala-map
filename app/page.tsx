export default function Home() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 📱 判断手机
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 📦 读取数据
  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "shops"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        visited: false,
        ...doc.data()
      }));
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
      visited: !selected.visited
    });

    setMarkers(prev =>
      prev.map(m =>
        m.id === selected.id
          ? { ...m, visited: !m.visited }
          : m
      )
    );

    setSelected((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        visited: !prev.visited
      };
    });
  };

  // 🚨 SSR 防崩
  if (!isLoaded) return null;

  // ✅ 正确 return（只有一个）
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => setSelected(marker)}
            icon={{
              url: marker.visited ? "/visited.png" : "/not-visited.png",
            }}
          />
        ))}

        {/* 💻 PC */}
        {!isMobile && selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h3 className="text-lg font-bold">{selected.name}</h3>

              <button
                onClick={toggleVisited}
                className="bg-orange-500 text-white px-2 py-1 mt-2 rounded"
              >
                {selected.visited ? "食べた ✔" : "食べ済みにマークする"}
              </button>
            </div>
          </InfoWindow>
        )}

        {/* 📱 手机 */}
        {isMobile && selected && (
          <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg z-50">
            <h2 className="text-lg font-bold">{selected.name}</h2>

            <button
              onClick={toggleVisited}
              className="bg-orange-500 text-white px-3 py-2 mt-3 rounded w-full"
            >
              {selected.visited ? "食べた ✔" : "食べ済みにマークする"}
            </button>

            <button
              onClick={() => setSelected(null)}
              className="mt-2 text-gray-500 w-full"
            >
              close
            </button>
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
}