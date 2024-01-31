import * as d3 from 'd3';
import React, { useEffect } from 'react';

const Profile = ({ coordinates, gpx }) => {
  const createGraph = async () => {
    const points = gpx.tracks[0].points;
    const cumulDistances = [0, ...gpx.calculDistance(gpx.tracks[0].points).cumul.slice(0, -1)];
    const data = cumulDistances.map((item, index) => ({ distance: Math.floor(item / 1000), elevation: points[index].ele }));

    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 925 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    // Append the svg object to the body of the page
    const svg = d3.select('.svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add X axis and Y axis
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    x.domain(d3.extent(data, (d) => d.distance));
    y.domain([0, d3.max(data, (d) => d.elevation)]);
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => `${d} km`));
    svg.append('g')
      .call(d3.axisLeft(y));

    // Add the profile line
    const elevationLine = d3.line()
      .x((d) => x(d.distance))
      .y((d) => y(d.elevation))
      .curve(d3.curveCardinal);
    svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('fill', '#e4e5e6')
      .attr('stroke', '#e4e5e6')
      .attr('stroke-width', 1.5)
      .attr('d', elevationLine)

    // Red point
    if (coordinates) {
      const closestPoint = points.reduce(
        (accumulator, currentValue, index) => gpx.calcDistanceBetween(currentValue, coordinates) < accumulator.distance ? { distance: gpx.calcDistanceBetween(currentValue, coordinates), point: currentValue, index } : accumulator,
        { distance: gpx.tracks[0].distance.total, point: points[points.length - 1], index: points.length - 1 },
      );
      const redPoint = data[closestPoint.index];
      svg.append('circle')
        .attr('fill', 'red')
        .attr('cx', x(redPoint.distance))
        .attr('cy', y(redPoint.elevation))
        .attr('r', 7);
    }
  }

  useEffect(() => {
    createGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates]);

  return (
    <svg className='svg'></svg>
  );
};

export default Profile;