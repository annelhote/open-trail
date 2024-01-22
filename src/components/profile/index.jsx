import * as d3 from 'd3';
import React, { useEffect } from 'react';

const Profile = ({ gpx }) => {
  const createGraph = async () => {
    const points = gpx.tracks[0].points;
    const data = [];
    const cumulDistances = [0, ...gpx.calculDistance(gpx.tracks[0].points).cumul.slice(0, -1)];
    cumulDistances.forEach((item, index) => {
      data.push({ date: Math.floor(item / 1000), value: points[index].ele })
    });

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 50, left: 70 },
      width = 1500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
    // append the svg object to the body of the page
    var svg = d3.select(".svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},     ${margin.top})`);

    // Add X axis and Y axis
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    x.domain(d3.extent(data, (d) => { return d.date; }));
    y.domain([0, d3.max(data, (d) => { return d.value; })]);
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => `${d} km`));
    svg.append("g")
      .call(d3.axisLeft(y));

    // add the Line
    var valueLine = d3.line()
      .x((d) => { return x(d.date); })
      .y((d) => { return y(d.value); });
    svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("fill", "#d0d1d0")
      .attr("stroke", "#d0d1d0")
      .attr("stroke-width", 1.5)
      .attr("d", valueLine)
  }

  useEffect(() => {
    createGraph();
  }, []);

  return (
    <svg className='svg'></svg>
  );
};

export default Profile;