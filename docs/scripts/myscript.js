// Sample data
const sampleData = {
    "Brazil": [{year: 2005, value: 638582}, {year: 2010, value: 592640}, {year: 2015, value: 710304}, {year: 2020, value: 1079708}],
    "United States of America": [{year: 2005, value: 39258293}, {year: 2010, value: 44183643}, {year: 2015, value: 48178877}, {year: 2020, value: 50632836}],
    "China": [{year: 2005, value: 678947}, {year: 2010, value: 849861}, {year: 2015, value: 978046}, {year: 2020, value: 1039675}],
    "India": [{year: 2005, value: 5936740}, {year: 2010, value: 5574018}, {year: 2015, value: 5210847}, {year: 2020, value: 4878704}],
    "Africa": [{year: 2005, value: 16040087}, {year:2010,value :17806677},{year :2015,value :22860792},{year :2020,value :25389464}],
    
    // New countries
    "Germany": [{year: 2005, value: 9402447}, {year: 2010, value: 9812263}, {year: 2015, value: 10220418}, {year: 2020, value: 15762457}],
    "France": [{year: 2005, value: 6737600}, {year: 2010, value: 7309986}, {year: 2015, value: 7878338}, {year: 2020, value: 8524876}],
    "Japan": [{year: 2005, value: 2011555}, {year: 2010, value: 2134151}, {year: 2015, value: 2232189}, {year :2020,value :2770996}],
    "Mexico": [{year :2005,value :712648},{year :2010,value :969710},{year :2015,value :1013691},{year :2020,value :1197624}],
    "Australia": [{year :2005,value :4878030},{year :2010,value :5882980},{year :2015,value :6729730},{year :2020,value :7685860}]
};

// Set up SVG dimensions
const margin = {top :20,right :20,bottom :70,left :120}; // Increased bottom and left margins for axis labels
const width =800-margin.left-margin.right;
const height =400-margin.top-margin.bottom;

// Create SVG
const svg = d3.select("#chart")
              .append("svg")
              .attr("width",width+margin.left+margin.right)
              .attr("height",height+margin.top+margin.bottom)
              .append("g")
              .attr("transform",`translate(${margin.left},${margin.top})`);

// Expanded color palette to match the number of countries
const colorPalette = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5"
];

// Scales
const xScale = d3.scaleLinear()
                 .domain([2004,2020]) // Adjusted domain to move the year labels slightly
                 .range([0,width]);

const yScale = d3.scaleLinear()
                 .range([height,0]);

// Tooltip
const tooltip = d3.select("#tooltip");

// Axes
const xAxis = svg.append("g")
                 .attr("transform", `translate(0,${height})`)
                 .call(d3.axisBottom(xScale)
                 .tickValues([2005,2010,2015,2020]) // Removed year 2000 from ticks
                 .tickFormat(d3.format("d")));

const yAxis = svg.append("g");

// Line generator
const line = d3.line()
               .x(d => xScale(d.year))
               .y(d => yScale(d.value));

// Tracks active lines
const activeLines ={};

// Add X-Axis Label
svg.append("text")
   .attr("class", "x label")
   .attr("text-anchor", "end")
   .attr("x", width /2)
   .attr("y", height +50) // Position below the axis
   .text("Year");

// Add Y-Axis Label
svg.append("text")
   .attr("class", "y label")
   .attr("text-anchor", "end")
   .attr("y",-60) // Position to the left of the axis
   .attr("x",-height/2)
   .attr("dy",".75em")
   .attr("transform","rotate(-90)")
   .text("International Migrant Stock");

// Add Title to the Graph
svg.append("text")
   .attr("x", width / 2) // Centered horizontally
   .attr("y", -10) // Positioned slightly above the graph
   .attr("text-anchor", "middle") // Center alignment
   .style("font-size", "12px") // Font size
   .style("font-weight", "bold") // Bold text
   .style("text-decoration", "underline") // Underline the title
   .text("International Migrant Stock Over Time"); // Title text

// Function to add a line for a country
function addLine(country) {
    if (country && !activeLines[country]) {
        const countryData = sampleData[country];
        const allValues = Object.values(sampleData).flatMap(d => d.map(entry => entry.value));
        yScale.domain([0,d3.max(allValues)]);
        yAxis.call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")));

        const color = colorPalette[Object.keys(activeLines).length % colorPalette.length];

        const countryLine = svg.append("path")
                               .datum(countryData)
                               .attr("class",`line-${country}`)
                               .attr("fill","none")
                               .attr("stroke",color)
                               .attr("stroke-width",2)
                               .attr("d",line);

        const points = svg.selectAll(`.points-${country}`)
                          .data(countryData)
                          .enter()
                          .append("circle")
                          .attr("class",`points-${country}`)
                          .attr("cx",d => xScale(d.year))
                          .attr("cy",d => yScale(d.value))
                          .attr("r",5)
                          .attr("fill",color)
                          .on("mouseover",(event,d) => {
                              tooltip.transition().duration(200).style("opacity",.9);
                              tooltip.html(`<div class="legend"><strong>${country}</strong><br> Year:${d.year}<br> Value:${d3.format(",")(d.value)}</div>`)
                                     .style("left",(event.pageX+10)+"px")
                                     .style("top",(event.pageY-28)+"px");
                          })
                          .on("mouseout",() => {
                              tooltip.transition().duration(500).style("opacity",0);
                          });

        svg.append("text")
           .attr("class", `label-${country}`)
           .attr("x", xScale(countryData[countryData.length -1].year) +5)
           .attr("y", yScale(countryData[countryData.length -1].value))
           .style("fill", color)
           .style("font-size","12px")
           .text(country);

        activeLines[country] ={line :countryLine ,points};
    }
}

// Add initial lines for USA, Africa, and India
["United States of America","Africa","India"].forEach(addLine);

// Add Line Button
d3.select("#addBtn").on("click",function() {
    const selectedCountry = d3.select("#countrySelect").property("value");
    addLine(selectedCountry);
});

// Remove Line Button
d3.select("#removeBtn").on("click",function() {
    const selectedCountry = d3.select("#countrySelect").property("value");
    if (selectedCountry && activeLines[selectedCountry]) {
        activeLines[selectedCountry].line.remove();
        activeLines[selectedCountry].points.remove();
        svg.select(`.label-${selectedCountry}`).remove();
        delete activeLines[selectedCountry];
    }
});
