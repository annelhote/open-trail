import { Grid2 } from "@mui/material";
import * as d3 from "d3";
import React, { useEffect } from "react";

const Profile = ({ gpxs }) => {
  const createGraph = async () => {
    const points = gpxs.map((gpx) => gpx.tracks[0].points).flat();
    const cumulDistances = [
      0,
      ...gpxs[0].calculDistance(points).cumul.slice(0, -1),
    ];
    const data = cumulDistances.map((item, index) => ({
      distance: item / 1000,
      elevation: points[index].ele,
    }));

    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 925 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    d3.select(".svg").selectAll("g").remove();
    // Append the svg object to the body of the page
    const svg = d3
      .select(".svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 925 200")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add X axis and Y axis
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    x.domain(d3.extent(data, (d) => d.distance));
    y.domain([0, d3.max(data, (d) => d.elevation)]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => `${d} km`));
    svg.append("g").call(d3.axisLeft(y));

    // Add the profile line
    const elevationLine = d3
      .line()
      .x((d) => x(d.distance))
      .y((d) => y(d.elevation))
      .curve(d3.curveNatural);
    svg
      .append("path")
      .data([data])
      .attr("class", "line")
      .attr("fill", "transparent")
      .attr("stroke", "#e4e5e6")
      .attr("stroke-width", 1.5)
      .attr("d", elevationLine);
  };

  useEffect(() => {
    if (gpxs.length > 0) {
      createGraph();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpxs.length]);

  return (
    <Grid2 className="profile" size={{ xs: 12 }}>
      <svg className="svg"></svg>
    </Grid2>
  );
};

export default Profile;
