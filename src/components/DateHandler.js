import React from "react";
import { IconButton, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import PreviousIcon from "@material-ui/icons/NavigateBefore";
import NextIcon from "@material-ui/icons/NavigateNext";

const useStyles = makeStyles(theme => ({
  hour: {
    height: 20,
    width: 20,
    display: "inline-block",
    margin: 1,
    textAlign: "center"
  }
}));

function DateHandler({ onPrevious = () => {}, onNext = () => {}, date }) {
  const classes = useStyles();
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
      <Grid item xs={12}>
        <Grid container justify="space-between">
          {new Array(15).fill(0).map((_, i) => (
            <Grid item key={i} className={classes.hour}>
              <Typography>{i + 8}</Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default DateHandler;
