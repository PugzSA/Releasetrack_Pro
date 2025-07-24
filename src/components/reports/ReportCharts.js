import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import "./ReportCharts.css";

const ReportCharts = ({ chartData, reportType }) => {
  // Common chart theme
  const chartTheme = {
    background: "transparent",
    text: {
      fontSize: 12,
      fill: "#495057",
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    axis: {
      domain: {
        line: {
          stroke: "#e9ecef",
          strokeWidth: 1,
        },
      },
      legend: {
        text: {
          fontSize: 12,
          fill: "#495057",
          fontWeight: 500,
        },
      },
      ticks: {
        line: {
          stroke: "#e9ecef",
          strokeWidth: 1,
        },
        text: {
          fontSize: 11,
          fill: "#6c757d",
        },
      },
    },
    grid: {
      line: {
        stroke: "#f8f9fa",
        strokeWidth: 1,
      },
    },
    tooltip: {
      container: {
        background: "white",
        color: "#495057",
        fontSize: "12px",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e9ecef",
      },
    },
  };

  // Color schemes
  const colorSchemes = {
    priority: ["#dc3545", "#ffc107", "#28a745"], // High, Medium, Low
    status: ["#6c757d", "#007bff", "#ffc107", "#28a745", "#17a2b8"],
    type: ["#007bff", "#dc3545", "#28a745", "#ffc107"],
    default: [
      "#007bff",
      "#28a745",
      "#ffc107",
      "#dc3545",
      "#17a2b8",
      "#6f42c1",
      "#fd7e14",
      "#20c997",
    ],
  };

  const getColors = (dataType) => {
    return colorSchemes[dataType] || colorSchemes.default;
  };

  // Chart components
  const TypeDistributionChart = () => (
    <div className="chart-container">
      <h6 className="chart-title">Ticket Distribution by Type</h6>
      <div className="chart-wrapper" style={{ height: "300px" }}>
        <ResponsivePie
          data={chartData.typeDistribution}
          theme={chartTheme}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={getColors("type")}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#495057"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          legends={[
            {
              anchor: "left",
              direction: "column",
              justify: false,
              translateX: -60,
              translateY: 0,
              itemsSpacing: 8,
              itemWidth: 100,
              itemHeight: 20,
              itemTextColor: "#495057",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
            },
          ]}
        />
      </div>
    </div>
  );

  const PriorityDistributionChart = () => (
    <div className="chart-container">
      <h6 className="chart-title">Priority Distribution</h6>
      <div className="chart-wrapper" style={{ height: "300px" }}>
        <ResponsivePie
          data={chartData.priorityDistribution}
          theme={chartTheme}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={getColors("priority")}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#495057"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          legends={[
            {
              anchor: "left",
              direction: "column",
              justify: false,
              translateX: -60,
              translateY: 0,
              itemsSpacing: 8,
              itemWidth: 100,
              itemHeight: 20,
              itemTextColor: "#495057",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
            },
          ]}
        />
      </div>
    </div>
  );

  const StatusOverviewChart = () => (
    <div className="chart-container">
      <h6 className="chart-title">Status Overview</h6>
      <div className="chart-wrapper" style={{ height: "350px" }}>
        <ResponsiveBar
          data={chartData.statusDistribution}
          theme={chartTheme}
          keys={["Count"]}
          indexBy="Status"
          margin={{ top: 50, right: 180, bottom: 120, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={getColors("status")}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Status",
            legendPosition: "end",
            legendOffset: 60,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Count",
            legendPosition: "middle",
            legendOffset: -40,
            format: (value) => (Math.floor(value) === value ? value : ""),
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      </div>
    </div>
  );

  const AssigneeWorkloadChart = () => (
    <div className="chart-container">
      <h6 className="chart-title">Top Assignees by Workload</h6>
      <div className="chart-wrapper" style={{ height: "350px" }}>
        <ResponsiveBar
          data={chartData.assigneeWorkload}
          theme={chartTheme}
          keys={["Tickets"]}
          indexBy="Assignee"
          margin={{ top: 50, right: 180, bottom: 100, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={getColors("default")}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Assignee",
            legendPosition: "end",
            legendOffset: 60,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Tickets",
            legendPosition: "middle",
            legendOffset: -40,
            format: (value) => (Math.floor(value) === value ? value : ""),
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      </div>
    </div>
  );

  const ReleaseDistributionChart = () => (
    <div className="chart-container">
      <h6 className="chart-title">Tickets by Release</h6>
      <div className="chart-wrapper" style={{ height: "350px" }}>
        <ResponsiveBar
          data={chartData.releaseDistribution}
          theme={chartTheme}
          keys={["Tickets"]}
          indexBy="Release"
          margin={{ top: 50, right: 180, bottom: 100, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={getColors("default")}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Release",
            legendPosition: "end",
            legendOffset: 60,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Tickets",
            legendPosition: "middle",
            legendOffset: -40,
            format: (value) => (Math.floor(value) === value ? value : ""),
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      </div>
    </div>
  );

  // Format month for display (YYYY-MM to "MMM YYYY")
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const TimelineChart = () => (
    <div className="chart-container full-width">
      <h6 className="chart-title">Ticket Timeline (Created vs Resolved)</h6>
      <div className="chart-wrapper" style={{ height: "400px" }}>
        <ResponsiveLine
          data={chartData.timelineData}
          theme={chartTheme}
          margin={{ top: 50, right: 110, bottom: 70, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.0f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Month",
            legendOffset: 60,
            legendPosition: "middle",
            format: formatMonth,
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Count",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          colors={["#007bff", "#28a745"]}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );

  // Render charts based on report type
  const renderCharts = () => {
    switch (reportType) {
      case "ticket_analysis":
        return (
          <>
            <div className="charts-row">
              <TypeDistributionChart />
              <PriorityDistributionChart />
            </div>
            <div className="charts-row">
              <StatusOverviewChart />
              <AssigneeWorkloadChart />
            </div>
            <TimelineChart />
          </>
        );
      case "assignee_workload":
        return (
          <>
            <AssigneeWorkloadChart />
            <div className="charts-row">
              <StatusOverviewChart />
              <PriorityDistributionChart />
            </div>
          </>
        );
      case "release_summary":
        return (
          <>
            <ReleaseDistributionChart />
            <div className="charts-row">
              <StatusOverviewChart />
              <TypeDistributionChart />
            </div>
          </>
        );
      case "priority_trends":
        return (
          <>
            <div className="charts-row">
              <PriorityDistributionChart />
              <StatusOverviewChart />
            </div>
            <TimelineChart />
          </>
        );
      case "status_overview":
        return (
          <>
            <StatusOverviewChart />
            <div className="charts-row">
              <TypeDistributionChart />
              <AssigneeWorkloadChart />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="charts-row">
              <TypeDistributionChart />
              <PriorityDistributionChart />
            </div>
            <div className="charts-row">
              <StatusOverviewChart />
              <AssigneeWorkloadChart />
            </div>
            <TimelineChart />
          </>
        );
    }
  };

  return <div className="report-charts-container">{renderCharts()}</div>;
};

export default ReportCharts;
