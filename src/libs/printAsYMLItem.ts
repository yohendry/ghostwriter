import cleanString from "./cleanString";

function printAsYMLItem(str = "") {
  

  return `\n  - ${cleanString(str)}`;


}

export default printAsYMLItem;
