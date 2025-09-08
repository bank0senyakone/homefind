export const ValidateData = async (data) => { // {"key": values} 
  // Checks for keys with null or undefined values, which is more precise.
  return Object.keys(data).filter((key) => data[key] == null); 
};
