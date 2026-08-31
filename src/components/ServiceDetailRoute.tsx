import React from "react";
import { useParams } from "react-router-dom";
import ServiceDetailPage from "./ServiceDetailPage";
import { useTabNavigation } from "../lib/useTabNavigation";

/** Wraps ServiceDetailPage to extract route params from React Router. */
export default function ServiceDetailRoute() {
  const { category, serviceId } = useParams<{ category: string; serviceId: string }>();
  const { setActiveTab } = useTabNavigation();

  return (
    <ServiceDetailPage
      serviceId={serviceId || ""}
      category={category || ""}
      setActiveTab={setActiveTab}
    />
  );
}
