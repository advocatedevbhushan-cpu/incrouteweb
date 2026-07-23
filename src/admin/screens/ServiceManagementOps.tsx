import React, { useState, useEffect, useMemo } from "react";
import ServicesHeader from "../services/ServicesHeader";
import ServicesSummaryCards from "../services/ServicesSummaryCards";
import ServicesFilterBar from "../services/ServicesFilterBar";
import ServicesCategorySidebar from "../services/ServicesCategorySidebar";
import ServicesTable from "../services/ServicesTable";
import ServicesGrid from "../services/ServicesGrid";
import AddEditServiceDrawer from "../services/AddEditServiceDrawer";
import ServiceDetailDrawer from "../services/ServiceDetailDrawer";
import ServiceTemplatesModal from "../services/ServiceTemplatesModal";

import { INITIAL_SERVICES, SERVICE_TEMPLATES } from "../services/initialServicesData";
import { AdminServiceItem, ServiceSummaryKpis, ServiceTemplateItem } from "../services/servicesTypes";

const CATEGORIES_LIST = [
  "Incorporation",
  "Compliance",
  "Registrations",
  "GST Services",
  "Taxation",
  "Legal & Drafting",
  "Trademark",
  "Licences",
  "Virtual Office",
  "Accounting",
  "Other Services"
];

