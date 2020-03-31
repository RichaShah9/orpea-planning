import React from "react";
import {
  Popover,
  Typography,
  Tooltip,
  TableCell,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  Button
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
  },
  leaveButton: {
    alignSelf: "center"
  },
  fieldTitle: {
    paddingTop: 15,
    fontWeight: "bold",
    lineHeight: 0.8
  }
}));

function PopupContent({
  employee = {},
  profile = {},
  color,
  onColorChange = () => {},
  onChecked = () => {},
  checked,
  selectValue,
  onSelect = () => {},
  onValidate = () => {},
  disableCheckbox,
  popupText,
  text,
  employeeNbRequired,
  employeeWorkingNb
}) {
  const classes = useStyles();
  return (
    <div className={classes.popupContent}>
      {employee && employee.name && (
        <Typography gutterBottom>
          <b>Employé :</b> {employee.name}
        </Typography>
      )}
      <Typography gutterBottom>
        <b>Qualification :</b> {profile.name}
      </Typography>
      {popupText && (
        <Typography gutterBottom>
          <b>Remplacé par :</b> {popupText}
        </Typography>
      )}
      {text && (
        <Typography gutterBottom>
          <b>Info :</b> {text}
        </Typography>
      )}
      {![undefined, null].includes(employeeWorkingNb) && (
        <Typography gutterBottom>
          <b>Effectif alloué :</b> {employeeWorkingNb}
        </Typography>
      )}
      {![undefined, null].includes(employeeNbRequired) && (
        <Typography gutterBottom>
          <b>Effectif requis :</b> {employeeNbRequired}
        </Typography>
      )}
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
  style = {},
  disablePopup,
  onAbsent,
  popupText = "",
  employeeNbRequired,
  employeeWorkingNb
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [color, setColor] = React.useState(colorProp);

  const handleClick = event => {
    if (!disablePopup) {
      setAnchorEl(event.currentTarget);
    }
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

  const [checked, setChecked] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState("Congé payé");
  const onValidate = React.useCallback(() => {
    onAbsent(selectValue);
  }, [onAbsent, selectValue]);

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
          checked={checked}
          onChecked={setChecked}
          selectValue={selectValue}
          onSelect={setSelectValue}
          onValidate={onValidate}
          popupText={popupText}
          text={text}
          employeeWorkingNb={employeeWorkingNb}
          employeeNbRequired={employeeNbRequired}
        />
      </Popover>
    </>
  );
}

Popup.defaultProps = {
  TableCell
};

export default Popup;
