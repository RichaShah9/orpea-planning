import React from "react";
import { Popover, Typography, Tooltip, TableCell } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import ColorPicker from "./ColorPicker";

const useStyles = makeStyles(theme => ({
  popup: {
    height: 20,
    width: 20,
    display: "inline-block",
    margin: 1,
    boxSizing: "border-box",
    "&:hover": {
      border: "2px solid gray !important"
    }
  },
  popupContent: {
    padding: 20,
    backgroundColor: "#EEEEEE",
    borderRadius: 4
  }
}));

function PopupContent({
  employee = {},
  profile = {},
  color,
  onColorChange = () => {}
}) {
  const classes = useStyles();
  return (
    <div className={classes.popupContent}>
      {employee && employee.name && (
        <Typography gutterBottom>
          <b>Employee :</b> {employee.name}
        </Typography>
      )}
      <Typography gutterBottom>
        <b>Profile :</b> {profile.name}
      </Typography>
      <ColorPicker circleSpacing={12} color={color} onChange={onColorChange} />
    </div>
  );
}

function Popup({
  employee,
  profile,
  color: colorProp,
  onColorChange: onColorChangeProp = () => {},
  TableCell,
  text = "",
  style = {}
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [color, setColor] = React.useState(colorProp);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const onColorChange = React.useCallback(
    ({ hex: color }, event) => {
      handleClose();
      setColor(color);
      onColorChangeProp(color, event);
    },
    [onColorChangeProp]
  );

  React.useEffect(() => {
    setColor(colorProp);
  }, [colorProp]);

  let tooltipTitle = "";
  if (profile) tooltipTitle += `Profile: ${profile.name}; `;
  if (employee) tooltipTitle += `Employee: ${employee.name}`;
  return (
    <>
      <Tooltip arrow title={tooltipTitle}>
        <TableCell
          onClick={handleClick}
          style={{ backgroundColor: color, ...style }}
        >
          {text && (
            <Typography align="center" noWrap title={text}>
              {text}
            </Typography>
          )}
        </TableCell>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <PopupContent
          employee={employee}
          profile={profile}
          color={color}
          onColorChange={onColorChange}
        />
      </Popover>
    </>
  );
}

Popup.defaultProps = {
  TableCell
};

export default Popup;
