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

const tip = d3
  .select("body")
  .append("div")
  .attr("class", "card")
  .style("padding", "8px") // Add some padding so the tooltip content doesn't touch the border of the tooltip
  .style("position", "absolute") // Absolutely position the tooltip to the body. Later we'll use transform to adjust the position of the tooltip
  .style("background", "#333")
  .style("color", "white")
  .style("left", 0)
  .style("top", 0)
  .style("visibility", "hidden");

// Update Func
const update = (params) => {
  // Refaktor transisi
  const t = d3.transition("arcGrow").duration(750);

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

  g.selectAll("path")
    .on("mouseover", (e, d) => {
      let content = `<div class="name">${d.data.nama}</div>`;
      content += `<div class="biaya">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR'}).format(d.data.biaya)}</div>`;
      content += `<div class="delete">Klik untuk menghapus data.</div>`;
      tip.html(content).style("visibility", "visible");
      handleMouseOver(e, d);
    })
    .on("mouseout", (e, d) => {
      tip.style("visibility", "hidden");
      handleMouseOut(e, d);
    })
    .on("mousemove", (e, d) => {
      // We can calculate the mouse's position relative the whole page by using event.pageX and event.pageY.
      tip.style("transform", `translate(${e.pageX + 20}px,${e.pageY}px)`);
    })
    .on("click", handleClick);
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
  d3.select(e.currentTarget)
    .transition("changeColor")
    .duration(200)
    .attr("fill", "black");
};
const handleMouseOut = (e, d) => {
  // console.log(d)
  d3.select(e.currentTarget)
    .transition("changeColor")
    .duration(200)
    .attr("fill", color(d.data.nama));
};
const handleClick = (e, d) => {
  const id = d.data.id;
  db.collection("budgets").doc(id).delete();
};
