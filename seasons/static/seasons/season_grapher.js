/*******************************************************************************
 * 
 * File: season_grapher.js
 * 
 * Description: Creates a line graph of NBA team winning percentage rankings.
 *
 * Dependencies: d3.js
 * 
 ******************************************************************************/

(function(){
    
    // incomingData is a global that's passed in from the HTML template


    var teamObject = [

        // Eastern Conference
        { name: "Atlanta Hawks", conference: "Eastern", color1: "rgb(225, 58, 62)", color2: "rgb(6, 25, 34)" }, 
        { name: "Boston Celtics", conference: "Eastern", color1: "rgb(0, 131, 72)", color2: "rgb(0, 131, 72)" }, 
        { name: "Brooklyn Nets", conference: "Eastern", color1: "rgb(6, 25, 34)", color2: "rgb(161, 161, 164)" }, 
        { name: "Charlotte Hornets", conference: "Eastern", color1: "rgb(29, 17, 96)", color2: "rgb(29, 17, 96)" }, 
        { name: "Chicago Bulls", conference: "Eastern", color1: "rgb(206, 17, 65)", color2: "rgb(6, 25, 34)" },
        { name: "Cleveland Cavaliers", conference: "Eastern", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" },  
        { name: "Detroit Pistons", conference: "Eastern", color1: "rgb(237, 23, 76)", color2: "rgb(0, 107, 182)" }, 
        { name: "Indiana Pacers", conference: "Eastern", color1: "rgb(255, 198, 51)", color2: "rgb(0, 39, 93)" }, 
        { name: "Miami Heat", conference: "Eastern", color1: "rgb(152, 0, 46)", color2: "rgb(6, 25, 34)" }, 
        { name: "Milwaukee Bucks", conference: "Eastern", color1: "rgb(0, 71, 27)", color2: "rgb(240, 235, 210)" }, 
        { name: "New York Knicks", conference: "Eastern", color1: "rgb(0, 107, 182)", color2: "rgb(245, 132, 38)" }, 
        { name: "Orlando Magic", conference: "Eastern", color1: "rgb(0, 125, 197)", color2: "rgb(196, 206, 211)" }, 
        { name: "Philadelphia 76ers", conference: "Eastern", color1: "rgb(237, 23, 76)", color2: "rgb(0, 107, 182)" },
        { name: "Toronto Raptors", conference: "Eastern", color1: "rgb(206, 17, 65)", color2: "rgb(6, 25, 34)" }, 
        { name: "Washington Wizards", conference: "Eastern", color1: "rgb(0, 43, 92)", color2: "rgb(227, 24, 55)" }, 
        
        // Western Conference
        { name: "Los Angeles Lakers", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "San Antonio Spurs", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Utah Jazz", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Dallas Mavericks", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Minnesota Timberwolves", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Los Angeles Clippers", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Oklahoma City Thunder", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Portland Trail Blazers", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Golden State Warriors", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Memphis Grizzlies", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Houston Rockets", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Phoenix Suns", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Sacramento Kings", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "New Orleans Pelicans", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }, 
        { name: "Denver Nuggets", conference: "Western", color1: "rgb(134, 0, 56)", color2: "rgb(253, 187, 48)" }
    ]



    main();


    function main() {

        console.log("INCOMING", incomingData);

        // Set graph dimensions
        var margins = {top: 20, right: 200, bottom: 30, left: 50};
        var width = 7000 - margins.left - margins.right;
        var height = 700 - margins.top - margins.bottom;

        // Builds the SVG object that the graph will be rendered to
        var svg = generateBlankSVG(width, height, margins);

        incomingData = convertDateStringsToDates(incomingData);

        // Sets X value (dates) and Y value (win percentage) scaling functions
        var xScale = getXScale(incomingData, width);
        var yScale = getYScale(incomingData, height);

        // Draws the X and Y Axes
        svg = drawAxes(svg, xScale, yScale, height, width);

        drawGraphContent(svg, incomingData, xScale, yScale);


        var bisectDate = d3.bisector(function(d) { return d.date; }).left;

        incomingData = convertDatesToDateStrings(incomingData);

        buildTooltip();
        
        function buildTooltip() {

            // Create a tooltip grouping element and hide contents initially
            var focus = svg.append("g").attr("class", "focus")
                                       .style("display", "none").style("opacity", "0.8");
            
            // Create a rectangular colored box for the tooltip to serve as a background
            var box = focus.append("rect").attr("class", "tooltop-box")
                                          .attr("width", (width/25)).attr("height", (height/8))
                                          .style("fill", "darkslategray");
            

            // Add text elements to the box
            focus.append("text").attr("class", "teamdate")
                                .attr("x", 12).attr("dy", "3em")
                                .style("font-size", 24).style("fill", "white");

            focus.append("text").attr("class", "team")
                                .attr("x", 12)
                                .attr("dy", "1em")
                                .style("font-size", 24)
                                .style("fill", "white");

            focus.append("text").attr("class", "teamrecord")
                                .attr("x", 12).attr("dy", "2em")
                                .style("font-size", 24).style("fill", "white");

            // put an overlay layer over the entire D3 image that captures all mouse movement
            var overlay = svg.append("rect").attr("class", "overlay").attr("width", width).attr("height", height);
            
            overlay.on("mouseover", function() { 
                focus.style("display", null); 
            });
            
            overlay.on("mouseout", function() { 
                focus.style("display", "none"); 
            });

            overlay.on("mousemove", function () {

                // Convert mouse coords to date and rank
                var mouseCoords = d3.mouse(this);
                var mouseX = mouseCoords[0];
                var mouseY = mouseCoords[1];
                var date = xScale.invert(mouseX);
                var ranking = yScale.invert(mouseY);

                // Get team date record from date and ranking
                teamGame = getTeamAndGame(date, ranking);

                // Position the tooltip and feed it data
                focus.attr("transform", "translate(" + (mouseX+10) + "," + (mouseY+10) + ")");
                focus.select(".team").text(teamGame.team);
                focus.select(".teamrecord").text(teamGame.win.toString() + " - " + teamGame.loss.toString());
                focus.select(".teamdate").text(teamGame.date);
            });

        }



    }


    function generateBlankSVG(width, height, margins) {
 
        // Create SVG and insert into <body>
        var svg = d3.select("body").append("svg");
        svg.attr("width", width + margins.left + margins.right).attr("height", height + margins.top + margins.bottom);
        
        // Create a <g> element within the SVG
        var g = svg.append("g")
        g.attr("transform", "translate(" + margins.left + "," + margins.top + ")");        
 
        // Return the g element, which is a transform of the SVG parent (and the SVG's only child element).
        return g;

    }



    // Converts date string ("150930") into D3 date format
    function convertDateStringsToDates(rawData) {
        
        var dateStringFormatter = d3.time.format("%Y-%m-%d");

        rawData.forEach(function(team) {
            team.values.forEach(function(dayRecord) {
                dayRecord.date = dateStringFormatter.parse(dayRecord.date);
            });
        });

        return rawData;

    }



    // Converts dates from D3 format to strings
    function convertDatesToDateStrings(rawData) {
        
        var dateStringFormatter = d3.time.format("%Y-%m-%d");

        rawData.forEach(function(team) {
            team.values.forEach(function(dayRecord) {
                dayRecord.date = dateStringFormatter(dayRecord.date);
            });
        });

        return rawData;

    }



    function drawAxes(svg, xScale, yScale, height, width) {

        // Draw X Axis
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(200).tickFormat(d3.time.format("%d"));
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

        // Draw Y Axis
        var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(14).tickSize(-width, 0);
        svg.append("g").attr("class", "y axis").call(yAxis);
        svg.append("text").attr("transform", "rotate(-90)").attr("y", -40).attr("x", -200).attr("dy", ".71em").style("text-anchor", "end").text("League Ranking");

        // Add a cutoff line under the 8th position
        var cutoff = svg.select(".y.axis .tick:nth-child(8)").append("line").attr("y1", "25").attr("y2", "25").attr("x2", "6750"); 

        return svg;

    }


    function drawGraphContent(svg, rawData, xScale, yScale) {

        // Makes an empty selector
        var emptySelector = svg.selectAll(".city");
        
        // Creates one empty <g> element in the SVG per city with a class of "city" and data appended to object
        var lineElements = emptySelector.data(rawData).enter().append("g").attr("class", "team");

        // Draws a path based on the data specified
        var lineLabels = rawData.map(x => x.name);
        lineElements = drawLines(lineElements, xScale, yScale, lineLabels);


        function drawLines(lineElements, xScale, yScale, lineLabels) {

            // Add a <path> tag to each <g> tag
            var pathElements = lineElements.append("path").attr("class", "line");
            
            // Add the path data points via the mapping function
            pathElements.attr("d", mapLine);
            
            // Select the path color based on the mapping function
            // Maps the names of the cities to the discrete color domain (color can have up to 30 values)  
            pathElements.style("stroke", mapColor);

            // Put the city name on the end of the line
            drawLineLabels(lineElements, xScale, yScale);

            return lineElements;


            // Map the points in the raw data element to points for the line
            function mapLine(d) {

                var lineMapping = d3.svg.line().interpolate("linear");            
                lineMapping.x(mapX);
                lineMapping.y(mapY);   

                return lineMapping(d.values);             


                // Set up X value mapping function
                function mapX(d) {
                    return xScale(d.date);
                }

                // Set up Y value mapping function
                function mapY(d) {
                    return yScale(d.ranking); 
                }

            }


            // Map the city name to a color pair
            function mapColor(d) {

                var filteredSet = teamObject.filter(x => x["name"] == d.name);

                if (filteredSet.length == 1 && filteredSet[0]["color1"] && filteredSet[0]["color2"]) {
                    var t = textures.lines().thicker().stroke(filteredSet[0]["color1"]).background(filteredSet[0]["color2"]);
                    svg.call(t);
                    return t.url();
                } 

                var colorMapping = d3.scale.category20();
                colorMapping.domain(lineLabels); 
     
                return colorMapping(d.name); 
     
            }


            // Adds name of the city to the end of each line
            function drawLineLabels(lineElements, xScale, yScale) {

                var lineTerminals = lineElements.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }).append("text");
                lineTerminals.attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.ranking) + ")"; });
                lineTerminals.attr("x", 3).attr("dy", ".35em").attr("class", "label")
                lineTerminals.text(function(d) { return d.name; });

            }

        }

    }


    function getXScale(rawData, width) {

        var datesArray = [];

        rawData.forEach(function(team) {
            team.values.forEach(function(v) {
                datesArray.push(v.date);
            });
        });

        var dateRange = d3.extent(datesArray);

        var xScale = d3.time.scale();
        xScale.domain(dateRange);
        xScale.range([0, width]);

        return xScale;

    }


    function getYScale(rawData, height) {

        var minPct = d3.min(rawData, function(team) { 
            return d3.min(team.values, function(v) { 
                return v.ranking; 
            }); 
        });

        var maxPct = d3.max(rawData, function(team) { 
            return d3.max(team.values, function(v) { 
                return v.ranking; 
            }); 
        });

        var yScale = d3.scale.linear();
        yScale.domain([minPct, maxPct]);
        yScale.range([0, height]);

        return yScale;
        
    }


    function getTeamAndGame(mouseDate, mouseRank) {

        var dateStringFormatter = d3.time.format("%Y-%m-%d");
        var dateString = dateStringFormatter(mouseDate);

        var ranking = Math.round(mouseRank);

        var clickedTeamGame;

        for (var index in incomingData) {
            team = incomingData[index];
            clickedTeamGame = team.values.filter( v => (v.date == dateString) && (v.ranking == ranking) ); 
            if (clickedTeamGame.length == 1) {
                clickedTeamGame = clickedTeamGame[0];
                console.log(clickedTeamGame);
                break;
            }
        }
        
        console.log(clickedTeamGame);

        return clickedTeamGame;
    
    }


})()