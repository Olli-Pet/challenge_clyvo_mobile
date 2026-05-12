import Svg, { Path } from "react-native-svg";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function OndaBottom() {
  return (
    <Svg
      width={width + 40}
      height={180}
      viewBox="0 0 430 180"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        bottom: 0,
        left: -20,
      }}
    >
      <Path
        fill="#E7B84C"
        d="M0,60
           C70,10 150,150 260,120
           C350,95 390,30 430,0
           V180 H0 Z"
      />
    </Svg>
  );
}