export default function ServiceManagementOps() {
  const [services, setServices] = useState<AdminServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem("incroute_admin_services_data");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SERVICES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [activeKpiFilter, setActiveKpiFilter] = useState("ALL");

  // Drawer / Modal states
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<AdminServiceItem | null>(null);
  const [selectedDetailService, setSelectedDetailService] = useState<AdminServiceItem | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem("incroute_admin_services_data", JSON.stringify(services));
    } catch {}
  }, [services]);

  // Compute KPI Summary numbers
  const kpis: ServiceSummaryKpis = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter((s) => s.status === "ACTIVE").length;
    const sortedByOrders = [...services].sort((a, b) => b.ordersCount - a.ordersCount);
    const popularService = sortedByOrders[0]?.name || "Private Limited Incorporation";
    const totalOrdersThisMonth = services.reduce((sum, s) => sum + (s.ordersCount || 0), 0);
    const monthlyRevenue = services.reduce((sum, s) => sum + (s.monthlyRevenue || 0), 0);
    const draftOrInactive = services.filter((s) => s.status !== "ACTIVE").length;

    return {
      totalServices,
      activeServices,
      popularService,
      popularServiceOrdersShare: "35%",
      totalOrdersThisMonth,
      monthlyRevenue,
      revenueGrowthPercent: 18.6,
      draftOrInactive
    };
  }, [services]);

  // Filter & Sort logic
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = service.name.toLowerCase().includes(query);
        const matchesCode = service.code.toLowerCase().includes(query);
        const matchesCat = service.category.toLowerCase().includes(query);
        const matchesDesc = service.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesCat && !matchesDesc) return false;
      }

      // Category filter
      if (selectedCategory !== "All Categories" && service.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "ALL" && service.status !== selectedStatus) {
        return false;
      }

      // KPI Card Filter
      if (activeKpiFilter === "ACTIVE" && service.status !== "ACTIVE") return false;
      if (activeKpiFilter === "INACTIVE" && service.status === "ACTIVE") return false;
      if (activeKpiFilter === "POPULAR" && !service.isPopular && service.popularityScore < 85) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") return b.popularityScore - a.popularityScore;
      if (sortBy === "price-asc") return a.basePrice - b.basePrice;
      if (sortBy === "price-desc") return b.basePrice - a.basePrice;
      if (sortBy === "revenue") return b.monthlyRevenue - a.monthlyRevenue;
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      return 0;
    });
  }, [services, searchQuery, selectedCategory, selectedStatus, sortBy, activeKpiFilter]);

  // Actions
  const handleSaveService = (serviceData: Partial<AdminServiceItem>) => {
    if (serviceToEdit) {
      // Update
      setServices((prev) =>
        prev.map((s) => (s.id === serviceToEdit.id ? { ...s, ...serviceData } as AdminServiceItem : s))
      );
    } else {
      // Create new
      const newService: AdminServiceItem = {
        id: `srv-${Date.now()}`,
        code: serviceData.code || `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
        name: serviceData.name || "Untitled Service",
        category: serviceData.category || "Incorporation",
        description: serviceData.description || "",
        fullDescription: serviceData.fullDescription || "",
        basePrice: serviceData.basePrice || 1499,
        gstRate: serviceData.gstRate || 18,
        govtFee: serviceData.govtFee || 0,
        profFee: serviceData.profFee || 1499,
        totalCalculatedPrice: serviceData.totalCalculatedPrice || 1768,
        priceDisplayType: serviceData.priceDisplayType || "STARTING_FROM",
        status: serviceData.status || "ACTIVE",
        ordersCount: 0,
        monthlyRevenue: 0,
        popularityScore: 70,
        estimatedDays: serviceData.estimatedDays || 7,
        isPopular: serviceData.isPopular || false,
        department: serviceData.department || "Operations",
        defaultAssignee: serviceData.defaultAssignee || "CS Associate",
        requiredDocuments: serviceData.requiredDocuments || ["PAN Card", "Aadhaar Card"],
        workflowStages: serviceData.workflowStages || [{ title: "Filing", desc: "Submit paperwork" }],
        checklistItems: [{ id: "chk-1", title: "Verify documents", mandatory: true }],
        lastUpdated: new Date().toISOString().slice(0, 10)
      };
      setServices((prev) => [newService, ...prev]);
    }
  };

  const handleDuplicateService = (service: AdminServiceItem) => {
    const duplicated: AdminServiceItem = {
      ...service,
      id: `srv-${Date.now()}`,
      code: `${service.code}-COPY`,
      name: `${service.name} (Copy)`,
      ordersCount: 0,
      monthlyRevenue: 0,
      lastUpdated: new Date().toISOString().slice(0, 10)
    };
    setServices((prev) => [duplicated, ...prev]);
  };

  const handleToggleStatus = (service: AdminServiceItem) => {
    const nextStatus = service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, status: nextStatus } : s))
    );
  };

  const handleDeleteService = (service: AdminServiceItem) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    }
  };

  const handleUseTemplate = (template: ServiceTemplateItem) => {
    setServiceToEdit(null);
    setIsAddDrawerOpen(true);
  };

  const handleSelectKpiFilter = (filterKey: string) => {
    setActiveKpiFilter(filterKey);
    if (filterKey === "ACTIVE") setSelectedStatus("ACTIVE");
    else if (filterKey === "INACTIVE") setSelectedStatus("INACTIVE");
    else setSelectedStatus("ALL");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedStatus("ALL");
    setSortBy("popular");
    setActiveKpiFilter("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Phase 2: Page Header */}
      <ServicesHeader
        totalServicesCount={services.length}
        onAddService={() => { setServiceToEdit(null); setIsAddDrawerOpen(true); }}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onExport={() => alert("Exporting services list to CSV...")}
        onImport={() => alert("Import services feature ready.")}
      />

      {/* Phase 3: Advanced Summary Cards */}
      <ServicesSummaryCards
        kpis={kpis}
        activeFilter={activeKpiFilter}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* Phase 4: Search, Filters & View Controls */}
      <ServicesFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={handleResetFilters}
        categoriesList={CATEGORIES_LIST}
      />

      {/* Main Content Area: Category Sidebar + Services Table/Grid View */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Phase 5: Category Sidebar */}
        <ServicesCategorySidebar
          categoriesList={CATEGORIES_LIST}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          services={services}
          onAddService={() => { setServiceToEdit(null); setIsAddDrawerOpen(true); }}
        />

        {/* Phase 6 & Phase 7: Table View / Grid View */}
        <div className="flex-1 w-full min-w-0">
          {viewMode === "table" ? (
            <ServicesTable
              services={filteredServices}
              onViewService={(s) => setSelectedDetailService(s)}
              onEditService={(s) => { setServiceToEdit(s); setIsAddDrawerOpen(true); }}
              onDuplicateService={handleDuplicateService}
              onToggleStatus={handleToggleStatus}
              onDeleteService={handleDeleteService}
            />
          ) : (
            <ServicesGrid
              services={filteredServices}
              onViewService={(s) => setSelectedDetailService(s)}
              onEditService={(s) => { setServiceToEdit(s); setIsAddDrawerOpen(true); }}
              onDuplicateService={handleDuplicateService}
              onToggleStatus={handleToggleStatus}
              onDeleteService={handleDeleteService}
            />
          )}
        </div>
      </div>

      {/* Phase 8: Add/Edit Service Drawer */}
      <AddEditServiceDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => { setIsAddDrawerOpen(false); setServiceToEdit(null); }}
        serviceToEdit={serviceToEdit}
        onSave={handleSaveService}
        categoriesList={CATEGORIES_LIST}
      />

      {/* Phase 9: Service Detail Drawer */}
      <ServiceDetailDrawer
        service={selectedDetailService}
        onClose={() => setSelectedDetailService(null)}
        onEdit={(s) => { setSelectedDetailService(null); setServiceToEdit(s); setIsAddDrawerOpen(true); }}
        onDuplicate={handleDuplicateService}
        onToggleStatus={handleToggleStatus}
      />

      {/* Phase 10: Service Templates Modal */}
      <ServiceTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        templates={SERVICE_TEMPLATES}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
