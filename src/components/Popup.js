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
      {
        popupText &&
        <Typography gutterBottom>
          <b>Remplacé par :</b> {popupText}
        </Typography>
      }
      {
        text &&
        <Typography gutterBottom>
          <b>Info :</b> {text}
        </Typography>
      }
      {!disableCheckbox && (
        <>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={({ target: { checked } }) => onChecked(checked)}
                name="checkedA"
              />
            }
            label="Absent"
          />
          {checked && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px 0"
              }}
            >
              <Select
                value={selectValue}
                onChange={({ target: { value } }) => onSelect(value)}
              >
                {["Congé payé", "Congé sans solde", "Arrêt Maladie"].map(v => (
                  <MenuItem value={v} key={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
              <Button
                style={{ padding: "0px 2px", width: "60%", marginTop: 10 }}
                size="small"
                variant="outlined"
                color="default"
                onClick={onValidate}
              >
                Valider
              </Button>
            </div>
          )}
        </>
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
  popupText= ""
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
    onAbsent(selectValue)
  }, [onAbsent, selectValue])

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
          disableCheckbox={colorProp !== '#7fbc64'}
          onValidate={onValidate}
          popupText={popupText}
          text={text}
        />
      </Popover>
    </>
  );
}

Popup.defaultProps = {
  TableCell
};

export default Popup;
