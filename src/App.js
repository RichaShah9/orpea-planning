import React from "react";
import faker from "faker";

import Popup from "./components/Popup";
import { COLORS } from "./constants";

import "./App.css";

function getFakeData() {
  return new Array(10).fill(0).map(() => ({
    employee: { name: faker.name.firstName() },
    profile: { name: faker.commerce.department() }
  }));
}

function View() {
  const data = getFakeData();
  return data.map(item => (
    <div>
      {new Array(15).fill(0).map((_, i) => {
        return (
          <Popup
            key={i}
            color={COLORS[Math.floor(Math.random() * 5)]}
            {...item}
          />
        );
      })}
    </div>
  ));
}

function App() {
  return <View />;
}

export default App;
