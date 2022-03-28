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

//   Mengenerate arc
const arc = d3
  .arc()
  .outerRadius(setup.radius)
  .innerRadius(setup.radius / 2);


//   Update Func 
const update = (params) => {
    // 
}

//   Data Firestore / Data Listener
let data = []
db.collection("budgets").onSnapshot((d) => {

  d.docChanges().forEach((x) => {
    const doc = { ...d.doc.data(), id: d.doc.id };

    switch (d.type) {
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
  update(data)
});
