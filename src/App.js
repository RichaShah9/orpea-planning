import React from "react";
import faker from "faker";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  IconButton,
  Typography,
  Collapse,
  Button,
  Divider
} from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import { AddCircle, RemoveCircle } from "@material-ui/icons";

import Popup from "./components/Popup";
import DateHandler from "./components/DateHandler";
import { COLORS } from "./constants";
import AxelorService from "./service/axelor.rest";

import "./App.css";

const MAX_SERVICE = 5;
const MAX_PROFILE = 5;
const MAX_EMPLOYEE = 10;
const profileService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.ProfileDay"
});
const employeeService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.EmployeeDay"
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
  }
}));

function getColorFields() {
  const fields = [];
  for (let i = 8; i <= 22; i++) {
    fields.push(`h${i}ColorSelect`);
  }
  return fields;
}

function getRandomNumber(max = 5, min = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function getColorHours() {
  let hour = 8;
  return new Array(15).fill(0).reduce(acc => {
    acc[`color${hour++}h`] = COLORS[getRandomNumber(5, 0)];
    return acc;
  }, {});
}

function getEmployee() {
  return {
    name: faker.name.firstName(),
    ...getColorHours()
  };
}

function getProfile() {
  return {
    name: faker.commerce.department(),
    employees: new Array(getRandomNumber(MAX_EMPLOYEE))
      .fill(0)
      .map(getEmployee),
    ...getColorHours()
  };
}

function getService() {
  return {
    name: faker.company.companyName(),
    profiles: new Array(getRandomNumber(MAX_PROFILE)).fill(0).map(getProfile)
  };
}

function getFakeData() {
  return new Array(getRandomNumber(MAX_SERVICE)).fill(0).map(getService);
}

function ColorGrid({ record, profile, employee, onColorChange }) {
  return (
    <Grid container justify="space-between">
      {getColorFields().map((key, i) => (
        <Grid item key={i} align="center">
          <Popup
            color={record[key]}
            profile={profile}
            employee={employee}
            onColorChange={value => onColorChange(key, value)}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function Employee({ profile, employee }) {
  const onEmployeeChange = React.useCallback(
    (key, value) => {
      employeeService.save({
        id: employee.id,
        version: employee.version,
        [key]: value
      });
    },
    [employee]
  );

  return (
    <>
      <Grid item xs={12}>
        <Grid container alignItems="center">
          <Grid item xs={2}></Grid>
          <Grid item xs={3}>
            <Typography title={employee.name} noWrap style={{ color: "gray" }}>
              {employee.name}
            </Typography>
          </Grid>
          <Grid item xs={7} align="center">
            <ColorGrid
              record={employee}
              employee={employee}
              profile={profile}
              onColorChange={onEmployeeChange}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

function Profile({ profile }) {
  const [checked, setChecked] = React.useState(true);
  const onClick = React.useCallback(() => {
    setChecked(checked => !checked);
  }, []);

  const Icon = checked ? RemoveCircle : AddCircle;
  const color = checked ? "green" : "#2f4050";

  const { employees = [] } = profile;
  const onProfileChange = React.useCallback(
    (key, value) => {
      profileService.save({
        id: profile.id,
        version: profile.version,
        [key]: value
      });
    },
    [profile]
  );

  return (
    <>
      <Grid item xs={12}>
        <Grid container alignItems="center">
          <Grid item xs={1}></Grid>
          <Grid item xs={4}>
            <Grid container alignItems="center">
              <Grid item>
                <Typography title={profile.name} noWrap>
                  {profile.name}
                </Typography>
              </Grid>
              {employees.length > 0 && (
                <Grid item>
                  <IconButton onClick={onClick} size="small">
                    <Icon fontSize="small" style={{ color }} />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item xs={7} align="center">
            <ColorGrid
              record={profile}
              profile={profile}
              onColorChange={onProfileChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Collapse in={checked}>
              {employees.map((employee, i) => (
                <Employee employee={employee} key={i} profile={profile} />
              ))}
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

function Service({ service }) {
  const { profiles = [] } = service;

  const [checked, setChecked] = React.useState(true);

  const onClick = React.useCallback(() => {
    setChecked(checked => !checked);
  }, []);

  const Icon = checked ? RemoveCircle : AddCircle;
  const color = checked ? "green" : "#2f4050";

  return (
    <>
      <Grid item xs={6} style={{ paddingTop: profiles.length === 0 ? 25 : 0 }}>
        <Grid container alignItems="center">
          <Grid item>
            <Typography
              title={service.name}
              noWrap
              style={{ fontWeight: "bold" }}
            >
              {service.name}
            </Typography>
          </Grid>
          {profiles.length > 0 && (
            <Grid item>
              <IconButton size="small" onClick={onClick}>
                <Icon style={{ color }} fontSize="small" />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item xs={6}></Grid>
      <Grid item xs={12}>
        <Collapse in={checked}>
          {profiles.map((profile, i) => {
            return <Profile profile={profile} key={i} />;
          })}
        </Collapse>
      </Grid>
    </>
  );
}

function Header({ onRefresh, date, onPrevious, onNext }) {
  return (
    <>
      <Grid item xs={1}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          style={{ textTransform: "none" }}
        >
          Refresh
        </Button>
      </Grid>
      <Grid item xs={2}></Grid>
      <Grid item xs={2}></Grid>
      <Grid item xs={7}>
        <DateHandler date={date} onPrevious={onPrevious} onNext={onNext} />
      </Grid>
    </>
  );
}

function View() {
  const [data, setData] = React.useState([]);

  const [date, setDate] = React.useState(
    moment(new Date()).format("DD-MM-YYYY")
  );

  const fetchData = React.useCallback(() => {
    const profileFields = [
      "service",
      "employee",
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
    setData(getFakeData());
  }, [date]);

  const onRefresh = React.useCallback(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const classes = useStyles();

  return (
    <Grid container className={classes.container} alignItems="center">
      <Header
        onRefresh={onRefresh}
        onNext={onNext}
        onPrevious={onPrevious}
        date={date}
      />
      <Divider style={{ width: "100%" }} />
      <Grid className={classes.treeView}>
        {data.map((service, i) => (
          <React.Fragment key={i}>
            <Service service={service} key={i} />
            <Divider style={{ width: "100%", marginTop: 25 }} />
          </React.Fragment>
        ))}
      </Grid>
    </Grid>
  );
}

function App() {
  return <View />;
}

export default App;
