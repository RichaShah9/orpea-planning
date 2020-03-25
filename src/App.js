import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import MonthView from "./MonthView";
import "./App.css";

const useStyles = makeStyles(() => ({
  main: {
    overflow: "auto",
    height: "100%"
  }
}));

function App() {
  const classes = useStyles();
  return (
    <div className={classes.main}>
      <MonthView />
    </div>
  );
}

export default App;
