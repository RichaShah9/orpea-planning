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
  CircularProgress,
  // FormControlLabel,
  // Select,
  TextField,
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

const TableCell = React.forwardRef(({ children, style = {}, ...rest }, ref) => (
  <MuiTableCell ref={ref} {...rest} style={{ ...style, padding: "1px 0px" }}>
    {children}
  </MuiTableCell>
));

const profileMonthService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.ProfileMonth"
});
const employeeMonthService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.EmployeeMonth"
});
const establishmentService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.Establishment"
});
const versionService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.PlanningVersion"
});
const occupationService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.OccupationRate"
});

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
  firstColumnCell: {
    position: "sticky",
    top: 0,
    left: 0,
    zIndex: 1,
    width: 300,
    background: "#f9f9fc",
    border: "1px solid #eeeeee"
  },
  input: {
    padding: "2px 1px",
    textAlign: "center"
  },
  fixCell: {
    position: "sticky",
    top: -1,
    zIndex: 2,
    background: "#f9f9fc",
    border: "1px solid #eeeeee"
  },
  topCell: {
    position: "sticky",
    left: 0,
    zIndex: 10,
    background: "#f9f9fc",
    border: "1px solid #eeeeee",
    top: -1,
    width: 300
  },
  occupationTitle: {
    fontWeight: "bold",
    textAlign: "center"
  }
}));

function getColorFields(days = 31, text = "ColorSelect") {
  const fields = [];
  for (let i = 1; i <= days; i++) {
    // Changes are for static view only, please change for API
    fields.push(`d${i}${text}`);
  }
  return fields;
}

function getText(day) {
  return `d${day}Text`;
}

function getQueryData(month, establishment, planningVersion) {
  const _month = moment(month, MONTH_FORMAT);
  let _domain = null;
  const criteria = [
    {
      fieldName: "monthPeriod.fromDate",
      operator: "=",
      value: _month.startOf("month").format("YYYY-MM-DD")
    },
    {
      fieldName: "monthPeriod.toDate",
      operator: "=",
      value: _month.endOf("month").format("YYYY-MM-DD")
    }
  ];
  if (establishment) {
    _domain = `self.establishment.id = ${establishment}`;
  }
  if (planningVersion) {
    _domain = `${_domain} and self.planningVersion = ${planningVersion}`;
  }
  return {
    _domain,
    criteria,
    op: "and"
  };
}

