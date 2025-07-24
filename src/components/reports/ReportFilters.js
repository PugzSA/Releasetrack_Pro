import React, { useState, useEffect } from "react";
import { Filter, Calendar, RotateCcw, Play, X } from "lucide-react";
import {
  TICKET_STATUSES,
  TICKET_TYPES,
  TICKET_PRIORITIES,
} from "../../constants/ticketFields";
import "./ReportFilters.css";

const ReportFilters = ({
  onApplyFilters,
  onClearFilters,
  users = [],
  releases = [],
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    reportType: "ticket_analysis",
    timePeriod: "all_time",
    dateFrom: "",
    dateTo: "",
    status: [],
    type: [],
    priority: [],
    assignee_id: "",
    requester_id: "",
    release_id: [],
    ...initialFilters,
  });

  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Report type options
  const reportTypes = [
    { value: "ticket_analysis", label: "Ticket Analysis" },
    { value: "assignee_workload", label: "Assignee Workload" },
    { value: "release_summary", label: "Release Summary" },
    { value: "priority_trends", label: "Priority Trends" },
    { value: "status_overview", label: "Status Overview" },
  ];

  // Time period options
  const timePeriods = [
    { value: "all_time", label: "All Time" },
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "last_90_days", label: "Last 90 days" },
    { value: "last_6_months", label: "Last 6 months" },
    { value: "last_year", label: "Last year" },
    { value: "custom", label: "Custom range" },
  ];

  // Use the same status options as ticket modals
  const statusOptions = TICKET_STATUSES;

  // Use the same type options as ticket modals
  const typeOptions = TICKET_TYPES;

  // Use the same priority options as ticket modals
  const priorityOptions = TICKET_PRIORITIES;

  useEffect(() => {
    setShowCustomDateRange(filters.timePeriod === "custom");
  }, [filters.timePeriod]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiSelectChange = (key, value) => {
    setFilters((prev) => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [key]: newValues,
      };
    });
  };

  const handleSelectAll = (key, allOptions) => {
    setFilters((prev) => {
      const currentValues = prev[key] || [];
      const isAllSelected = allOptions.every((option) =>
        currentValues.includes(option)
      );

      return {
        ...prev,
        [key]: isAllSelected ? [] : [...allOptions],
      };
    });
  };

  const handleApplyFilters = () => {
    let processedFilters = { ...filters };

    // Process time period into date range
    if (filters.timePeriod !== "custom" && filters.timePeriod !== "all_time") {
      const { dateFrom, dateTo } = getDateRangeFromPeriod(filters.timePeriod);
      processedFilters.dateFrom = dateFrom;
      processedFilters.dateTo = dateTo;
    } else if (filters.timePeriod === "all_time") {
      // Clear any date filters for "all_time"
      processedFilters.dateFrom = "";
      processedFilters.dateTo = "";
    }

    onApplyFilters(processedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      reportType: "ticket_analysis",
      timePeriod: "all_time",
      dateFrom: "",
      dateTo: "",
      status: [],
      type: [],
      priority: [],
      assignee_id: "",
      requester_id: "",
      release_id: [],
    };

    setFilters(clearedFilters);
    setShowCustomDateRange(false);
    onClearFilters();
  };

  const getDateRangeFromPeriod = (period) => {
    const now = new Date();
    let dateTo = now.toISOString().split("T")[0];
    let dateFrom;

    switch (period) {
      case "all_time":
        dateFrom = "";
        dateTo = "";
        break;
      case "last_7_days":
        const date7 = new Date(now);
        date7.setDate(date7.getDate() - 7);
        dateFrom = date7.toISOString().split("T")[0];
        break;
      case "last_30_days":
        const date30 = new Date(now);
        date30.setDate(date30.getDate() - 30);
        dateFrom = date30.toISOString().split("T")[0];
        break;
      case "last_90_days":
        const date90 = new Date(now);
        date90.setDate(date90.getDate() - 90);
        dateFrom = date90.toISOString().split("T")[0];
        break;
      case "last_6_months":
        const date6m = new Date(now);
        date6m.setMonth(date6m.getMonth() - 6);
        dateFrom = date6m.toISOString().split("T")[0];
        break;
      case "last_year":
        const date1y = new Date(now);
        date1y.setFullYear(date1y.getFullYear() - 1);
        dateFrom = date1y.toISOString().split("T")[0];
        break;
      default:
        dateFrom = "";
    }

    return { dateFrom, dateTo };
  };

  const clearField = (fieldName) => {
    if (Array.isArray(filters[fieldName])) {
      handleFilterChange(fieldName, []);
    } else {
      handleFilterChange(fieldName, "");
    }
  };

  return (
    <div className="report-filters-container">
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={20} className="me-2" />
          <h5>Report Filters</h5>
        </div>
        <div className="filter-actions">
          <button
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={handleClearFilters}
          >
            <RotateCcw size={16} className="me-1" />
            Clear All
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleApplyFilters}
          >
            <Play size={16} className="me-1" />
            Generate Report
          </button>
        </div>
      </div>

      <div className="filter-grid">
        {/* Report Type */}
        <div className="filter-group">
          <label className="filter-label">Report Type</label>
          <select
            className="filter-input"
            value={filters.reportType}
            onChange={(e) => handleFilterChange("reportType", e.target.value)}
          >
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Period */}
        <div className="filter-group">
          <label className="filter-label">
            Time Period
            <Calendar size={16} />
          </label>
          <select
            className="filter-input"
            value={filters.timePeriod}
            onChange={(e) => handleFilterChange("timePeriod", e.target.value)}
          >
            {timePeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {showCustomDateRange && (
          <>
            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <input
                type="date"
                className="filter-input"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <input
                type="date"
                className="filter-input"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </>
        )}

        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Status
            <div className="filter-actions">
              <button
                className="select-all-btn"
                onClick={() => handleSelectAll("status", statusOptions)}
                title={
                  statusOptions.every((option) =>
                    filters.status.includes(option)
                  )
                    ? "Deselect all"
                    : "Select all"
                }
              >
                {statusOptions.every((option) =>
                  filters.status.includes(option)
                )
                  ? "Deselect All"
                  : "Select All"}
              </button>
              {filters.status.length > 0 && (
                <button
                  className="clear-field-btn"
                  onClick={() => clearField("status")}
                  title="Clear status filter"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </label>
          <div className="multi-select-container">
            {statusOptions.map((status) => (
              <label key={status} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleMultiSelectChange("status", status)}
                />
                <span className="checkbox-text">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Type
            <div className="filter-actions">
              <button
                className="select-all-btn"
                onClick={() => handleSelectAll("type", typeOptions)}
                title={
                  typeOptions.every((option) => filters.type.includes(option))
                    ? "Deselect all"
                    : "Select all"
                }
              >
                {typeOptions.every((option) => filters.type.includes(option))
                  ? "Deselect All"
                  : "Select All"}
              </button>
              {filters.type.length > 0 && (
                <button
                  className="clear-field-btn"
                  onClick={() => clearField("type")}
                  title="Clear type filter"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </label>
          <div className="multi-select-container">
            {typeOptions.map((type) => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.type.includes(type)}
                  onChange={() => handleMultiSelectChange("type", type)}
                />
                <span className="checkbox-text">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Priority
            <div className="filter-actions">
              <button
                className="select-all-btn"
                onClick={() => handleSelectAll("priority", priorityOptions)}
                title={
                  priorityOptions.every((option) =>
                    filters.priority.includes(option)
                  )
                    ? "Deselect all"
                    : "Select all"
                }
              >
                {priorityOptions.every((option) =>
                  filters.priority.includes(option)
                )
                  ? "Deselect All"
                  : "Select All"}
              </button>
              {filters.priority.length > 0 && (
                <button
                  className="clear-field-btn"
                  onClick={() => clearField("priority")}
                  title="Clear priority filter"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </label>
          <div className="multi-select-container">
            {priorityOptions.map((priority) => (
              <label key={priority} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.priority.includes(priority)}
                  onChange={() => handleMultiSelectChange("priority", priority)}
                />
                <span className="checkbox-text">{priority}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Assignee Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Assignee
            {filters.assignee_id && (
              <button
                className="clear-field-btn"
                onClick={() => clearField("assignee_id")}
                title="Clear assignee filter"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <select
            className="filter-input"
            value={filters.assignee_id}
            onChange={(e) => handleFilterChange("assignee_id", e.target.value)}
          >
            <option value="">All Assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Requester Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Requester
            {filters.requester_id && (
              <button
                className="clear-field-btn"
                onClick={() => clearField("requester_id")}
                title="Clear requester filter"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <select
            className="filter-input"
            value={filters.requester_id}
            onChange={(e) => handleFilterChange("requester_id", e.target.value)}
          >
            <option value="">All Requesters</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Release Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Release
            <div className="filter-actions">
              <button
                className="select-all-btn"
                onClick={() =>
                  handleSelectAll("release_id", [
                    "no-release",
                    ...releases.map((r) => r.id),
                  ])
                }
                title={
                  ["no-release", ...releases.map((r) => r.id)].every((option) =>
                    filters.release_id.includes(option)
                  )
                    ? "Deselect all"
                    : "Select all"
                }
              >
                {["no-release", ...releases.map((r) => r.id)].every((option) =>
                  filters.release_id.includes(option)
                )
                  ? "Deselect All"
                  : "Select All"}
              </button>
              {filters.release_id.length > 0 && (
                <button
                  className="clear-field-btn"
                  onClick={() => clearField("release_id")}
                  title="Clear release filter"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </label>
          <div className="multi-select-container">
            <label key="no-release" className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.release_id.includes("no-release")}
                onChange={() =>
                  handleMultiSelectChange("release_id", "no-release")
                }
              />
              <span className="checkbox-text">No Release</span>
            </label>
            {releases.map((release) => (
              <label key={release.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.release_id.includes(release.id)}
                  onChange={() =>
                    handleMultiSelectChange("release_id", release.id)
                  }
                />
                <span className="checkbox-text">{release.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
