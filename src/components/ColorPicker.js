import React from "react";
import { CirclePicker } from "react-color";

import { COLORS } from "../constants";

function ColorPicker({ color, onChange = () => {} }) {
  return <CirclePicker colors={COLORS} color={color} onChange={onChange} />;
}

export default ColorPicker;
