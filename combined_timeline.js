const margin = {top: 30, right: 30, bottom: 30, left: 150};
const width = 1000 - margin.left - margin.right;
const height = 1200 - margin.top - margin.bottom;


// Append SVG to the body of the page
const svg = d3.select("#combined_timeline")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left}, ${margin.top})`)


var tooltip_combined = d3.select("#combined_timeline")
              .append("div")
              .attr("class", "tooltip-combined")
              .style("position", "absolute")
              .style("visibility", "hidden")

d3.csv("votes-by_state.csv", d => {
    return {
        year: +d["year"],
        state: d["state"],
        d_win: +d["d_win"],
        r_win: +d["r_win"],
        d_votes: +d["d_votes"],
        r_votes: +d["r_votes"]
    };
}).then(data => {
    // console.log(data);
    // csv_data = data;
    // data.win_balance = 
    data.map(d => {d.win_balance = d.r_win - d.d_win})
    data.map(d => {
        d.win_balance_text = `${d.win_balance < 0 ? "Democratic": "Republican"}: +${Math.abs(d.win_balance)}`})
    // data.vote_balance = 
    data.map(d => {d.vote_balance = d.r_votes - d.d_votes})
    data.map(d => {d.vote_balance_text =  `${d.vote_balance < 0 ? "Democratic": "Republican"}: +${Math.round(Math.abs(d.vote_balance / (d.r_votes + d.d_votes)) * 10000)/100} %`})

    // console.log(data.win_balance)
    // console.log(data.vote_balance)

    // console.log([... new Set(data.map(d => d.state))])
    // console.log(Array.from({ length: 51 }, (value, index) => index).reverse().slice(0, -1))
    
    // Adding an x-scale
    const x = d3.scaleLinear()
                .domain([d3.min(data, d => d.year)-2, d3.max(data, d => d.year)+2])
                .range([0, width]);
    // Adding a y-scale
    const y = d3.scaleOrdinal([... new Set(data.map(d => d.state))].sort(), 
        Array.from({ length: 51 }, (value, index) => index / 51 * height)
            // .reverse()
            // .slice(0, -1)
            )
                // .domain([0, d3.max(data, d => d.r_votes + d.d_votes)])
                
                // https://www.freecodecamp.org/news/javascript-range-create-an-array-of-numbers-with-the-from-method/
                // .range(Array.from({ length: 51 }, (value, index) => index).reverse().slice(0, -1));
    min_win = d3.min(data, d => d.win_balance)
    max_win = d3.max(data, d => d.win_balance)
    // console.log(`${min_win}, ${max_win}`)
    const color = d3.scaleSequential(d3.interpolateRdBu)
                    // .domain([min_win, max_win])
                    // // .range(d3.interpolateTurbo)
                    // .range(d3.schemeSet3);

    const size = d3.scaleLinear()
                   .domain([0, 1])
                   .range([height / (51 * 15), (height / (51 * 2.1))]);

                //    .range([height / (51 * 5), (height / (51 * 1.2))]);
    // get percent r_win
    // get percent r_votes

    data.map(d => {d.r_win_percent = d.r_win / (d.r_win + d.d_win)})
    data.map(d => {d.r_votes_percent = d.r_votes / (d.d_votes + d.r_votes)})
    data.map(d => {d.vote_win_diff = Math.abs(d.r_votes_percent - d.r_win_percent)})
    // console.log(data)
    // abs r_win - rvotes
    // add axes
    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(x));
    
    svg.append("g")
       .call(d3.axisLeft(y));

    // // Add in our marks
    svg.append("g")
        .selectAll("dot")
        .data(data)
        .join("circle")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.state))
            // .attr("r", height / (51 * 2))
            .attr("r", d => size(1 - d.vote_win_diff)
            // d => (height / (51*2) * (d.d_votes/(d.d_votes + d.r_votes)))
            )
            // .attr("r", d => size(d.r)**0.5)
            // .style("fill", "blue")
            .style("fill", d => color(d.d_win / (d.r_win + d.d_win)))
            .style("stroke", "black")
            .on("mouseover", function(e, d) {
                // console.log("moved")                
                return tooltip_combined.style("visibility", "visible")   // Make sure we can see the tooltip  
                                .html("<p> State: " + d.state + " ("+ d.year +")</p>"
                                    + "<p> Congressional Lean: " + d.win_balance_text + " (" + (d.r_win + d.d_win).toString() + ")</p>"
                                    
                                    + "<p> Voter Lean: " + d.vote_balance_text + "</p>"

                                // <p> Voter Lean: ${d.vote_balance_text} %</p>
                                )      // Add html to the tooltip div. In 
                                                                // this case, we're just showing a string
                                                                // that contains the text Country: followed 
                                                                // by the country name.
            })
            .on("mousemove", function(e, d) {
                console.log(e);
                return tooltip_combined.style("top",
                e.layerY + "px" 
                // (d3.event.pageY) + "px")
                // d3.select(this)     // Set the top of the tooltip to the 
                                            //   .attr("cy")+"px"
                                            ) // y position of the circle (in pixels)
                              .style("left", d3.select(this)    // Do the same to the left position
                                               .attr("cx")+"px")
                                                                
            })
            .on("mouseout", function(e, d) {                    // When you leave a mark, hide the tooltip.
                return tooltip_combined.style("visibility", "hidden")    // Try experimenting with leaving this out
                                                                // to see why this step matters.
            });
}); // end .then()

