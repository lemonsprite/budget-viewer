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

// Scale Warna
const color = d3.scaleOrdinal(d3["schemeSet3"]);

// Legend setup
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${chartSet.width + 40}, 10)`);

const legend = d3.legendColor().shapePadding(10).shape("circle").scale(color);

// Membuat angle data
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.biaya);

// Mengenerate arc
const arc = d3
  .arc()
  .outerRadius(chartSet.radius)
  .innerRadius(chartSet.radius / 2);

// Update Func
const update = (params) => {
  // Refaktor transisi
  const t = d3.transition().duration(750);

  // Update Scale Warna
  color.domain(data.map((e) => e.nama));

  // Update dan panggil legend
  legendGroup.call(legend);
  legendGroup.selectAll("text").attr("fill", "white");

  // Integrasi data ke chart
  const p = g.selectAll("path").data(pie(params));

  // Hapus path yang gak kepake
  p.exit().transition(t).attrTween("d", endTween).remove();

  // Update arc data path
  p.attr("d", arc).transition(t).attrTween("d", editTween);

  // Generate arc dari data
  p.enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .attr("fill", (e) => color(e.data.nama))
    .each(function (x) {
      this._current = x;
    })
    .transition(t)
    .attrTween("d", startTween);


  g.selectAll('path').on('mouseover', handleMouseOver).on('mouseout', handleMouseOut)
};

// Data Firestore / Data Listener
var data = [];
db.collection("budgets").onSnapshot((d) => {
  // console.log(d);
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
  // console.log(data);
  update(data);
});

//  Tween untuk pie Chart
const startTween = (d) => {
  var i = d3.interpolate(d.endAngle, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arc(d);
  };
};

const endTween = (d) => {
  var i = d3.interpolate(d.startAngle, d.endAngle);

  return function (t) {
    d.startAngle = i(t);
    return arc(d);
  };
};

/**
 * Edit Tween
 * 1. Membuat keyword fungsi untuk akses `this` pada selector
 * ex : .each(function(x) { this._current = x})
 *
 * 2. interpolate kedua objek
 *
 * 3. Update _current props dengan data baru
 */
function editTween(d) {
  var i = d3.interpolate(this._current, d);

  this._current = i(d);

  return function (t) {
    return arc(i(t));
  };
}

// Event handler
const handleMouseOver = (e, d) => {
  // console.log(e, d)
  d3.select(e.currentTarget).transition().duration(200).attr('fill', 'black')
}
const handleMouseOut = (e, d) => {
  // console.log(d)
  d3.select(e.currentTarget).transition().duration(200).attr('fill', color(d.data.nama))
}