import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { useState } from "react";

import { capitalize, getMarkerFromType } from "../../utils";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: "0 16px",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(4n + 1)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function Row(props: { row: ReturnType<typeof createData> }) {
  const { index, marker, meta } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <StyledTableRow>
        <StyledTableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell align="center">
          {Math.ceil(marker.distance / meta.kmPerDay) === 0
            ? 1
            : Math.ceil(marker.distance / meta.kmPerDay)}
        </StyledTableCell>
        <StyledTableCell>{marker.name}</StyledTableCell>
        <StyledTableCell>km {marker.distance}</StyledTableCell>
        <StyledTableCell>
          <FontAwesomeIcon
            icon={getMarkerFromType(marker.type).icon}
            color="#e4e5e6"
          />{" "}
          {capitalize(marker.label)}
        </StyledTableCell>
      </StyledTableRow>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          "&:last-child td, &:last-child th": { border: 0 },
        }}
      >
        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="gpx">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Latitude</StyledTableCell>
                    <StyledTableCell>Longitude</StyledTableCell>
                    <StyledTableCell>Lien OpenStreetMap</StyledTableCell>
                    <StyledTableCell>Téléphone</StyledTableCell>
                    <StyledTableCell>Adresse email</StyledTableCell>
                    <StyledTableCell>Site internet</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={`collapse-${index}`}>
                    <StyledTableCell>{marker.lat}</StyledTableCell>
                    <StyledTableCell>{marker.lon}</StyledTableCell>
                    <StyledTableCell>
                      <a
                        href={`https://www.openstreetmap.org/${marker.osmType}/${marker.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {marker.id}
                      </a>
                    </StyledTableCell>
                    <StyledTableCell>{marker?.phone}</StyledTableCell>
                    <StyledTableCell>{marker.email}</StyledTableCell>
                    <StyledTableCell>
                      <a href={marker.website} target="_blank" rel="noreferrer">
                        {marker.website}
                      </a>
                    </StyledTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </StyledTableCell>
      </TableRow>
    </>
  );
}

const Planner = ({ gpx, markers, meta, selectedFilters }) => {
  const points = gpx.tracks[0].points;
  // TODO: Remove it ?
  const cumulDistances = [
    0,
    ...gpx.calculDistance(gpx.tracks[0].points).cumul.slice(0, -1),
  ];
  const data = cumulDistances.map((item, index) => ({
    distance: Math.floor(item / 1000),
    elevation: points[index].ele,
  }));

  markers = markers
    .map((marker) => {
      const closestPoint = points.reduce(
        (accumulator, currentValue, index) =>
          gpx.calcDistanceBetween(currentValue, marker) < accumulator.distance
            ? {
                distance: gpx.calcDistanceBetween(currentValue, marker),
                point: currentValue,
                index,
              }
            : accumulator,
        {
          distance: gpx.tracks[0].distance.total,
          point: points[points.length - 1],
          index: points.length - 1,
        }
      );
      const redPoint = data[closestPoint.index];
      return { ...marker, distance: redPoint.distance };
    })
    .sort((a, b) => a.distance - b.distance);

  return (
    <Grid className="planner" container style={{ overflow: "hidden" }}>
      <TableContainer component={Paper} sx={{ maxHeight: 700 }}>
        <Table
          aria-label="a planner table"
          size="small"
          stickyHeader
          style={{ width: "100%" }}
        >
          <TableHead>
            <TableRow>
              <StyledTableCell />
              <StyledTableCell>Jour</StyledTableCell>
              <StyledTableCell>Nom</StyledTableCell>
              <StyledTableCell>Distance du départ</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {markers
              .filter((marker) => selectedFilters.includes(marker.type))
              .map((marker, index) => (
                <Row index={index} key={index} marker={marker} meta={meta} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default Planner;
