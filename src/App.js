import React from "react";
import faker from "faker";

import Popup from "./components/Popup";
import { COLORS } from "./constants";

import "./App.css";

const MAX_SERVICE = 5;
const MAX_PROFILE = 5;
const MAX_EMPLOYEE = 10;

function getRandomNumber(max = 5) {
  return Math.floor(Math.random() * max);
}

function getColorHours() {
  let hour = 8;
  return new Array(15).fill(0).reduce(acc => {
    acc[`color${hour++}h`] = COLORS[getRandomNumber()];
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
    employees: new Array(MAX_EMPLOYEE).fill(0).map(getEmployee),
    ...getColorHours()
  };
}

function getService() {
  return {
    name: faker.company.companyName(),
    profiles: new Array(MAX_PROFILE).fill(0).map(getProfile)
  };
}

function getFakeData() {
  return new Array(MAX_SERVICE).fill(0).map(getService);
}

function Employee({ profile, employee }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center"
      }}
    >
      <h5>{employee.name}</h5>
      <div>
        {Object.keys(employee).map((key, i) =>
          key.includes("color") ? (
            <Popup
              key={i}
              color={employee[key]}
              employee={employee}
              profile={profile}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

function Profile({ profile }) {
  const { employees = [] } = profile;
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <h4>Profile : {profile.name}</h4>
        <div>
          {Object.keys(profile).map((key, i) =>
            key.includes("color") ? (
              <Popup key={i} color={profile[key]} profile={profile} />
            ) : null
          )}
        </div>
      </div>
      {employees.map((employee, i) => (
        <Employee employee={employee} key={i} profile={profile} />
      ))}
    </>
  );
}

function View() {
  const data = getFakeData();

  return (
    <div>
      {data.map((service, i) => {
        const { profiles = [] } = service;
        return (
          <React.Fragment key={i}>
            <h3>Service : {service.name}</h3>
            {profiles.map((profile, i) => {
              return <Profile profile={profile} key={i} />;
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function App() {
  return <View />;
}

export default App;
