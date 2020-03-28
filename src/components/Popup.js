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
  Button,
  TextField 
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import moment from 'moment';
import ColorPicker from "./ColorPicker";
import AxelorService from "./../service/axelor.rest";

const employeeContractService = new AxelorService({
  model: "com.axelor.apps.hr.db.EmploymentContract"
});

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
  enableBlue=false,
  onActionChange,
  action,
  actionData,
  onActionDataChange,
  onActionSave
}) {
  const classes = useStyles();
  const [contractList, setContractList] = React.useState([]);

  React.useEffect(() => {
    const data = {
      // _domain: `self.profile.id=${profile.id} and service=null`,
    };
    if(action === 'Recrutement') {

      employeeContractService.search({fields: ['fullName'], data}).then(res => {
        if(res && res.data) {
          const {data = []} = res;
          setContractList([...data]);
        }
      });
    }
  }, [profile, action])
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
      {enableBlue && (
        <div style={{display: 'flex', flexDirection: 'column', marginBottom: 5}}>
          <Select
            value={action}
            onChange={({ target: { value } }) => onActionChange(value)}
          >
            {["Remplacement", "Recrutement"].map(v => (
              <MenuItem value={v} key={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
          {
            action === 'Remplacement' &&
            <>
              <Typography>Remplaçant</Typography>
              <Select
                value={actionData.substituteContractId || ''}
                onChange={({ target: { value } }) => onActionDataChange('substituteContractId', value)}
              >
                {
                  contractList.map((contract, i) => (
                    <MenuItem value={contract.id} key={i}>{contract.fullName}</MenuItem>
                  ))
                }
              </Select>
            </>
          }
          <Typography>Au</Typography>
          <TextField 
            type="date"   
            value={actionData.to}     
            onChange={(e) => onActionDataChange('to', e.target.value)}    
          />
          <Button
            style={{ padding: "0px 2px", margin: 10 }}
            size="small"
            variant="outlined"
            color="default"
            onClick={onActionSave}
          >
            {action === 'Remplacement' ? 'Remplacer' : 'Demander recrutement'}
          </Button>
        </div>
      )}
      <ColorPicker circleSpacing={12} color={color} onChange={onColorChange} />
    </div>
  );
}

function Popup({
  employee = {},
  profile,
  color: colorProp,
  onColorChange: onColorChangeProp = () => {},
  TableCell,
  text = "",
  style = {},
  disablePopup,
  onAbsent,
  onActionSave,
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
  const [action, setAction] = React.useState("Recrutement");
  const [actionData, setActionData] = React.useState({
    to: moment().format('YYYY-MM-DD'),
    originalContractId: employee.employmentContract ? employee.employmentContract.id : null,
  });
  const onValidate = React.useCallback(() => {
    onAbsent(selectValue)
  }, [onAbsent, selectValue]);

  const onActionDataChange = React.useCallback((key, value) => {
    setActionData(data => {
      return {
        ...data,
        [key]: value
      }
    })
  }, []);
  const handleActionSave = React.useCallback(() => {
    onActionSave({...actionData, action});
  }, [actionData, onActionSave, action]);

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
          enableBlue={colorProp === '#7ba3ed'}
          action={action}
          onActionChange={setAction}
          actionData={actionData}
          onActionDataChange={onActionDataChange}
          onActionSave={handleActionSave}
        />
      </Popover>
    </>
  );
}

Popup.defaultProps = {
  TableCell
};

export default Popup;
