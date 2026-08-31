import React from "react";
import { useParams } from "react-router-dom";
import PartnerCustomerDetail from "./PartnerCustomerDetail";

/** Wraps PartnerCustomerDetail to extract the :id param from React Router. */
export default function PartnerCustomerDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <PartnerCustomerDetail customerId={id || ""} />;
}
