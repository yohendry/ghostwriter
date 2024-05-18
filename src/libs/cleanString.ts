const CLEAN_STRING_REGX = /([^a-z0-9 _-]+)/gi;

function cleanString(str = "") {
  return str.replace(CLEAN_STRING_REGX, "");
}

export default cleanString;
