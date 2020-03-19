import React from "react";
import { IconButton, Grid, Typography } from "@material-ui/core";

import PreviousIcon from "@material-ui/icons/NavigateBefore";
import NextIcon from "@material-ui/icons/NavigateNext";

function DateHandler({ onPrevious = () => {}, onNext = () => {}, date }) {
  return (
    <Grid container alignItems="center" justify="space-between">
      <Grid item xs={1}>
        <IconButton onClick={onPrevious}>
          <PreviousIcon />
        </IconButton>
      </Grid>
      <Grid item xs={10} align="center">
        <Typography>{date}</Typography>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={onNext}>
          <NextIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default DateHandler;
