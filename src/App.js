import React from "react";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import {
  IconButton,
  Typography,
  Button,
  Table,
  TableCell as MuiTableCell,
  TableHead,
  TableRow,
  TableBody,
  TextField,
  // FormControlLabel,
  // Select,
  CircularProgress
} from "@material-ui/core";
import {
  AddCircle,
  RemoveCircle,
  Refresh as RefreshIcon,
  NavigateBefore as PreviousIcon,
  NavigateNext as NextIcon,
  Add as AddIcon
} from "@material-ui/icons";
import cs from "classnames";

import Popup from "./components/Popup";
import AxelorService from "./service/axelor.rest";
import LineForm from "./LineForm";

import "./App.css";

const profileService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.ProfileDay"
});
const employeeService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.EmployeeDay"
});

const TableCell = React.forwardRef(({ children, style = {}, ...rest }, ref) => (
  <MuiTableCell ref={ref} {...rest} style={{ ...style, padding: "1px 0px" }}>
    {children}
  </MuiTableCell>
));

const useStyles = makeStyles(() => ({
  main: {
    overflow: "auto",
    height: "100%"
  },
  container: {
    padding: 20,
    height: "100%",
    overflow: "hidden"
  },
  treeView: {
    padding: "0px 20px 20px 20px",
    width: "100%",
    height: "calc(100% - 150px)",
    overflow: "overlay"
  },
  hidden: {
    display: "none"
  },
  tableCell: {
    padding: "6px 16px",
    textAlign: "center"
  },
  firstColumnCell: {
    position: "sticky",
    top: 0,
    left: 0,
    zIndex: 2,
    width: 300,
    background: "#f9f9fc",
    border: "1px solid #eeeeee !important"
  },
  fixCell: {
    position: "sticky",
    top: -1,
    zIndex: 1,
    background: "#f9f9fc",
    border: "1px solid #eeeeee !important"
  },
  inputCell: {
    padding: 0
  },
  input: {
    padding: "2px 1px"
  },
  topCell: {
    position: "sticky",
    left: 0,
    zIndex: 10,
    background: "#f9f9fc",
    border: "1px solid #eeeeee"
  }
}));

function getColorFields() {
  const fields = [];
  for (let i = 8; i <= 22; i++) {
    fields.push(`h${i}ColorSelect`);
  }
  return fields;
}

function TableEmployee({ employee, profile, hidden, onChange }) {
  const classes = useStyles();
  const onEmployeeChange = React.useCallback(
    (key, value) => {
      employeeService
        .save({
          id: employee.id,
          version: employee.version,
          [key]: value
        })
        .then(res => {
          if (res.data) {
            onChange({
              employeeId: employee.id,
              version: res.data[0] && res.data[0].version,
              key,
              value
            });
          }
        });
    },
    [employee, onChange]
  );
  return (
    <>
      <TableRow className={cs({ [classes.hidden]: hidden })}>
        <TableCell colSpan={2} className={classes.firstColumnCell}>
          <Typography
            style={{ paddingLeft: 8, marginLeft: 55 }}
            noWrap
            title={employee.name}
          >
            {employee.name}
          </Typography>
        </TableCell>
        {getColorFields().map((key, i) => (
          <Popup
            TableCell={TableCell}
            key={i}
            color={employee[key]}
            profile={profile}
            employee={employee}
            onColorChange={color => onEmployeeChange(key, color)}
          />
        ))}
        <TableCell />
      </TableRow>
    </>
  );
}

function TableProfile({ profile, hidden, onChange }) {
  const [collapsed, setCollapsed] = React.useState(false);

  const onClick = React.useCallback(() => {
    setCollapsed(c => !c);
  }, []);

  const Icon = collapsed ? AddCircle : RemoveCircle;
  const color = collapsed ? "green" : "#2f4050";

  const { employees = [] } = profile;
  const onProfileChange = React.useCallback(
    (key, value) => {
      profileService
        .save({
          id: profile.id,
          version: profile.version,
          [key]: value
        })
        .then(res => {
          if (res.data) {
            onChange({
              version: res.data[0] && res.data[0].version,
              profileId: profile.id,
              key,
              value
            });
          }
        });
    },
    [profile, onChange]
  );

  const classes = useStyles();
  return (
    <>
      <TableRow className={cs({ [classes.hidden]: hidden })}>
        <TableCell
          onClick={onClick}
          colSpan={2}
          style={{ cursor: "pointer", textAlign: "center" }}
          className={classes.firstColumnCell}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: 20
            }}
          >
            &nbsp;
            <Icon style={{ fontSize: "1rem", color }} />
            <Typography style={{ paddingLeft: 8 }} title={profile.name} noWrap>
              {profile.name}
            </Typography>
          </div>
        </TableCell>
        {getColorFields().map((key, i) => (
          <Popup
            TableCell={TableCell}
            key={i}
            color={profile[key]}
            profile={profile}
            onColorChange={color => onProfileChange(key, color)}
          />
        ))}
        <TableCell />
      </TableRow>
      {employees.map((employee, i) => (
        <TableEmployee
          employee={employee}
          profile={profile}
          key={i}
          hidden={collapsed || hidden}
          onChange={params => onChange({ ...params, profileId: profile.id })}
        />
      ))}
    </>
  );
}

