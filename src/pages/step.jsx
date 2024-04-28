import { Box, Breadcrumbs, Grid, Link, Typography } from "@mui/material";
import gpxParser from "gpxparser";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MyMap from "../components/map";
import Overview from "../components/overview";
import data from "../data/data.json";
import gpxCheminDassise from "../data/chemin-d-assise-01.gpx";
import gpxGr38 from "../data/gr38.gpx";
import gpxLaChapelleEnVercorsLePoet from "../data/la-chapelle-en-vercors-le-poet.gpx";
import gpxNantesEchalas from "../data/nantes-echalas.gpx";
import gpxPicosDeEuropa from "../data/picos-de-europa.gpx";
import gpxTourDuQueyras from "../data/tour-du-queyras.gpx";
import { getClosestPointIndexByDistance, overloadGpx } from "../utils";

const Step = () => {
  const params = useParams();

  // TODO: Calculate gpx file
  const [gpx, setGpx] = useState();
  const [meta, setMeta] = useState(data?.[params?.id] ?? {});

  const gpxes = {
    "chemin-d-assise-01": gpxCheminDassise,
    gr38: gpxGr38,
    "le-poet-sigillat": gpxLaChapelleEnVercorsLePoet,
    "nantes-echalas": gpxNantesEchalas,
    "picos-de-europa": gpxPicosDeEuropa,
    "tour-du-queyras": gpxTourDuQueyras,
  };
  meta.gpx = gpxes[params?.id];
  meta.kmPerDay = meta?.kmPerDay ?? 25;

  useEffect(() => {
    fetch(meta?.gpx)
      .then((res) => res.text())
      .then((xml) => {
        let newGpx = new gpxParser();
        newGpx.parse(xml);
        newGpx = overloadGpx(newGpx);
        // TODO: Do it in the trail page in order to avoid duplicated code
        // Calculate number of days in trail
        const duration = Math.ceil(
          newGpx.tracks[0].distance.totalItra / 1000 / meta.kmPerDay
        );
        const days = [...Array(duration).keys()];
        // Determinates each step
        const cumulDistances = [0, ...newGpx.tracks[0].distance.cumulItra];
        const gpxs = days.map((day) => {
          const startPointIndex = getClosestPointIndexByDistance({
            cumulDistances,
            distance: meta.kmPerDay * 1000 * day,
          });
          const endPointIndex = getClosestPointIndexByDistance({
            cumulDistances,
            distance: meta.kmPerDay * 1000 * (day + 1),
          });
          const trkpts = newGpx.tracks[0].points
            .slice(startPointIndex, endPointIndex + 1)
            .map(
              (point) =>
                `<trkpt lat="${point.lat}" lon="${point.lon}"><ele>${point.ele}</ele></trkpt>`
            );
          let partGpx = new gpxParser();
          partGpx.parse(
            `<xml><gpx><trk><trkseg>${trkpts}</trkseg></trk></gpx></xml>`
          );
          partGpx = overloadGpx(partGpx);
          return partGpx;
        });
        setGpx(gpxs[params?.step]);
      })
      .catch((e) => console.error(e));
  }, [meta?.gpx, meta.kmPerDay, params?.step]);

  return (
    <>
      {gpx && (
        <>
          <Box className="open-trail" sx={{ flexGrow: 0.75 }}>
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, sm: 8, md: 12 }}
            >
              <Grid item xs={12}>
                <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
                  <Link underline="hover" color="inherit" href="#">
                    Open Trails
                  </Link>
                  <Link underline="hover" color="inherit" href="#/trails">
                    Trails
                  </Link>
                  <Link
                    color="inherit"
                    href={`#/trails/${params.id}`}
                    underline="hover"
                  >
                    {meta.name}
                  </Link>
                  <Typography>
                    Jour {params.step}
                  </Typography>
                </Breadcrumbs>
              </Grid>
              <Overview gpx={gpx} meta={meta} setMeta={setMeta} />
              <MyMap
                gpx={gpx}
                // coordinates={coordinates}
                markers={[]}
                meta={meta}
                // selectedFilters={selectedFilters}
                // setCoordinates={setCoordinates}
              />
            </Grid>
          </Box>
        </>
      )}
    </>
  );
};

export default Step;
