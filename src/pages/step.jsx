import { Box, Breadcrumbs, Grid, Link, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";

import Overview from "../components/overview";
import data from "../data/data.json";

const Step = () => {
  const params = useParams();

  const [gpx, setGpx] = useState();
  const [meta, setMeta] = useState(data?.[params?.id] ?? {});

  return (
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
              <Typography>{params.step}</Typography>
            </Breadcrumbs>
          </Grid>
        </Grid>
      </Box>
      <Overview gpx={gpx} meta={meta} setMeta={setMeta} />
    </>
  );
};

export default Step;
