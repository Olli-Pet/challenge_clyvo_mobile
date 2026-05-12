import Svg, { Path } from "react-native-svg";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function OndaTop() {
  return (
    <Svg
      width={width + 40}
      height={180}
      viewBox="0 0 430 180"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        left: -20,
      }}
    >
      <Path
        fill="#E7B84C"
        d="M0,0 H430 V120
           C340,170 250,40 160,75
           C80,110 40,140 0,110 Z"
      />
    </Svg>
  );
}