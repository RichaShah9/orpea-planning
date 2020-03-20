import React from "react";
import moment from "moment";
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
  },
  typography: {
    fontSize: 20
  },
  button: {
    border: "1px solid lightgray",
    borderRadius: 10,
    padding: 8,
    width: 60
  },
  container: { padding: "25px 0px" },
  header: {
    marginTop: 10,
    paddingRight: 20
  }
}));

function DateHandler({ onPrevious = () => {}, onNext = () => {}, date }) {
  const classes = useStyles();
  return (
    <Grid
      container
      alignItems="center"
      justify="space-between"
      className={classes.container}
    >
      <Grid item xs={1}>
        <IconButton onClick={onPrevious} className={classes.button}>
          <PreviousIcon />
        </IconButton>
      </Grid>
      <Grid item xs={10} align="center">
        <Typography className={classes.typography}>
          {moment(date, "DD-MM-YYYY").format("DD/MM/YYYY")}
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={onNext} className={classes.button}>
          <NextIcon />
        </IconButton>
      </Grid>
      <Grid item xs={12} className={classes.header}>
        <Grid container justify="space-between">
          {new Array(15).fill(0).map((_, i) => (
            <Grid item key={i} className={classes.hour}>
              <Typography style={{ color: "gray" }}>{i + 8}</Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default DateHandler;
