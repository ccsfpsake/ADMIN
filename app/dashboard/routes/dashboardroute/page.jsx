/* global Set */
"use client";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
  TrafficLayer,
} from "@react-google-maps/api";
import {
  collection,
  collectionGroup,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebaseConfig";
import styles from "@/app/ui/dashboard/drivers/driversdashboard.module.css";

const containerStyle = { width: "100%", height: "50vh" };
const center = { lat: 15.05, lng: 120.66 };
const BUS_ICON_SIZE = 35;

export default function AdminBusLocationPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [busLocations, setBusLocations] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [, setMap] = useState(null);
  const [zoom, setZoom] = useState(15);

  const busRefs = useRef({});

  const mapOptions = useMemo(
    () => ({
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "labels", stylers: [{ visibility: "simplified" }] },
        { featureType: "administrative", stylers: [{ visibility: "off" }] },
        { featureType: "landscape", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "water", stylers: [{ color: "#d6e9f8" }] },
      ],
    }),
    []
  );

  const fetchDriversStatus = async () => {
    const snapshot = await getDocs(collection(db, "Drivers"));
    const map = {};
    snapshot.forEach((doc) => {
      const d = doc.data();
      if (d.driverID) {
        map[d.driverID] = {
          companyID: d.companyID,
          status: d.status || "inactive",
          imageUrl: d.imageUrl || null,
          LName: d.LName || "",
          FName: d.FName || "",
          MName: d.MName || "",
        };
      }
    });
    return map;
  };

  const fetchRoutePlateNumbers = async () => {
    const snapshot = await getDocs(collection(db, "Route"));
    const map = {};
    snapshot.forEach((doc) => {
      const d = doc.data();
      if (d.driverID) {
        map[d.driverID] = {
          plateNumber: d.plateNumber,
          route: d.route || null,
        };
      }
    });
    return map;
  };

  useEffect(() => {
    let unsubBuses = null;
    let unsubStops = null;

    const loadData = async () => {
      const driverMap = await fetchDriversStatus();
      const routeMap = await fetchRoutePlateNumbers();

      unsubBuses = onSnapshot(collection(db, "BusLocation"), (snap) => {
        const buses = snap.docs.map((doc) => {
          const d = doc.data();
          const route = routeMap[d.driverID] || {};
          const driver = driverMap[d.driverID] || {};
          return {
            id: doc.id,
            ...d,
            plateNumber: route.plateNumber || null,
            route: route.route || null,
            companyID: driver.companyID || null,
            status: driver.status || "inactive",
            imageUrl: driver.imageUrl || null,
            LName: driver.LName || "",
            FName: driver.FName || "",
            MName: driver.MName || "",
          };
        });
        setBusLocations(buses.filter((b) => b.status === "active"));
      });

      unsubStops = onSnapshot(collectionGroup(db, "Stops"), (snap) => {
        const stops = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            locID: data.locID,
            geo: data.geo,
          };
        });
        setBusStops(stops);
      });
    };

    loadData();
    return () => {
      if (unsubBuses) unsubBuses();
      if (unsubStops) unsubStops();
    };
  }, []);

  const getIdleMinutes = (bus) => {
    if (bus.lastUpdated?.toDate) {
      const diff = Date.now() - bus.lastUpdated.toDate().getTime();
      return Math.floor(diff / 60000);
    }
    return 0;
  };

  const getIdleTime = useCallback((bus) => {
    const mins = getIdleMinutes(bus);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `Not moved for ${h} hour${h > 1 ? "s" : ""}${m > 0 ? ` ${m} min` : ""}`;
    }
    return mins > 0 ? `Not moved for ${mins} min` : "Moving";
  }, []);

  const handleBusClick = useCallback((bus) => setSelectedBus(bus), []);
  const handleStopClick = useCallback((stop) => setSelectedStop(stop), []);

  if (!isLoaded) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mapContainer}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          onLoad={(mapInstance) => {
            setMap(mapInstance);
            setZoom(mapInstance.getZoom());

            mapInstance.addListener("zoom_changed", () => {
              setZoom(mapInstance.getZoom());
            });
          }}
          options={mapOptions}
        >
          <TrafficLayer />
          {busLocations.map((bus) => {
            const pos = {
              lat: bus.currentLocation?.latitude ?? center.lat,
              lng: bus.currentLocation?.longitude ?? center.lng,
            };
            busRefs.current[bus.id] = pos;

            return (
              <Marker
                key={bus.id}
                position={pos}
                icon={
                  typeof window !== "undefined" && window.google?.maps
                    ? {
                        url: "/buss.png",
                        scaledSize: new window.google.maps.Size(BUS_ICON_SIZE, BUS_ICON_SIZE),
                        anchor: new window.google.maps.Point(BUS_ICON_SIZE / 2, BUS_ICON_SIZE / 2),
                      }
                    : undefined
                }
                zIndex={2}
                onClick={() => handleBusClick(bus)}
              />
            );
          })}

          {zoom >= 15 &&
            busStops.map((stop) => (
              <Marker
                key={stop.id}
                position={{ lat: stop.geo.latitude, lng: stop.geo.longitude }}
                icon={{ url: "/stop-icon.png", scaledSize: new window.google.maps.Size(30, 30) }}
                zIndex={1}
                onClick={() => handleStopClick(stop)}
              />
            ))}

          {selectedBus && (
            <InfoWindow
              position={busRefs.current[selectedBus.id]}
              onCloseClick={() => setSelectedBus(null)}
            >
              <div>
                <strong>Driver ID:</strong> {selectedBus.driverID} <br />
                <strong>Plate Number:</strong> {selectedBus.plateNumber} <br />
                <strong>Route:</strong> {selectedBus.route} <br />
                <strong>Company:</strong> {selectedBus.companyID} <br />
                <strong style={{ color: "blue" }}>{getIdleTime(selectedBus)}</strong>
              </div>
            </InfoWindow>
          )}

          {selectedStop && (
            <InfoWindow
              position={{ lat: selectedStop.geo.latitude, lng: selectedStop.geo.longitude }}
              onCloseClick={() => setSelectedStop(null)}
            >
              <div>
                <strong>Location ID:</strong> {selectedStop.locID} <br />
                <strong>Stop Name:</strong> {selectedStop.name}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
