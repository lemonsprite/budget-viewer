// setup
const setup = {
  height: 300,
  width: 300,
  radius: 150,
};

const center = {
  x: setup.width / 2 + 5,
  y: setup.height / 2 + 5,
};

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", setup.width + 150)
  .attr("height", setup.height + 150);

const g = svg
  .append("g")
  .attr("transform", `translate(${center.x}, ${center.y})`);

//   Membuat angle data
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.biaya);