function TableService({ service, onChange }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { profiles = [] } = service;
  const classes = useStyles();

  const onClick = React.useCallback(() => {
    setCollapsed(c => !c);
  }, []);

  const Icon = collapsed ? AddCircle : RemoveCircle;
  const color = collapsed ? "green" : "#2f4050";

  return (
    <>
      <TableRow>
        <TableCell
          onClick={onClick}
          style={{ cursor: "pointer" }}
          className={classes.firstColumnCell}
          colSpan={2}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center"
            }}
          >
            &nbsp;
            <Icon style={{ fontSize: "1rem", color, marginLeft: 5 }} />
            <Typography style={{ paddingLeft: 8 }} noWrap title={service.name}>
              {service.name}
            </Typography>
          </div>
        </TableCell>
        <TableCell colSpan={16} />
      </TableRow>
      {profiles.map((profile, i) => (
        <TableProfile
          onChange={params => onChange({ serviceId: service.id, ...params })}
          profile={profile}
          key={i}
          hidden={collapsed}
        />
      ))}
    </>
  );
}

function TableView() {
  const [data, setData] = React.useState([]);
  const classes = useStyles();
  const [date, setDate] = React.useState(
    moment(new Date()).format("DD-MM-YYYY")
  );
  const [isLoading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const fetchData = React.useCallback(() => {
    setLoading(true);
    const profileFields = [
      "service",
      "employmentContract",
      "dayDate",
      "profile",
      ...getColorFields()
    ];
    const employeeFields = [...profileFields, "profile"];
    const data = {
      criteria: [
        {
          fieldName: "dayDate",
          operator: "=",
          value: moment(date, "DD-MM-YYYY").format("YYYY-MM-DD")
        }
      ]
    };
    const serviceList = [];
    const getServiceIndex = serviceId => {
      return serviceList.findIndex(s => s.id === serviceId);
    };
    const getProfileIndex = (list, profileId) => {
      return list.findIndex(p => p.id === profileId);
    };

    profileService.search({ fields: profileFields, data }).then(res => {
      employeeService
        .search({ fields: employeeFields, data })
        .then(employeeResponse => {
          if (!res || !employeeResponse) {
            setLoading(false);
            return;
          }
          const { data = [] } = res;
          const { data: employeeData = [] } = employeeResponse;
          const getProfile = profile => {
            const _profile = data.find(p => p.profile.id === profile.id) || {};
            const profileObject = {
              ..._profile,
              name: profile.name,
              employees: []
            };
            delete profileObject.profile;
            delete profileObject.service;
            return profileObject;
          };

          employeeData.forEach(employee => {
            const serviceIndex = getServiceIndex(employee.service.id);
            const service =
              serviceIndex === -1
                ? {
                    name: employee.service.name,
                    id: employee.service.id,
                    profiles: []
                  }
                : serviceList[serviceIndex];

            const profileIndex = getProfileIndex(
              service.profiles,
              employee.profile.id
            );
            const profile =
              profileIndex === -1
                ? getProfile(employee.profile)
                : service.profiles[profileIndex];
            const empObject = {
              name:
                employee.employmentContract &&
                employee.employmentContract.fullName,
              ...employee
            };
            delete empObject.employee;
            delete empObject.profile;
            delete empObject.service;
            profile.employees.push({
              ...empObject
            });
            if (profileIndex !== -1) {
              service.profiles[profileIndex] = { ...profile };
            } else {
              service.profiles.push({ ...profile });
            }
            if (serviceIndex !== -1) {
              serviceList[serviceIndex] = { ...service };
            } else {
              serviceList.push({ ...service });
            }
          });
          setData(serviceList);
          setLoading(false);
        });
    });
  }, [date]);

  const onPrevious = React.useCallback(() => {
    setDate(
      moment(date, "DD-MM-YYYY")
        .subtract(1, "days")
        .format("DD-MM-YYYY")
    );
  }, [date]);

  const onNext = React.useCallback(() => {
    setDate(
      moment(date, "DD-MM-YYYY")
        .add(1, "days")
        .format("DD-MM-YYYY")
    );
  }, [date]);

  const onRefresh = React.useCallback(() => {
    fetchData();
  }, [fetchData]);

  const toggleDialog = React.useCallback(
    (shouldRefresh = false) => {
      setOpen(!open);
      if (shouldRefresh === true) {
        onRefresh();
      }
    },
    [open, onRefresh]
  );

  const onChange = React.useCallback(record => {
    setData(data => {
      const serviceIndex = data.findIndex(s => s.id === record.serviceId);
      const service = data[serviceIndex];
      const profileIndex = service.profiles.findIndex(
        p => p.id === record.profileId
      );
      const profile = service.profiles[profileIndex];
      if (record.employeeId) {
        const employeeIndex = profile.employees.findIndex(
          p => p.id === record.employeeId
        );
        profile.employees[employeeIndex] = {
          ...profile.employees[employeeIndex],
          version: record.version,
          [record.key]: record.value
        };
      } else {
        profile[record.key] = record.value;
        profile["version"] = record.version;
      }
      service.profiles[profileIndex] = { ...profile };
      data[serviceIndex] = { ...service };
      return [...data];
    });
  }, []);

  const updatePlanning = React.useCallback(
    (input, date) => {
      const data = {
        action:
          "com.axelor.apps.orpea.planning.web.EmploymentContractController:updatePlanning",
        data: {
          value: Number(input),
          date: moment(date, "DD-MM-YYYY").format("YYYY-MM-DD")
        }
      };
      employeeService.action(data).then(res => {
        if (res && res.data && res.data[0].reload) {
          onRefresh();
        }
      });
    },
    [onRefresh]
  );

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Table
      border="1"
      style={{ width: "100%", tableLayout: "fixed" }}
      size="small"
    >
      <TableHead>
        <TableRow>
          <TableCell
            align="center"
            colSpan={2}
            style={{
              top: -1
            }}
            className={classes.topCell}
            width="300px"
          >
            <Button
              style={{
                padding: "0px 2px"
              }}
              size="small"
              variant="outlined"
              color="default"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
            <Button
              style={{ padding: "0px 2px", marginLeft: 10 }}
              size="small"
              variant="outlined"
              color="default"
              startIcon={<AddIcon />}
              onClick={toggleDialog}
            >
              Ajouter employé
            </Button>
          </TableCell>
          <TableCell colSpan={4} width="160px" className={classes.fixCell}>
            <TextField
              className={classes.inputCell}
              variant="outlined"
              type="number"
              InputProps={{
                classes: {
                  input: classes.input
                }
              }}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  updatePlanning(e.target.value, date);
                  e.preventDefault();
                }
              }}
            />
          </TableCell>
          <TableCell
            className={cs(classes.tableCell, classes.fixCell)}
            width="40px"
          >
            <IconButton
              size="small"
              style={{ padding: 0 }}
              onClick={onPrevious}
            >
              <PreviousIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell colSpan={5} width="200px" className={classes.fixCell}>
            <Typography align="center">
              <b>{date}</b>
            </Typography>
          </TableCell>
          <TableCell
            className={cs(classes.tableCell, classes.fixCell)}
            width="40px"
          >
            <IconButton size="small" style={{ padding: 0 }} onClick={onNext}>
              <NextIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell
            colSpan={4}
            width="160px"
            className={classes.fixCell}
            style={{ textAlign: "center" }}
          ></TableCell>
          <TableCell className={classes.fixCell}></TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            align="center"
            colSpan={2}
            className={classes.topCell}
            style={{
              top: 25
            }}
            width="300px"
          ></TableCell>
          {new Array(15).fill(0).map((_, i) => (
            <TableCell
              key={i}
              style={{ padding: "6px 16px", top: 25 }}
              className={classes.fixCell}
            >
              <Typography style={{ textAlign: "center" }}>
                <b>{("0" + (i + 8)).slice(-2)}</b>
              </Typography>
            </TableCell>
          ))}
          <TableCell
            className={classes.fixCell}
            style={{ top: 25 }}
          ></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {!isLoading ? (
          data.map((serivce, i) => (
            <TableService service={serivce} key={i} onChange={onChange} />
          ))
        ) : (
          <div
            style={{
              width: "100%",
              alignSelf: "center",
              position: "absolute",
              textAlign: "center",
              padding: 25
            }}
          >
            <CircularProgress />
          </div>
        )}
      </TableBody>
      <LineForm handleClose={toggleDialog} open={open} date={date} />
    </Table>
  );
}

function App() {
  const classes = useStyles();
  return (
    <div className={classes.main}>
      <TableView />
    </div>
  );
}

export default App;
