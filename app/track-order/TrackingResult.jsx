"use client";
import React from "react";
import {
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  PackageCheck,
  AlertTriangle,
  Truck,
  Package,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

const TrackingResult = ({ trackingData }) => {
  const singleTrack = trackingData?.tracking_data;
  const multiWarehouse = trackingData?.data?.warehouses;

  // 1️⃣ Boolean flag to check if any warehouse is own shipment
  const ownShipment = multiWarehouse?.some((wh) => wh?.ownshipment) || false;

  // 2️⃣ Or get only the own shipment warehouses
  const ownShipmentWarehouses =
    multiWarehouse?.filter((wh) => wh?.ownshipment) || [];

  // For multiWarehouse
  if (multiWarehouse?.warehouses?.length > 0) {
    const warehouseError =
      Array.isArray(multiWarehouse?.warehouses) &&
      multiWarehouse.warehouses.length > 0
        ? multiWarehouse.warehouses[0]?.tracking_info?.error || null
        : null;
    if (warehouseError) {
      return (
        <p className="text-red-600 text-center py-6 font-medium">
          {warehouseError}
        </p>
      );
    }
  }

  // For singleTrack (your existing logic stays)
  if (trackingData?.status_code && trackingData.status_code !== 200) {
    return (
      <p className="text-red-600 text-center py-6 font-medium">
        {trackingData.message || "An error occurred."}
      </p>
    );
  }

  if (!singleTrack && !multiWarehouse) {
    return (
      <>
        {/* Tracking Image */}
        <div className="flex justify-center">
          <img
            src="/tracking.png"
            alt="Tracking Illustration"
            className="w-32 h-32 object-contain opacity-90"
          />
        </div>

        {/* Message */}
        <p className="text-[#a00300] text-xl text-center py-6 capitalize">
          No tracking data available for entered details.
        </p>

        {/* Back Button */}
        <div className="flex justify-center mt-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2 bg-[#a00300] text-white font-semibold rounded-full shadow-md hover:bg-[#c20404] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tracking
          </button>
        </div>
      </>
    );
  }

  const filterActivities = (activities) => {
    if (!activities) return [];
    const filterLabels = [
      "In Transit",
      "Booked",
      "Picked Up",
      "Not Picked",
      "Pickup Scheduled",
      "Softdata Upload",
      "Pickup Awaited",
      "Mis Route",
      "Reached At Destination",
    ];
    const seen = new Set();
    const filtered = [];

    for (let i = activities.length - 1; i >= 0; i--) {
      const act = activities[i];
      if (filterLabels.includes(act.activity)) {
        if (!seen.has(act.activity)) {
          seen.add(act.activity);
          filtered.push(act);
        }
      } else {
        filtered.push(act);
      }
    }
    return filtered;
  };

  const renderStepTracker = (activities) => {
    let filteredActivities = filterActivities(activities);

    const scrollRef = useRef(null);
    const stepRef = useRef(null);
    const [scrollIndex, setScrollIndex] = useState(0);

    useEffect(() => {
      if (stepRef.current) {
        setStepWidth(stepRef.current.offsetWidth);
      }
    }, []);

    const [stepWidth, setStepWidth] = useState(0);

    useEffect(() => {
      if (scrollRef.current && stepWidth > 0) {
        const visibleCount = Math.floor(
          scrollRef.current.clientWidth / stepWidth
        );
        const maxSteps = filteredActivities.length - visibleCount;
        setMaxIndex(maxSteps > 0 ? maxSteps : 0);
      }
    }, [stepWidth, filteredActivities.length]);

    const [maxIndex, setMaxIndex] = useState(0);

    const handleNext = () => {
      setScrollIndex((prev) => {
        const newIndex = Math.min(prev + 1, maxIndex);
        scrollRef.current.scrollTo({
          left: newIndex * stepWidth + 8, // +8px so last item isn't cropped
          behavior: "smooth",
        });
        return newIndex;
      });
    };

    const handlePrev = () => {
      setScrollIndex((prev) => {
        const newIndex = Math.max(prev - 1, 0);
        scrollRef.current.scrollTo({
          left: newIndex * stepWidth,
          behavior: "smooth",
        });
        return newIndex;
      });
    };

    const isScrollable = filteredActivities.length > 5;

    const totalSteps = filteredActivities.length;

    // Helper for last step icon
    const getLastStepIcon = (status) => {
      const s = status.toLowerCase();

      if (s.includes("not delivered")) {
        return <Clock className="w-5 h-5 text-yellow-600" />; // pending
      }
      if (s.includes("cancelled") || s.includes("canceled")) {
        return <XCircle className="w-5 h-5 text-red-600" />; // cancelled
      }
      if (s.includes("pickup not done")) {
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      }
      if (s.includes("in transit")) {
        return <Truck className="w-5 h-5 text-yellow-600" />;
      }
      if (s.includes("picked successfully")) {
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      }
      if (s.includes("reached at destination") || s.includes("delivered")) {
        return <PackageCheck className="w-5 h-5 text-green-600" />; // completed
      }
      return <Circle className="w-5 h-5" />; // default gray circle
    };

    // Helper for custom step icons and colors (matches Step Icon design)
    const getStatusIcon = (status) => {
      const s = status.toLowerCase();
      let bg = "bg-gray-200";
      let border = "border-gray-300";
      let text = "text-gray-500";
      let IconComponent = Circle;

      switch (s) {
        case "pending":
          bg = "bg-gray-300";
          border = "border-gray-400";
          text = "text-gray-700";
          IconComponent = Clock;
          break;
        case "processing":
          bg = "bg-yellow-400";
          border = "border-yellow-500";
          text = "text-white";
          IconComponent = AlertTriangle;
          break;
        case "dispatched":
          bg = "bg-orange-500";
          border = "border-orange-600";
          text = "text-white";
          IconComponent = Truck;
          break;
        case "delivered":
          bg = "bg-green-500";
          border = "border-green-500";
          text = "text-white";
          IconComponent = PackageCheck;
          break;
        case "cancelled":
        case "canceled":
          bg = "bg-red-500";
          border = "border-red-600";
          text = "text-white";
          IconComponent = XCircle;
          break;
      }

      return <IconComponent className={`w-5 h-5 ${text}`} />;
    };

    return (
      <div className="relative px-0 py-8 capitalize">
        <div
          ref={scrollRef}
          className={`relative w-full ${
            isScrollable ? "md:flex overflow-x-hidden" : "md:flex"
          } flex-col md:flex-row`}
          style={{
            scrollBehavior: "smooth",
          }}
        >
          {filteredActivities.map((act, i) => {
            const isCompleted = i < totalSteps - 1;
            const isLastStep = i === totalSteps - 1;

            return (
              <div
                key={i}
                ref={i === 0 ? stepRef : null} // only measure first one
                className={`flex md:flex-col items-center md:text-center text-left relative ${
                  isScrollable
                    ? "md:flex-none md:w-44 space-y-20 md:space-y-0"
                    : "flex-1"
                }`}
              >
                {/* Step Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${
                    ownShipment
                      ? (() => {
                          const s = act.activity.toLowerCase();
                          if (s === "pending")
                            return "bg-gray-300 border-gray-400 text-gray-700";
                          if (s === "processing")
                            return "bg-yellow-400 border-yellow-500 text-white";
                          if (s === "dispatched")
                            return "bg-orange-500 border-orange-600 text-white";
                          if (s === "delivered")
                            return "bg-green-500 border-green-500 text-white";
                          if (s === "cancelled" || s === "canceled")
                            return "bg-red-500 border-red-600 text-white";
                          return "bg-gray-200 border-gray-300 text-gray-500";
                        })()
                      : isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isLastStep
                      ? "bg-white border-gray-300 text-gray-500"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {ownShipment ? (
                    getStatusIcon(act.activity)
                  ) : isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isLastStep ? (
                    getLastStepIcon(act.activity)
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Connector */}
                {i < totalSteps - 1 && (
                  <div
                    className={`absolute md:top-4 md:left-1/2 md:h-0.5 ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                    style={
                      window.innerWidth < 768
                        ? {
                            width: "2px",
                            height: "100%",
                            top: "2rem",
                            left: "1rem",
                            zIndex: 0,
                          }
                        : {
                            width: "100%",
                            marginLeft: "1rem",
                            marginRight: "1rem",
                            zIndex: 0,
                          }
                    }
                  />
                )}

                {/* Activity Text */}
                <div className="md:mt-3 md:text-center ml-4 md:ml-0">
                  <p className="text-sm font-medium leading-tight">
                    {[
                      "Pickup Scheduled",
                      "Pickup Reassigned",
                      "Softdata Upload",
                      //   "Reached At Destination",
                    ].includes(act.activity)
                      ? act.activity.split(" ").map((word, idx) => (
                          <React.Fragment key={`${act.activity}-${idx}`}>
                            {word}
                            {idx < act.activity.split(" ").length - 1 && <br />}
                          </React.Fragment>
                        ))
                      : act.activity}
                  </p>

                  {/* Date & Time */}
                  {act.date && (
                    <div className="text-xs text-gray-500">
                      <p>{act.date.split(" ")[0]}</p>
                      <p>{act.date.split(" ")[1]?.split(".")[0]}</p>
                    </div>
                  )}

                  {/* Location */}
                  {act.location && (
                    <div className="text-xs text-gray-400">
                      {act.location.split(",").map((line, idx) => (
                        <p key={idx}>{line.trim()}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button (desktop only) */}
        {isScrollable && scrollIndex < filteredActivities.length - 6 && (
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-20"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Left Scroll Button (desktop only) */}
        {isScrollable && scrollIndex > 0 && (
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-20"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  const renderCard = (
    awbCode,
    activities,
    status,
    courier,
    destination,
    eta,
    warehouseName // <-- new param
  ) => (
    <div className="rounded-xl shadow-md bg-white overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-[#a00300] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          {warehouseName && (
            <span className="text-sm md:text-base font-bold tracking-wide uppercase">
              {warehouseName}
            </span>
          )}
          <span className=" text-xs md:text-sm font-medium text-gray-200">
            TRACKING: {awbCode}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 text-sm">
        <div>
          <p className="text-gray-500 font-semibold text-xs">Status</p>
          <p className="font-bold text-gray-900">{status}</p>
        </div>
        <div>
          <p className="text-gray-500 font-semibold text-xs">Courier</p>
          <p className="text-gray-800">{courier}</p>
        </div>
        <div>
          <p className="text-gray-500 font-semibold text-xs">Destination</p>
          <p className="text-gray-800">{destination}</p>
        </div>
        <div>
          <p className="text-gray-500 font-semibold text-xs">
            ETA (Estimated Time of Arrival)
          </p>
          <p className="text-gray-800">{eta}</p>
        </div>
      </div>

      {/* Tracker */}
      <div className="p-6">{renderStepTracker(activities)}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-2">
          <Package className="w-7 h-7 text-[#a00300]" />
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[#a00300] uppercase">
            Shipment Tracking
          </h1>
        </div>
        <p className="text-gray-600 mt-1 text-sm md:text-sm">
          Stay <span className="text-[#a00300] font-semibold">updated</span>{" "}
          with the latest status of your orders
        </p>
      </div>

      {/* 🟢 Own Shipment Tracking Section */}
      {ownShipment ? (
        ownShipmentWarehouses.map((wh, idx) => (
          <div
            key={`own-${idx}`}
            className="rounded-xl shadow-md bg-white overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-[#a00300] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-bold tracking-wide uppercase">
                  {wh.warehouse_name || "Own Shipment"}
                </span>
                <span className="text-xs md:text-sm font-medium text-gray-200">
                  Order ID: {trackingData?.data?.order_id || "-"}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 text-sm">
              <div>
                <p className="text-gray-500 font-semibold text-xs">
                  Item Count
                </p>
                <p className="font-bold text-gray-900">
                  {wh.item_count || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold text-xs">Status</p>
                <p className="font-bold text-gray-900 capitalize">
                  {wh.awb_status || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold text-xs">AWB Code</p>
                <p className="text-gray-800">{wh.awb_codes || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold text-xs">
                  Shipment Type
                </p>
                <p className="text-gray-800">Own Shipment</p>
              </div>
            </div>

            {/* Step Tracker (latest first) */}
            <div className="p-6">
              {wh.tracking_info?.length > 0 ? (
                renderStepTracker(
                  [...wh.tracking_info] // shallow copy
                    .reverse() // latest first
                    .map((info) => ({
                      activity: info.current_status || "Unknown Status",
                      date: info.date
                        ? new Date(info.date).toLocaleString()
                        : "No timestamp",
                      location: info.location || "",
                      // Flag to use own shipment icons/colors
                      isOwnShipment: true,
                    }))
                )
              ) : (
                <p className="text-gray-500 italic text-center">
                  No tracking updates available
                </p>
              )}
            </div>
          </div>
        ))
      ) : (
        <>
          {/* 🧩 Existing multiWarehouse mapping continues here */}
          {multiWarehouse &&
            multiWarehouse.map((wh, idx) => {
              const tInfo = wh.tracking_info;

              if (typeof tInfo === "string") {
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white shadow-md border border-gray-200 p-6 text-center"
                  >
                    <h2 className="text-lg font-bold text-[#a00300] mb-2 capitalize">
                      {wh.warehouse_name || "Warehouse"}
                    </h2>
                    <p className="text-gray-700">{tInfo}</p>
                  </div>
                );
              }

              if (tInfo?.error) {
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-red-50 border border-red-300 p-6 text-center capitalize"
                  >
                    <h2 className="text-lg font-bold text-red-700 mb-2">
                      {wh.warehouse_name || "Warehouse"}
                    </h2>
                    <p className="text-red-600 font-medium">{tInfo.error}</p>
                  </div>
                );
              }

              return renderCard(
                wh.awb_codes,
                tInfo?.shipment_track_activities || [],
                tInfo?.shipment_track?.[0]?.current_status || "",
                tInfo?.shipment_track?.[0]?.courier_name || "",
                tInfo?.shipment_track?.[0]?.destination || "",
                tInfo?.etd || "",
                wh?.warehouse_name || ""
              );
            })}

          {singleTrack &&
            !singleTrack.error &&
            renderCard(
              singleTrack.shipment_track?.[0]?.awb_code,
              singleTrack.shipment_track_activities,
              singleTrack.shipment_track?.[0]?.current_status,
              singleTrack.shipment_track?.[0]?.courier_name,
              singleTrack.shipment_track?.[0]?.destination,
              singleTrack.etd,
              singleTrack.shipment_track?.[0]?.warehouse_name
            )}

          {singleTrack?.error && (
            <div className="rounded-xl bg-red-50 border border-red-300 p-6 text-center">
              <h2 className="text-lg font-bold text-red-700 mb-2">
                Tracking Error
              </h2>
              <p className="text-red-600 font-medium">{singleTrack.error}</p>
            </div>
          )}
        </>
      )}

      {/* Back Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-2 bg-[#a00300] text-white font-semibold rounded-full shadow-md hover:bg-[#c20404] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tracking
        </button>
      </div>
    </div>
  );
};

export default TrackingResult;