function TableEmployee({
  employee,
  profile,
  hidden,
  onChange,
  daySpans,
  days,
  onAbsent,
  onActionSave,
  getDateFromDay
}) {
  const classes = useStyles();
  const onEmployeeChange = React.useCallback(
    (key, value) => {
      employeeMonthService
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
            style={{ padding: "0px 8px", marginLeft: 60 }}
            noWrap
            title={(employee["employmentContract.employee"] || {}).name}
          >
            {(employee["employmentContract.employee"] || {}).name}
          </Typography>
        </TableCell>

        {getColorFields(days).map((key, i) => (
          <Popup
            style={
              daySpans.includes(i + 1)
                ? {
                    borderRight: "1px solid black",
                    boxSizing: "border-box"
                  }
                : {}
            }
            TableCell={TableCell} // Without Padding Cell
            key={i}
            color={employee[key]}
            text={employee[getText(i + 1)]}
            popupText={employee[`d${i + 1}PopupText`]}
            profile={profile}
            employee={employee}
            onColorChange={color => onEmployeeChange(key, color)}
            onAbsent={value => onAbsent(employee.employeeId, i, value)}
            dateNumber={i}
            onActionSave={actionData => onActionSave(actionData, i)}
            fromDate={getDateFromDay(i)}
          />
        ))}
        {new Array(31 - days).fill(0).map((_, i) => (
          <TableCell key={i}></TableCell>
        ))}
        <TableCell />
      </TableRow>
    </>
  );
}

function TableProfile({
  profile,
  hidden,
  onChange,
  daySpans,
  days,
  onAbsent,
  onActionSave,
  getDateFromDay
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  const onClick = React.useCallback(() => {
    setCollapsed(c => !c);
  }, []);

  const Icon = collapsed ? AddCircle : RemoveCircle;
  const color = collapsed ? "green" : "#2f4050";

  const { employees = [] } = profile;
  const onProfileChange = React.useCallback(
    (key, value) => {
      profileMonthService
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
          className={classes.firstColumnCell}
          onClick={onClick}
          colSpan={2}
          style={{ cursor: "pointer" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: 30
            }}
          >
            &nbsp;
            <Icon style={{ fontSize: "1rem", color }} />
            <Typography style={{ paddingLeft: 8 }} noWrap title={profile.name}>
              {profile.name}
            </Typography>
          </div>
        </TableCell>

        {getColorFields(days).map((key, i) => (
          <Popup
            style={
              daySpans.includes(i + 1)
                ? {
                    borderRight: "1px solid black",
                    boxSizing: "border-box"
                  }
                : {}
            }
            TableCell={TableCell} // Without padding cell
            key={i}
            color={profile[key]}
            text={profile[getText(i)]}
            profile={profile}
            onColorChange={color => onProfileChange(key, color)}
            disablePopup={true}
          />
        ))}
        {new Array(31 - days).fill(0).map((_, i) => (
          <TableCell key={i}></TableCell>
        ))}
        <TableCell />
      </TableRow>
      {employees.map((employee, i) => (
        <TableEmployee
          daySpans={daySpans}
          employee={employee}
          profile={profile}
          key={i}
          hidden={collapsed || hidden}
          days={days}
          onChange={params => onChange({ ...params, profileId: profile.id })}
          onAbsent={onAbsent}
          onActionSave={onActionSave}
          getDateFromDay={getDateFromDay}
        />
      ))}
    </>
  );
}

function TableService({
  service,
  onChange,
  daySpans,
  days,
  onAbsent,
  onActionSave,
  getDateFromDay
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { profiles = [] } = service;

  const onClick = React.useCallback(() => {
    setCollapsed(c => !c);
  }, []);

  const Icon = collapsed ? AddCircle : RemoveCircle;
  const color = collapsed ? "green" : "#2f4050";
  const classes = useStyles();
  return (
    <>
      <TableRow>
        <TableCell
          className={classes.firstColumnCell}
          colSpan={2}
          onClick={onClick}
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", marginLeft: 5 }}>
            &nbsp;
            <Icon style={{ fontSize: "1rem", color }} />
            <Typography style={{ paddingLeft: 8 }} noWrap title={service.name}>
              {service.name}
            </Typography>
          </div>
        </TableCell>
        {new Array(days).fill(0).map((_, i) => (
          <TableCell
            key={i}
            style={
              daySpans.includes(i + 1)
                ? {
                    borderRight: "1px solid black",
                    boxSizing: "border-box"
                  }
                : {}
            }
          />
        ))}
      </TableRow>
      {profiles.map((profile, i) => (
        <TableProfile
          onChange={params => onChange({ serviceId: service.id, ...params })}
          profile={profile}
          key={i}
          daySpans={daySpans}
          hidden={collapsed}
          days={days}
          onAbsent={onAbsent}
          onActionSave={onActionSave}
          getDateFromDay={getDateFromDay}
        />
      ))}
    </>
  );
}

const MONTH_FORMAT = "MMM YYYY";

const FR_DAYS_OF_WEEK = ["D", "L", "M", "M", "J", "V", "S"]; // Starts at sunday

function MonthView() {
  const [month, setMonth] = React.useState(
    moment(new Date()).format(MONTH_FORMAT)
  );

  const [data, setData] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [establishmentList, setEstablishmentList] = React.useState([]);
  const [versionList, setVersionList] = React.useState([]);
  const [establishment, setEstablishment] = React.useState("");
  const [version, setVersion] = React.useState("");
  const [occupationRates, setOccupationRates] = React.useState([]);

  const getDaysInMonth = React.useCallback(month => {
    return moment(month, MONTH_FORMAT).daysInMonth();
  }, []);

  const getDaysInititals = React.useCallback(
    month => {
      const firstDayIndex = moment(month, MONTH_FORMAT)
        .date(1)
        .day();

      const days = getDaysInMonth(month);

      return new Array(days)
        .fill(0)
        .map((_, i) => FR_DAYS_OF_WEEK[(i + firstDayIndex) % 7]);
    },
    [getDaysInMonth]
  );

  const getWeekColSpans = React.useCallback((initials, days) => {
    let spans = initials.reduce((acc, c, i) => {
      if (c === "L") {
        // Monday Check
        acc.push(i);
      }
      return acc;
    }, []);

    spans.push(days);

    let weekColSpans = [];
    for (let i = 0; i < spans.length; i++) {
      if (i === 0) {
        if (spans[0]) weekColSpans.push(spans[0]);
      } else {
        weekColSpans.push(spans[i] - spans[i - 1]);
      }
    }

    let daySpans = weekColSpans.reduce((acc, s, i) => {
      if (i === 0) {
        acc.push(s);
      } else {
        acc.push(s + acc[i - 1]);
      }
      return acc;
    }, []);

    return { weekColSpans, daySpans };
  }, []);

  const fetchData = React.useCallback(
    (establishment, planningVersion) => {
      setLoading(true);
      const days = getDaysInMonth(month);
      const profileFields = [
        "service",
        "employmentContract",
        "employmentContract.employee",
        "monthPeriod",
        "profile",
        "establishment",
        "planningVersion",
        ...getColorFields(days),
        ...getColorFields(days, "Text"),
        ...getColorFields(days, "PopupText")
      ];
      const employeeFields = [...profileFields, "profile"];
      const serviceList = [];
      const getServiceIndex = serviceId => {
        return serviceList.findIndex(s => s.id === serviceId);
      };
      const getProfileIndex = (list, profileId, serviceId) => {
        return list.findIndex(
          p => p.profileId === profileId && p.serviceId === serviceId
        );
      };

      profileMonthService
        .search({
          fields: profileFields,
          data: getQueryData(month, establishment, planningVersion)
        })
        .then(res => {
          employeeMonthService
            .search({
              fields: employeeFields,
              data: getQueryData(month, establishment, planningVersion)
            })
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
                      p.profile.id === profile.id && p.service.id === service.id
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
                const list = [];
                employeeData.forEach(emp => {
                  if (
                    emp.profile.id === profileId &&
                    emp.service.id === serviceId
                  ) {
                    const empObject = {
                      name:
                        emp.employmentContract &&
                        emp.employmentContract.fullName,
                      ...emp
                    };
                    delete empObject.employee;
                    delete empObject.profile;
                    delete empObject.service;
                    list.push({ ...empObject });
                  }
                });
                return list;
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
                if (profileIndex === -1) {
                  const employeeList = getEmployeeList(
                    profile.profileId,
                    profile.serviceId
                  );
                  profile.employees.push(...employeeList);
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
    },
    [month, getDaysInMonth]
  );

  const onPrevious = React.useCallback(() => {
    setMonth(
      moment(month, MONTH_FORMAT)
        .subtract(1, "M")
        .format(MONTH_FORMAT)
    );
  }, [month]);

  const onNext = React.useCallback(() => {
    setMonth(
      moment(month, MONTH_FORMAT)
        .add(1, "M")
        .format(MONTH_FORMAT)
    );
  }, [month]);

  const onRefresh = React.useCallback(() => {
    fetchData(establishment, version);
  }, [fetchData, establishment, version]);

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

  const toggleDialog = React.useCallback(
    (shouldRefresh = false) => {
      setOpen(open => !open);
      if (shouldRefresh === true) {
        onRefresh();
      }
    },
    [onRefresh]
  );

  const onInputChange = React.useCallback(
    (input, key) => {
      const textFieldName = getText(key);
      const colorFieldName = `d${key}ColorSelect`;
      const fields = [
        "service",
        "employmentContract",
        "monthPeriod",
        "profile",
        textFieldName,
        colorFieldName
      ];
      //call update planning method
      const data = {
        action:
          "com.axelor.apps.orpea.planning.web.EmploymentContractController:updatePlanning",
        data: {
          establishmentId: establishment,
          value: Number(input),
          date: moment(month, MONTH_FORMAT)
            .startOf("month")
            .format("YYYY-MM-DD")
        }
      };
      profileMonthService.action(data).then(res => {
        if (res && res.data && res.data[0].reload) {
          profileMonthService
            .search({ fields, data: getQueryData(month) })
            .then(res => {
              employeeMonthService
                .search({ fields, data: getQueryData(month) })
                .then(employeeResponse => {
                  const profileData = res.data || [];
                  const employeeData = employeeResponse.data || [];
                  setData(data => {
                    profileData.forEach(profile => {
                      data.forEach(service => {
                        const profileIndex = service.profiles.findIndex(
                          p => p.id === profile.id
                        );
                        if (!service.profiles[profileIndex]) return;
                        service.profiles[profileIndex][textFieldName] =
                          profile[textFieldName];
                        service.profiles[profileIndex][colorFieldName] =
                          profile[colorFieldName];
                        service.profiles[profileIndex].employees.forEach(
                          (emp, i) => {
                            const employee = employeeData.find(
                              e => e.id === emp.id
                            );
                            if (employee.id) {
                              emp[textFieldName] = employee[textFieldName];
                              emp[colorFieldName] = employee[colorFieldName];
                            }
                          }
                        );
                      });
                    });
                    return [...data];
                  });
                });
            });
        }
      });
    },
    [month, establishment]
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
      const sortBy = ["-versionNumber"];
      versionService
        .search({ fields: ["name", "versionNumber"], data, sortBy })
        .then(res => {
          if (res && res.data) {
            setVersionList([...res.data]);
            setVersion(res.data[0].id);
          } else {
            setVersionList([]);
            setVersion("");
          }
        });
    }
  }, [establishment]);

  const onAbsent = React.useCallback(
    (employeeId, dateNumber, leaveInfo) => {
      const data = {
        action:
          "com.axelor.apps.orpea.planning.web.EmploymentContractController:createAbsenceMonthPlanning",
        data: {
          employeeId,
          ...leaveInfo
        }
      };
      employeeMonthService.action(data).then(res => {
        onRefresh();
      });
    },
    [onRefresh]
  );

  const onSaveVersion = React.useCallback(() => {
    const data = {
      action:
        "com.axelor.apps.orpea.planning.web.EmploymentContractController:saveNewVersion",
      data: {
        planningVersionId: version
      }
    };
    employeeMonthService.action(data).then(res => {
      if (res && res.data && res.data[0].reload) {
        onRefresh();
      }
    });
  }, [version, onRefresh]);

  const onActionSave = React.useCallback(
    (actionData, day) => {
      const { action, ...otherData } = actionData;
      const method = action === "Recrutement" ? "hire" : "createSubstitute";
      const data = {
        action: `com.axelor.apps.orpea.planning.web.EmploymentContractController:${method}`,
        data: {
          ...otherData
        }
      };
      employeeMonthService.action(data).then(res => {
        if (res && res.data && res.data[0].reload) {
          onRefresh();
        }
      });
    },
    [onRefresh]
  );

  const getDateFromDay = React.useCallback(
    day => {
      return moment(month, MONTH_FORMAT)
        .startOf("month")
        .add(day, "days")
        .format("YYYY-MM-DD");
    },
    [month]
  );

  const getDayRate = React.useCallback(
    day => {
      const date = getDateFromDay(day);
      const rate = occupationRates.find(o => o.dayDate === date);
      return rate ? rate.dailyRate : "";
    },
    [getDateFromDay, occupationRates]
  );

  const setDayRate = React.useCallback((value, day) => {
    const date = getDateFromDay(day);
    setOccupationRates(rates => {
      const index = rates.findIndex(o => o.dayDate === date);
      rates[index].dailyRate = value;
      return [...rates]
    })
  }, [getDateFromDay]);

  React.useEffect(() => {
    fetchEstVersion();
  }, [fetchEstVersion]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (establishment) {
      const _month = moment(month, MONTH_FORMAT);
      const from = _month.startOf("month").format("YYYY-MM-DD");
      const to = _month.endOf("month").format("YYYY-MM-DD");
      const data = {
        _domain: `self.establishment.id = ${establishment} and self.dayDate >= '${from}' and self.dayDate <= '${to}'`
      };
      occupationService
        .search({ fields: ["dayDate", "dailyRate"], data, sortBy: ["dayDate"] })
        .then(res => {
          if (res && res.data) {
            setOccupationRates([...res.data]);
          }
        });
    }
  }, [month, establishment]);

  React.useEffect(() => {
    establishmentService.search({ fields: ["name"] }).then(res => {
      if (res && res.data) {
        setEstablishmentList([...res.data]);
        setEstablishment(res.data[0].id);
      }
    });
  }, []);

  const classes = useStyles();
  const renderTable = React.useMemo(() => {
    const days = getDaysInMonth(month);
    const initials = getDaysInititals(month);
    const { weekColSpans, daySpans } = getWeekColSpans(initials, days);
    return (
      <Table style={{ width: "100%", tableLayout: "fixed" }} size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2} className={classes.topCell}>
              <Button
                style={{ padding: "0px 2px" }}
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
                onClick={toggleDialog}
                startIcon={<AddIcon />}
              >
                Ajouter employé
              </Button>
            </TableCell>
            <TableCell colSpan={10} width="400px" className={classes.fixCell}>
              <Button
                style={{
                  padding: "0px 2px"
                }}
                size="small"
                variant="outlined"
                color="default"
                onClick={onSaveVersion}
              >
                Sauvegarder nouvelle version
              </Button>
            </TableCell>
            <TableCell
              colSpan={2}
              align="center"
              width="80px"
              className={classes.fixCell}
            >
              <IconButton
                size="small"
                style={{ padding: 0 }}
                onClick={onPrevious}
              >
                <PreviousIcon fontSize="small" />
              </IconButton>
            </TableCell>
            <TableCell colSpan={6} width="240px" className={classes.fixCell}>
              <Typography align="center">
                <b>{month}</b>
              </Typography>
            </TableCell>
            <TableCell
              colSpan={2}
              align="center"
              style={{ width: 80 }}
              className={classes.fixCell}
            >
              <IconButton size="small" style={{ padding: 0 }} onClick={onNext}>
                <NextIcon fontSize="small" />
              </IconButton>
            </TableCell>
            <TableCell
              colSpan={12}
              width="520px"
              className={classes.fixCell}
            ></TableCell>
          </TableRow>

          {/* Week Spans */}
          <TableRow>
            <TableCell
              align="center"
              colSpan={2}
              className={classes.topCell}
              style={{ top: 25 }}
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
              {/* <Button
              style={{ padding: "0px 2px" }}
              size="small"
              variant="outlined"
              color="default"
            >
              Sauvegarder nouvelle version
            </Button>
            <FormControlLabel
              labelPlacement="start"
              control={<Select />}
              label="Sélectionner Version"
            /> */}
            </TableCell>
            {weekColSpans.map((span, i) => (
              <TableCell
                colSpan={span}
                key={i}
                style={{
                  borderRight: "1px solid black",
                  boxSizing: "border-box",
                  top: 25
                }}
                className={classes.fixCell}
              >
                <Typography align="center">
                  <b>S{i}</b>
                </Typography>
              </TableCell>
            ))}
            {new Array(31 - days).fill(0).map((_, i) => (
              <TableCell
                className={classes.fixCell}
                style={{ top: 25 }}
                key={i}
              ></TableCell>
            ))}
            <TableCell
              className={classes.fixCell}
              style={{ top: 25 }}
            ></TableCell>
          </TableRow>

          {/* Days Initials */}
          <TableRow>
            <TableCell
              colSpan={2}
              className={classes.topCell}
              style={{ top: 75 }}
            ></TableCell>
            {initials.map((c, i) => (
              <TableCell
                className={classes.fixCell}
                key={i}
                style={
                  daySpans.includes(i + 1)
                    ? {
                        borderRight: "1px solid black",
                        boxSizing: "border-box",
                        top: 75
                      }
                    : { top: 75 }
                }
              >
                <Typography align="center">{c}</Typography>
              </TableCell>
            ))}
            {new Array(31 - days).fill(0).map((_, i) => (
              <TableCell
                className={classes.fixCell}
                style={{ top: 75 }}
                key={i}
              ></TableCell>
            ))}
            <TableCell
              className={classes.fixCell}
              style={{ top: 75 }}
            ></TableCell>
          </TableRow>

          {/* Date */}
          <TableRow>
            <TableCell
              colSpan={2}
              className={classes.topCell}
              style={{ top: 100 }}
            ></TableCell>
            {new Array(days).fill(0).map((_, i) => (
              <TableCell
                className={classes.fixCell}
                key={i}
                style={
                  daySpans.includes(i + 1)
                    ? {
                        borderRight: "1px solid black",
                        boxSizing: "border-box",
                        top: 100
                      }
                    : { top: 100 }
                }
              >
                <Typography align="center">{i + 1}</Typography>
              </TableCell>
            ))}
            {new Array(31 - days).fill(0).map((_, i) => (
              <TableCell
                style={{ top: 100 }}
                className={classes.fixCell}
                key={i}
                width="2.419%"
              ></TableCell>
            ))}
            <TableCell
              style={{ top: 100 }}
              className={classes.fixCell}
            ></TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              colSpan={2}
              className={classes.topCell}
              style={{ top: 125 }}
            >
              <Typography className={classes.occupationTitle}>
                Taux d'occupation
              </Typography>
            </TableCell>
            {new Array(days).fill(0).map((_, i) => (
              <TableCell
                key={i}
                className={classes.fixCell}
                style={
                  daySpans.includes(i + 1)
                    ? {
                        borderRight: "1px solid black",
                        boxSizing: "border-box",
                        top: 125
                      }
                    : { top: 125 }
                }
              >
                <TextField
                  variant="outlined"
                  type="number"
                  InputProps={{
                    classes: {
                      input: classes.input
                    }
                  }}
                  value={getDayRate(i)}
                  onChange={(e) => setDayRate(e.target.value, i)}
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      onInputChange(e.target.value, i + 1);
                      e.preventDefault();
                    }
                  }}
                />
              </TableCell>
            ))}
            {new Array(31 - days).fill(0).map((_, i) => (
              <TableCell
                style={{ top: 125 }}
                className={classes.fixCell}
                key={i}
                width="2.419%"
              ></TableCell>
            ))}
            <TableCell
              style={{ top: 125 }}
              className={classes.fixCell}
            ></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {!isLoading ? (
            data.map((service, i) => (
              <TableService
                days={days}
                service={service}
                key={i}
                onChange={onChange}
                daySpans={daySpans}
                onAbsent={onAbsent}
                onActionSave={onActionSave}
                getDateFromDay={getDateFromDay}
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
      </Table>
    );
  }, [
    classes,
    data,
    onChange,
    onInputChange,
    onNext,
    onPrevious,
    isLoading,
    month,
    onRefresh,
    getDaysInMonth,
    getDaysInititals,
    getWeekColSpans,
    toggleDialog,
    establishment,
    establishmentList,
    versionList,
    version,
    handleEstablishmentChange,
    handleVersionChange,
    onAbsent,
    onSaveVersion,
    onActionSave,
    getDateFromDay,
    getDayRate
  ]);

  return (
    <React.Fragment>
      {renderTable}
      <LineForm
        handleClose={toggleDialog}
        open={open}
        fromDate={moment(month, MONTH_FORMAT)
          .startOf("month")
          .format("YYYY-MM-DD")}
      />
    </React.Fragment>
  );
}

export default MonthView;
