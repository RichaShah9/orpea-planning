import React from "react";
import faker from "faker";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, IconButton, Typography, Collapse } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import CollapseIcon from "@material-ui/icons/Remove";
import ExpandIcon from "@material-ui/icons/Add";

import Popup from "./components/Popup";
import DateHandler from "./components/DateHandler";
import { COLORS } from "./constants";
import AxelorService from './service/axelor.rest';

import "./App.css";

const MAX_SERVICE = 5;
const MAX_PROFILE = 5;
const MAX_EMPLOYEE = 10;

const useStyles = makeStyles(theme => ({
  container: {
    padding: 10
  }
}));

function getColorSelectFields() {
  const fields = [];
  for(let i = 8; i <= 22; i++) {
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

function ColorGrid({ record, profile, employee }) {
  return (
    <Grid container justify="space-between">
      {Object.keys(record).map((key, i) =>
        key.includes("color") ? (
          <Grid item key={i} align="center">
            <Popup color={record[key]} profile={profile} employee={employee} />
          </Grid>
        ) : null
      )}
    </Grid>
  );
}

function fetchData() {
  
  const profileService = new AxelorService({model: "com.axelor.apps.orpea.planning.db.ProfileDay"});
  const employeeService = new AxelorService({model: "com.axelor.apps.orpea.planning.db.EmployeeDay"})
  const profileFields = ["service", "employee", "dayDate", "profile", ...getColorSelectFields()];
  const employeeFields = [...profileFields, "profile"];
  const data = {
    criteria: [
      {fieldName: 'dayDate', operator: '=', value: moment().format("YYYY-MM-DD")},
    ]
  }
  const serviceList = [];
  const getServiceIndex = (serviceId) => {
    return serviceList.findIndex(s => s.id === serviceId);
  };
  const getProfileIndex = (list, profileId) => {
    return list.findIndex(p => p.id === profileId);
  }

  profileService.search({fields: profileFields, data}).then(res => {
    employeeService.search({fields: employeeFields, data}).then(employeeResponse => {
      const {data = []} = res;
      const {data: employeeData = []} = employeeResponse;
      const getProfile = (profile) => {
        const _profile = data.find(p => p.profile.id === profile.id) || {};
        const profileObject = {..._profile, name: profile.name, employees: []};
        delete profileObject.profile;
        delete profileObject.service;
        return profileObject;
      }

      employeeData.forEach(employee => {
        const serviceIndex = getServiceIndex(employee.service.id);
        const service = serviceIndex === -1 
        ? {name: employee.service.name, id: employee.service.id, profiles: []} 
        : serviceList[serviceIndex];
        
        const profileIndex = getProfileIndex(service.profiles, employee.id);
        const profile = profileIndex === -1 ? getProfile(employee.profile) : service.profiles[profileIndex];
        const empObject = {
          name: employee.employee.name,
          ...employee,
        };
        delete empObject.employee;
        delete empObject.profile;
        delete empObject.service;
        profile.employees.push({
          ...empObject,
        });
        if(profileIndex !== -1) {
          service.profiles[profileIndex] = {...profile};
        } else {
          service.profiles.push({...profile});
        }
        if(serviceIndex !== -1) {
          serviceList[serviceIndex] = {...service}
        } else {
          serviceList.push({...service});
        }
      });
      console.log('service', serviceList);
    });
  });
}

function Employee({ profile, employee }) {
  return (
    <>
      <Grid item xs={12}>
        <Grid container alignItems="center">
          <Grid item xs={2}></Grid>
          <Grid item xs={3}>
            <Typography title={employee.name} noWrap>
              {employee.name}
            </Typography>
          </Grid>
          <Grid item xs={7} align="center">
            <ColorGrid
              record={employee}
              employee={employee}
              profile={profile}
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

  const Icon = checked ? CollapseIcon : ExpandIcon;

  const { employees = [] } = profile;

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
              <Grid item>
                <IconButton onClick={onClick} size="small">
                  <Icon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={7} align="center">
            <ColorGrid record={profile} profile={profile} />
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

  const Icon = checked ? CollapseIcon : ExpandIcon;
  return (
    <>
      <Grid item xs={6}>
        <Grid container alignItems="center">
          <Grid item>
            <Typography title={service.name} noWrap>
              {service.name}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClick}>
              <Icon />
            </IconButton>
          </Grid>
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
        <IconButton onClick={onRefresh}>
          <RefreshIcon />
        </IconButton>
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
  const [data, setData] = React.useState(getFakeData());

  const [date, setDate] = React.useState(
    moment(new Date()).format("DD-MM-YYYY")
  );

  const onPrevious = React.useCallback(() => {
    setDate(
      moment(date, "DD-MM-YYYY")
        .subtract(1, "days")
        .format("DD-MM-YYYY")
    );
    setData(getFakeData());
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
    setData(getFakeData());
  }, []);

  const classes = useStyles();

  return (
    <Grid container className={classes.container} alignItems="center">
      <Header
        onRefresh={onRefresh}
        onNext={onNext}
        onPrevious={onPrevious}
        date={date}
      />
      {data.map((service, i) => (
        <Service service={service} key={i} />
      ))}
    </Grid>
  );
}

function App() {
  React.useEffect(() => {
    fetchData();
  })
  return <View />;
}

export default App;
