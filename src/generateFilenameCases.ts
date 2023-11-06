export function generateFilenameCases(propList: any, settings) {
  let nameList = [{ newName: settings, data: settings }];
  propList.forEach((prop) => {
    if (prop.startsWith('[')) {
      const property = prop.substring(1, prop.length - 1);
      nameList = nameList.flatMap(({ newName, data }) => newName[property].map((el) => ({ newName: el, data: el })));
    } else {
      nameList = nameList.map(({ newName, data }) => ({
        newName: newName[prop],
        data: typeof prop === 'object' && !Array.isArray(data[prop]) ? data[prop] : data,
      }));
    }
  });
  return nameList;
}
