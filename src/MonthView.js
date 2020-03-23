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

const TableCell = React.forwardRef(({ children, style = {}, ...rest }, ref) => (
  <MuiTableCell ref={ref} {...rest} style={{ ...style, padding: "2px 0px" }}>
    {children}
  </MuiTableCell>
));

const profileMonthService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.ProfileMonth"
});
const employeeMonthService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.EmployeeMonth"
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
  }
}));

function getColorFields(days = 31, text='ColorSelect') {
  const fields = [];
  for (let i = 0; i < days; i++) {
    // Changes are for static view only, please change for API
    fields.push(`d${i}${text}`);
  }
  return fields;
}

function getText(day) {
  return `d${day}Text`;
}

function TableEmployee({
  employee,
  profile,
  hidden,
  onChange,
  daySpans,
  days
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
        <TableCell colSpan={3}>
          <Typography
            style={{ padding: "0px 8px", textAlign: "right" }}
            noWrap
            title={employee.name}
          >
            {employee.name}
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
            text={employee[getText(i)]}
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

function TableProfile({ profile, hidden, onChange, daySpans, days }) {
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
        <TableCell onClick={onClick} colSpan={3} style={{ cursor: "pointer" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography style={{ paddingLeft: 8 }} noWrap title={profile.name}>
              {profile.name}
            </Typography>
            &nbsp;
            <Icon style={{ fontSize: "1rem", color }} />
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
          />
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
        />
      ))}
    </>
  );
}

function TableService({ service, onChange, daySpans, days }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { profiles = [] } = service;

  const onClick = React.useCallback(() => {
    setCollapsed(c => !c);
  }, []);

  const Icon = collapsed ? AddCircle : RemoveCircle;
  const color = collapsed ? "green" : "#2f4050";

  return (
    <>
      <TableRow>
        <TableCell colSpan={3} onClick={onClick} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography style={{ paddingLeft: 8 }} noWrap title={service.name}>
              {service.name}
            </Typography>
            &nbsp;
            <Icon style={{ fontSize: "1rem", color }} />
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

  const [isLoading, setLoading] = React.useState(false);

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

  const fetchData = React.useCallback(() => {
    
    setLoading(true);
    const days = getDaysInMonth(month);
    const profileFields = [
      "service",
      "employee",
      "monthPeriod",
      "profile",
      ...getColorFields(days),
      ...getColorFields(days, "Text"),
    ];
    const employeeFields = [...profileFields, "profile"];
    const _month = moment(month, MONTH_FORMAT);
    const data = {
      criteria: [
        {
          fieldName: "monthPeriod.fromDate",
          operator: "=",
          value: _month.startOf('month').format("YYYY-MM-DD")
        },
        {
          fieldName: "monthPeriod.toDate",
          operator: "=",
          value: _month.endOf('month').format("YYYY-MM-DD")
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

    profileMonthService.search({ fields: profileFields, data }).then(res => {
      employeeMonthService
        .search({ fields: employeeFields, data })
        .then(employeeResponse => {
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
              name: employee.employee.name,
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
  }, [month, getDaysInMonth]);

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
    fetchData();
  }, [fetchData]);

  const days = getDaysInMonth(month);

  const initials = getDaysInititals(month);

  const { weekColSpans, daySpans } = getWeekColSpans(initials, days);

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

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Table style={{ width: "100%", tableLayout: "fixed" }} size="small">
      <TableHead>
        <TableRow>
          <TableCell width="8%"></TableCell>
          <TableCell width="8%"></TableCell>
          <TableCell width="8%"></TableCell>
          {new Array(31).fill(0).map((_, i) => (
            <TableCell width="2.419%" key={i}></TableCell>
          ))}
          <TableCell width="1%"></TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center" colSpan={2}>
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
          <TableCell colSpan={10}></TableCell>
          <TableCell colSpan={2} align="center">
            <IconButton
              size="small"
              style={{ padding: 0 }}
              onClick={onPrevious}
            >
              <PreviousIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell colSpan={6}>
            <Typography align="center">
              <b>{month}</b>
            </Typography>
          </TableCell>
          <TableCell colSpan={2} align="center">
            <IconButton size="small" style={{ padding: 0 }} onClick={onNext}>
              <NextIcon fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell colSpan={13}></TableCell>
        </TableRow>

        {/* Week Spans */}
        <TableRow>
          <TableCell colSpan={3}></TableCell>
          {weekColSpans.map((span, i) => (
            <TableCell
              colSpan={span}
              key={i}
              style={{
                border: "1px solid black",
                boxSizing: "border-box"
              }}
            >
              <Typography align="center">
                <b>S{i}</b>
              </Typography>
            </TableCell>
          ))}
          {new Array(31 - days).fill(0).map((_, i) => (
            <TableCell key={i}></TableCell>
          ))}
          <TableCell></TableCell>
        </TableRow>

        {/* Days Initials */}
        <TableRow>
          <TableCell colSpan={3}></TableCell>
          {initials.map((c, i) => (
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
            >
              <Typography align="center">{c}</Typography>
            </TableCell>
          ))}
          {new Array(31 - days).fill(0).map((_, i) => (
            <TableCell key={i}></TableCell>
          ))}
          <TableCell></TableCell>
        </TableRow>

        {/* Date */}
        <TableRow>
          <TableCell colSpan={3}></TableCell>
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
            >
              <Typography align="center">{i + 1}</Typography>
            </TableCell>
          ))}
          {new Array(31 - days).fill(0).map((_, i) => (
            <TableCell key={i} width="2.419%"></TableCell>
          ))}
          <TableCell></TableCell>
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
}

export default MonthView;
