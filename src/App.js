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
  CircularProgress
} from "@material-ui/core";
import {
  AddCircle,
  RemoveCircle,
  Refresh as RefreshIcon,
  NavigateBefore as PreviousIcon,
  NavigateNext as NextIcon
} from "@material-ui/icons";
import cs from "classnames";

import Popup from "./components/Popup";
import AxelorService from "./service/axelor.rest";

import "./App.css";

const profileService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.ProfileDay"
});
const employeeService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.EmployeeDay"
});

const TableCell = React.forwardRef(({ children, style = {}, ...rest }, ref) => (
  <MuiTableCell ref={ref} {...rest} style={{ ...style, padding: "2px 0px" }}>
    {children}
  </MuiTableCell>
));

const useStyles = makeStyles(theme => ({
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
  inputCell: {
    padding: 0
  },
  inputBox: {
    width: "100%",
    border: "none",
    "&:focus": {
      outline: "none"
    }
  },
  input: {
    padding: "10px 5px"
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
              version: res.data[0].version,
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
        <TableCell colSpan={4} style={{ textAlign: "right" }}>
          <Typography noWrap>{employee.name}</Typography>
        </TableCell>
        <TableCell colSpan={2} className={classes.inputCell}>
          <TextField
            variant="outlined"
            type="number"
            InputProps={{
              classes: {
                input: classes.input
              }
            }}
          />
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
              version: res.data[0].version,
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
          colSpan={4}
          style={{ cursor: "pointer", textAlign: "center" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography noWrap>{profile.name}</Typography>&nbsp;
            <Icon style={{ fontSize: "1rem", color }} />
          </div>
        </TableCell>
        <TableCell colSpan={2} className={classes.inputCell}>
          <TextField
            variant="outlined"
            type="number"
            InputProps={{
              classes: {
                input: classes.input
              }
            }}
          />
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
        <TableCell onClick={onClick} style={{ cursor: "pointer" }} colSpan={4}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start"
            }}
          >
            <Typography noWrap>{service.name}</Typography>&nbsp;
            <Icon style={{ fontSize: "1rem", color }} />
          </div>
        </TableCell>
        <TableCell colSpan={2} className={classes.inputCell}>
          <TextField
            variant="outlined"
            type="number"
            InputProps={{
              classes: {
                input: classes.input
              }
            }}
          />
        </TableCell>
        <TableCell colSpan={15} />
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

            const profileIndex = getProfileIndex(service.profiles, employee.id);
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

  const fetchColumn = React.useCallback(
    (key, id, e) => {
      if (e.target.value > 100) {
        document.getElementById(id).value = 100;
      }
      const _data = {
        criteria: [
          {
            fieldName: "dayDate",
            operator: "=",
            value: moment(date, "DD-MM-YYYY").format("YYYY-MM-DD")
          }
        ]
      };
      profileService
        .search({ fields: [key, "service", "employee"], data: _data })
        .then(res => {
          employeeService
            .search({ fields: [key, "service", "profile"], data: _data })
            .then(employeeResponse => {
              const profileData = res.data || [];
              const employeeData = employeeResponse.data || [];
              setData(data => {
                profileData.forEach(profile => {
                  data.forEach(service => {
                    const profileIndex = service.profiles.findIndex(
                      p => p.id === profile.id
                    );
                    service.profiles[profileIndex][key] = profile[key];
                    service.profiles[profileIndex].employees.forEach(
                      (emp, i) => {
                        const employee = employeeData.find(
                          e => e.id === emp.id
                        );
                        if (employee.id) {
                          emp[key] = employee[key];
                        }
                      }
                    );
                  });
                });
                return [...data];
              });
            });
        });
    },
    [date]
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
          <TableCell width="8%" align="center">
            <Button
              size="small"
              variant="outlined"
              color="default"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          </TableCell>
          <TableCell width="24%" colSpan={5}></TableCell>
          <TableCell colSpan={4} width="18.12%"></TableCell>
          <TableCell className={classes.tableCell} width="4.53%">
            <IconButton
              size="small"
              style={{ padding: 0 }}
              onClick={onPrevious}
            >
              <PreviousIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell colSpan={5} width="22.65%">
            <Typography align="center">
              <b>{date}</b>
            </Typography>
          </TableCell>
          <TableCell className={classes.tableCell} width="4.53%">
            <IconButton size="small" style={{ padding: 0 }} onClick={onNext}>
              <NextIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell colSpan={4} width="18.12%"></TableCell>
          <TableCell width="0.05%"></TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={6}></TableCell>
          {new Array(15).fill(0).map((_, i) => (
            <TableCell key={i} style={{ padding: "6px 16px" }}>
              <Typography style={{ textAlign: "center" }}>
                <b>{("0" + (i + 8)).slice(-2)}</b>
              </Typography>
            </TableCell>
          ))}
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4}></TableCell>
          <TableCell colSpan={2}>
            <Typography noWrap style={{ textAlign: "center" }}>
              Capacité max
            </Typography>
          </TableCell>
          {getColorFields().map((key, i) => (
            <TableCell key={i} className={classes.inputCell}>
              <TextField
                variant="outlined"
                id={`capacity_max_${i}`}
                onChange={e => fetchColumn(key, `capacity_max_${i}`, e)}
                type="number"
                style={{ width: "100%" }}
                InputProps={{
                  inputProps: { min: 0, max: 100 },
                  classes: {
                    input: classes.input
                  }
                }}
              />
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
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
    </Table>
  );
}

function App() {
  return <TableView />;
}

export default App;
