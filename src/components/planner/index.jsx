import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Checkbox,
  Collapse,
  Grid2,
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

import { capitalize, getMarkerFromTypeOrName } from "../../utils";

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
  const { handleClick, index, isSelected, marker } = props;
  const [open, setOpen] = useState(false);
  const isItemSelected = isSelected(marker.id);
  const labelId = `enhanced-table-checkbox-${index}`;

  return (
    <>
      <StyledTableRow
        hover
        onClick={(event) => handleClick(event, marker)}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={marker.id}
        selected={isItemSelected}
        sx={{ cursor: "pointer" }}
      >
        <StyledTableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isItemSelected}
            inputProps={{
              "aria-labelledby": labelId,
            }}
          />
        </StyledTableCell>
        <StyledTableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell align="center">{marker.day}</StyledTableCell>
        <StyledTableCell>{marker.name}</StyledTableCell>
        <StyledTableCell>km {marker.distance}</StyledTableCell>
        <StyledTableCell>
          <FontAwesomeIcon
            icon={marker.icon}
            color="#e4e5e6"
          />{" "}
          {capitalize(marker.label)}
        </StyledTableCell>
        <StyledTableCell>
          {marker?.addrCity}
        </StyledTableCell>
        <StyledTableCell>
          {marker?.opening_hours}
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

const Planner = ({ gpx, markers, selectedFilters }) => {
  const [selected, setSelected] = useState([]);

  const handleClick = (_, marker) => {
    const selectedIndex = selected.map((marker) => marker.id).indexOf(marker.id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, marker);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
    gpx.waypoints = newSelected;
  };

  const isSelected = (id) => selected.map((marker) => marker.id).indexOf(id) !== -1;

  return (
    <Grid2 className="planner" container style={{ overflow: "hidden" }}>
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
              <StyledTableCell />
              <StyledTableCell>Jour</StyledTableCell>
              <StyledTableCell>Nom</StyledTableCell>
              <StyledTableCell>Distance du départ</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Ville</StyledTableCell>
              <StyledTableCell>Heures d'ouverture</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {markers
              .filter((marker) => selectedFilters.includes(marker.type))
              .map((marker, index) => (
                <Row handleClick={handleClick} index={index} isSelected={isSelected} key={index} marker={marker} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid2>
  );
};

export default Planner;
