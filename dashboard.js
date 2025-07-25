d3.csv("data/home_values.csv", d3.autoType).then(allStates => {
  // allStates is an array of objects, where each object has:
  //   RegionName, State, 1996-01, 1996-02, …, 2025-07, etc.
  const ga = allStates.find(d => d.RegionName === "Georgia");
  // turn ga’s monthly fields into [{ date: Date, value: Number }, …]
  const timeSeries = Object.entries(ga)
    .filter(([key,val]) => key.match(/^\\d{4}-\\d{2}$/))
    .map(([month, val]) => ({ 
       date: new Date(month + "-01"), 
       value: val 
    }));
    
  drawTimeSeries(timeSeries);
  // …then draw your map using the same `ga` object for the latest value…
});
