import React from "react";
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
import { ArrowRight, ArrowDropDown } from "@material-ui/icons";

import Popup from "./components/Popup";
import DateHandler from "./components/DateHandler";
import AxelorService from "./service/axelor.rest";

import "./App.css";

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

function Employee({ profile, employee, onChange }) {
  const onEmployeeChange = React.useCallback(
    (key, value) => {
      employeeService.save({
        id: employee.id,
        version: employee.version,
        [key]: value
      }).then(res => {
        if(res.data) {
          onChange({employeeId: employee.id, version: res.data[0].version, key, value});
        }
      });
    },
    [employee, onChange]
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

function Profile({ profile, onChange }) {
  const [checked, setChecked] = React.useState(true);
  const onClick = React.useCallback(() => {
    setChecked(checked => !checked);
  }, []);

  const Icon = checked ? ArrowDropDown : ArrowRight;
  const color = checked ? "green" : "#2f4050";

  const { employees = [] } = profile;
  const onProfileChange = React.useCallback(
    (key, value) => {
      profileService.save({
        id: profile.id,
        version: profile.version,
        [key]: value
      }).then(res => {
        if(res.data) {
          onChange({version: res.data[0].version, profileId: profile.id, key, value});
        }
      });
    },
    [profile, onChange]
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
                    <Icon style={{ color }} />
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
                <Employee 
                  employee={employee} 
                  key={i} 
                  profile={profile} 
                  onChange={(params) => onChange({...params, profileId: profile.id})} 
                />
              ))}
            </Collapse>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

function Service({ service, onChange }) {
  const { profiles = [] } = service;

  const [checked, setChecked] = React.useState(true);

  const onClick = React.useCallback(() => {
    setChecked(checked => !checked);
  }, []);

  const Icon = checked ? ArrowDropDown : ArrowRight;
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
              <IconButton onClick={onClick}>
                <Icon fontSize="large" style={{ color }} />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item xs={6}></Grid>
      <Grid item xs={12}>
        <Collapse in={checked}>
          {profiles.map((profile, i) => {
            return <Profile profile={profile} key={i} onChange={(params) => onChange({serviceId: service.id, ...params})} />;
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
  }, [date]);

  const onRefresh = React.useCallback(() => {
    fetchData();
  }, [fetchData]);

  const onChange = React.useCallback((record) => {
    setData(data => {
      const serviceIndex = data.findIndex(s => s.id === record.serviceId);
      const service = data[serviceIndex];
      const profileIndex = service.profiles.findIndex(p => p.id === record.profileId);
      const profile = service.profiles[profileIndex];
      if(record.employeeId) {
        const employeeIndex = profile.employees.findIndex(p => p.id === record.employeeId);
        profile.employees[employeeIndex] = {...profile.employees[employeeIndex], version: record.version, [record.key]: record.value};
      } else {
        profile[record.key] = record.value;
        profile['version'] = record.version;
      }
      service.profiles[profileIndex] = {...profile};
      data[serviceIndex] = {...service};
      return [...data];
    });
  }, [])

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
            <Service service={service} key={i} onChange={onChange} />
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
