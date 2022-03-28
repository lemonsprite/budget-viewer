// chartSet
const chartSet = {
  height: 300,
  width: 300,
  radius: 150,
};

const center = {
  x: chartSet.width / 2 + 5,
  y: chartSet.height / 2 + 5,
};

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", chartSet.width + 150)
  .attr("height", chartSet.height + 150);

const g = svg
  .append("g")
  .attr("transform", `translate(${center.x}, ${center.y})`);

//   Membuat angle data
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.biaya);

//   Mengenerate arc
const arc = d3
  .arc()
  .outerRadius(chartSet.radius)
  .innerRadius(chartSet.radius / 2);

//   Update Func
const update = (params) => {
  // Integrasi data ke chart
  const p = g.selectAll("path").data(pie(params)).enter();

  p.append("path")
    .attr("class", "arc")
    .attr("d", arc)
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);
};

//   Data Firestore / Data Listener
var data = [];
db.collection("budgets").onSnapshot((d) => {
  //   console.log(d);
  d.docChanges().forEach((x) => {
    //   console.log(x.type);
    const doc = { ...x.doc.data(), id: x.doc.id };
    // console.log(doc);

    switch (x.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const i = data.findIndex((x) => x.id == doc.id);
        data[i] = doc;
        // console.log(data)
        break;
      case "removed":
        data = data.filter((x) => x.id !== doc.id);
        break;

      default:
        break;
    }
  });
  console.log(data);
  update(data);
});
