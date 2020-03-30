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
  CircularProgress,
  NativeSelect,
  InputLabel,
  FormControl
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
const establishmentService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.Establishment"
});
const versionService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.PlanningVersion"
});
const groupService = new AxelorService({
  model: "com.axelor.auth.db.Group"
});
const occupationService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.OccupationRate"
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
    padding: "2px 1px",
    textAlign: "center"
  },
  topCell: {
    position: "sticky",
    left: 0,
    zIndex: 10,
    background: "#f9f9fc",
    border: "1px solid #eeeeee"
  },
  occupationTitle: {
    display: "inline",
    marginRight: 8,
    fontWeight: "bold",
    marginLeft: 2
  },
  dailyRateField: {
    width: 45
  }
}));

function getHourFields(text) {
  return new Array(15).fill(0).map((_, i) => `h${i + 8}${text}`);
}

function getColorFields() {
  return getHourFields("ColorSelect");
}

function getTextFields() {
  return getHourFields("Text");
}

function getPopupTextFields() {
  return getHourFields("PopupText");
}

function getEmployeeNbFields() {
  return new Array(15).fill(0).map((_, i) => `employeeNbWorkingAt${i + 8}h`);
}

function TableEmployee({
  employee,
  profile,
  hidden,
  onChange,
  onAbsent,
  lock
}) {
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
            title={(employee["employmentContract.employee"] || {}).name}
          >
            {(employee["employmentContract.employee"] || {}).name}
          </Typography>
        </TableCell>
        {getColorFields().map((key, i) => (
          <Popup
            TableCell={TableCell}
            key={i}
            text={employee[`h${i + 8}Text`]}
            popupText={employee[`h${i + 8}PopupText`]}
            color={employee[key]}
            profile={profile}
            employee={employee}
            onColorChange={color => onEmployeeChange(key, color)}
            onAbsent={value => onAbsent(employee.id, i + 8, value)}
            disablePopup={lock}
          />
        ))}
        <TableCell />
      </TableRow>
    </>
  );
}

function TableProfile({ profile, hidden, onChange, onAbsent, lock }) {
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
            text={profile[`h${i + 8}Text`]}
            employeeWorkingNb={profile[`employeeNbWorkingAt${i + 8}h`]}
            employeeNbRequired={profile.employeeNbRequired}
            color={profile[key]}
            profile={profile}
            onColorChange={color => onProfileChange(key, color)}
            // disablePopup={true}
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
          onAbsent={onAbsent}
          lock={lock}
        />
      ))}
    </>
  );
}

function TableService({ service, onChange, onAbsent, lock }) {
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
          onAbsent={onAbsent}
          lock={lock}
        />
      ))}
    </>
  );
}

function TableView() {
  const [data, setData] = React.useState([]);
  const [establishmentList, setEstablishmentList] = React.useState([]);
  const [versionList, setVersionList] = React.useState([]);
  const [establishment, setEstablishment] = React.useState("");
  const [version, setVersion] = React.useState("");
  const [lock, setLock] = React.useState(true);
  const [isDe, setIsDe] = React.useState(false);
  const [initialFetch, setInitialFetch] = React.useState(false);
  const [dailyRate, setDailyRate] = React.useState("");
  const classes = useStyles();

  const [date, setDate] = React.useState(
    moment(new Date()).format("DD-MM-YYYY")
  );

  const [isLoading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const fetchData = React.useCallback((establishment, version, date) => {
    setLoading(true);
    const profileFields = [
      "service",
      "employmentContract",
      "employmentContract.employee",
      "dayDate",
      "profile",
      "establishment",
      "planningVersion",
      "employeeNbRequired",
      ...getColorFields(),
      ...getTextFields(),
      ...getPopupTextFields(),
      ...getEmployeeNbFields()
    ];
    const employeeFields = [...profileFields, "profile"];
    let _domain = null;
    if (establishment) {
      _domain = `self.establishment.id = ${establishment}`;
    }
    if (version) {
      _domain = `${_domain} and self.planningVersion = ${version}`;
    }
    const data = {
      criteria: [
        {
          fieldName: "dayDate",
          operator: "=",
          value: moment(date, "DD-MM-YYYY").format("YYYY-MM-DD")
        }
      ],
      _domain,
      op: "and"
    };
    const serviceList = [];
    const getServiceIndex = serviceId => {
      return serviceList.findIndex(s => s.id === serviceId);
    };
    const getProfileIndex = (list, profileId, serviceId) => {
      return list.findIndex(
        p => p.profileId === profileId && p.serviceId === serviceId
      );
    };

    profileService.search({ fields: profileFields, data }).then(res => {
      employeeService
        .search({ fields: employeeFields, data })
        .then(employeeResponse => {
          if (!res || !employeeResponse) {
            setLoading(false);
            return;
          }
          const { data: profileData = [] } = res;
          const { data: employeeData = [] } = employeeResponse;
          const getProfile = (profile, service) => {
            const _profile =
              profileData.find(
                p =>
                  p.profile &&
                  p.profile.id === profile.id &&
                  p.service.id === service.id
              ) || {};
            const profileObject = {
              ..._profile,
              name: profile.name,
              profileId: profile.id,
              serviceId: service.id,
              employees: []
            };
            delete profileObject.profile;
            delete profileObject.service;
            return profileObject;
          };

          const getEmployeeList = (profileId, serviceId) => {
            return employeeData
              .map(emp => {
                if (
                  emp.profile.id === profileId &&
                  emp.service.id === serviceId
                ) {
                  const empObject = {
                    name:
                      emp.employmentContract && emp.employmentContract.fullName,
                    ...emp
                  };
                  delete empObject.employee;
                  delete empObject.profile;
                  delete empObject.service;
                  return { ...empObject };
                }
                return undefined;
              })
              .filter(e => e);
          };

          profileData.forEach(_profile => {
            const serviceIndex = getServiceIndex(_profile.service.id);
            const service =
              serviceIndex === -1
                ? {
                    name: _profile.service.name,
                    id: _profile.service.id,
                    profiles: []
                  }
                : serviceList[serviceIndex];

            const profileIndex = getProfileIndex(
              service.profiles,
              _profile.profile.id,
              _profile.service.id
            );
            const profile =
              profileIndex === -1
                ? getProfile(_profile.profile, _profile.service)
                : service.profiles[profileIndex];
            const employeeList = getEmployeeList(
              profile.profileId,
              profile.serviceId
            );
            profile.employees.push(...employeeList);
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
  }, []);

  const onPrevious = React.useCallback(() => {
    const newDate = moment(date, "DD-MM-YYYY")
      .subtract(1, "days")
      .format("DD-MM-YYYY");
    setDate(newDate);
    fetchData(establishment, version, newDate);
  }, [date, establishment, version, fetchData]);

  const onNext = React.useCallback(() => {
    const newDate = moment(date, "DD-MM-YYYY")
      .add(1, "days")
      .format("DD-MM-YYYY");
    setDate(newDate);
    fetchData(establishment, version, newDate);
  }, [date, establishment, version, fetchData]);

  const onRefresh = React.useCallback(() => {
    fetchData(establishment, version, date);
  }, [fetchData, establishment, version, date]);

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
          establishmentId: establishment,
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
    [onRefresh, establishment]
  );

  const onAbsent = React.useCallback(
    (employeeId, hour, leaveReasonSelect) => {
      const data = {
        action:
          "com.axelor.apps.orpea.planning.web.EmploymentContractController:createAbsenceDayPlanning",
        data: {
          employeeId,
          leaveReasonSelect,
          hour,
          date: moment(date, "DD-MM-YYYY").format("YYYY-MM-DD")
        }
      };
      employeeService.action(data).then(res => {
        onRefresh();
      });
    },
    [onRefresh, date]
  );

  const handleEstablishmentChange = React.useCallback(e => {
    setEstablishment(e.target.value);
  }, []);

  const handleVersionChange = React.useCallback(e => {
    setVersion(e.target.value);
  }, []);

  const fetchEstVersion = React.useCallback(() => {
    if (establishment) {
      const data = {
        _domain: `self.establishment.id = ${establishment}`
      };
      versionService
        .search({
          fields: ["name", "versionNumber"],
          sortBy: ["-versionNumber"],
          data
        })
        .then(res => {
          if (res && res.data && res.data.length) {
            const version = res.data[0].id;
            setVersionList([...res.data]);
            setVersion(version);
          } else {
            setVersionList([]);
            setVersion("");
          }
        });
    }
  }, [establishment]);

  const onSaveVersion = React.useCallback(() => {
    const data = {
      action:
        "com.axelor.apps.orpea.planning.web.EmploymentContractController:saveNewVersion",
      data: {
        planningVersionId: version
      }
    };
    employeeService.action(data).then(res => {
      if (res && res.data && res.data[0].reload) {
        onRefresh();
      }
    });
  }, [version, onRefresh]);

  const handleLock = React.useCallback(() => {
    setLock(l => !l);
  }, []);

  React.useEffect(() => {
    if (!initialFetch) return;
    fetchEstVersion();
  }, [fetchEstVersion, initialFetch]);

  React.useEffect(() => {
    if (establishment) {
      const _date = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
      const data = {
        _domain: `self.establishment.id = ${establishment} and self.dayDate = '${_date}'`
      };
      occupationService
        .search({ fields: ["dayDate", "dailyRate"], data, sortBy: ["dayDate"] })
        .then(res => {
          if (res && res.data && res.data[0]) {
            setDailyRate(res.data[0].dailyRate || "");
          } else {
            setDailyRate("");
          }
        });
    }
  }, [date, establishment]);

  React.useEffect(() => {
    setLoading(true);
    establishmentService
      .search({ fields: ["name"] })
      .then(res => {
        if (res && res.data && res.data.length) {
          const establishment = res.data[0].id;
          setEstablishmentList([...res.data]);
          setEstablishment(establishment);

          const data = {
            _domain: `self.establishment.id = ${establishment}`
          };

          versionService
            .search({
              fields: ["name", "versionNumber"],
              sortBy: ["-versionNumber"],
              data
            })
            .then(res => {
              let version = "";
              if (res && res.data && res.data.length) {
                version = res.data[0].id;
                setVersionList([...res.data]);
              } else {
                setVersionList([]);
              }
              setVersion(version);
              setInitialFetch(true);
              setLoading(false);
              fetchData(establishment, version, date);
            });
        }
      })
      .catch(err => {
        setLoading(false);
        setInitialFetch(true);
        fetchData(undefined, undefined, date);
      });
    if (!initialFetch) {
      employeeService.info().then(res => {
        const data = {
          _domain: `self.code='${res["user.group"]}'`
        };
        groupService
          .search({ fields: ["name", "code", "isDe"], data })
          .then(res => {
            if (res && res.data[0]) {
              setIsDe(res.data[0].isDe);
            }
          });
      });
    }
  }, [fetchData, date, initialFetch]);

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
              disabled={lock}
            >
              Ajouter employé
            </Button>
          </TableCell>
          <TableCell colSpan={5} width="250px" className={classes.fixCell}>
            <Typography className={classes.occupationTitle}>
              Taux d'occupation :
            </Typography>
            <TextField
              className={classes.inputCell}
              variant="outlined"
              type="number"
              value={dailyRate}
              InputProps={{
                classes: {
                  root: classes.dailyRateField,
                  input: classes.input
                }
              }}
              onChange={e => setDailyRate(e.target.value)}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  updatePlanning(e.target.value, date);
                  e.preventDefault();
                }
              }}
              disabled={lock}
            />
          </TableCell>
          <TableCell
            className={cs(classes.tableCell, classes.fixCell)}
            width="50px"
          >
            <IconButton
              size="small"
              style={{ padding: 0 }}
              onClick={onPrevious}
            >
              <PreviousIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell colSpan={5} width="250px" className={classes.fixCell}>
            <Typography align="center">
              <b>{date}</b>
            </Typography>
          </TableCell>
          <TableCell
            className={cs(classes.tableCell, classes.fixCell)}
            width="50px"
          >
            <IconButton size="small" style={{ padding: 0 }} onClick={onNext}>
              <NextIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell
            colSpan={3}
            width="150px"
            className={classes.fixCell}
            style={{ textAlign: "center" }}
          >
            {isDe && (
              <Button
                style={{
                  padding: "0px 2px"
                }}
                size="small"
                variant="outlined"
                color="default"
                onClick={handleLock}
              >
                {!lock ? "VERROUILLER" : "DÉVERROUILLER"}
              </Button>
            )}
          </TableCell>
          <TableCell className={classes.fixCell}></TableCell>
        </TableRow>

        {/**Hour Row */}
        <TableRow>
          <TableCell
            align="center"
            colSpan={2}
            className={classes.topCell}
            style={{
              top: 25
            }}
            width="300px"
          >
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-helper">
                  Établissement
                </InputLabel>
                <NativeSelect
                  style={{ minWidth: 125 }}
                  value={establishment}
                  onChange={handleEstablishmentChange}
                  inputProps={{
                    name: "age",
                    id: "age-native-helper"
                  }}
                >
                  <option aria-label="None" value=""></option>
                  {establishmentList.map((est, i) => (
                    <option key={i} value={est.id}>
                      {est.name}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-helper">Version</InputLabel>
                <NativeSelect
                  style={{ minWidth: 125 }}
                  value={version}
                  onChange={handleVersionChange}
                  inputProps={{
                    name: "age",
                    id: "age-native-helper"
                  }}
                >
                  <option aria-label="None" value="" />
                  {versionList.map((ver, i) => (
                    <option key={i} value={ver.id}>
                      {ver.name}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
            </div>
          </TableCell>
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

        {/** Version Button Row */}
        <TableRow>
          <TableCell
            align="center"
            colSpan={2}
            className={classes.topCell}
            style={{ top: 75 }}
          >
            <Button
              style={{
                padding: "0px 2px"
              }}
              size="small"
              variant="outlined"
              color="default"
              onClick={onSaveVersion}
              disabled={lock}
            >
              Sauvegarder nouvelle version
            </Button>
          </TableCell>
          <TableCell
            colSpan={16}
            style={{ top: 75 }}
            className={classes.fixCell}
          ></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {!isLoading ? (
          data.map((serivce, i) => (
            <TableService
              service={serivce}
              key={i}
              onChange={onChange}
              onAbsent={onAbsent}
              lock={lock}
            />
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
