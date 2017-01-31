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
    console.log("INCOMING DATA: ", incomingData);

    main();


    function main() {

        // Builds the SVG object that the graph will be rendered to
        var svg = generateBlankSVG(SVG_INNER_WIDTH, SVG_INNER_HEIGHT, SVG_MARGINS);

        // TODO: This is only for D3 - more elegant solution possible?
        incomingData = convertDateStringsToDates(incomingData);

        // Sets X value (dates) and Y value (conference rankings) scaling functions
        var xScale = getXScale(incomingData, SVG_INNER_WIDTH);
        var yScale = getYScale(incomingData, SVG_INNER_HEIGHT);

        // Draws the X and Y Axes
        svg = drawAxes(svg, xScale, yScale, SVG_INNER_HEIGHT, SVG_INNER_WIDTH);

        // Draw the actual lines
        var lineElements = drawLines(svg, incomingData, xScale, yScale);

        drawDots(incomingData, svg, xScale, yScale);

        // TODO: This is only for D3 - more elegant solution possible?
        incomingData = convertDatesToDateStrings(incomingData);

        // Build the tooltip / overlay that shows stats
        buildTooltip(svg, SVG_INNER_WIDTH, SVG_INNER_HEIGHT, xScale, yScale);
        
    }


    function generateBlankSVG(SVG_INNER_WIDTH, SVG_INNER_HEIGHT, SVG_MARGINS) {
 
        // Create SVG and insert into <body>
        var svg = d3.select("body").append("svg");
        svg.attr("width", SVG_INNER_WIDTH + SVG_MARGINS.left + SVG_MARGINS.right).attr("height", SVG_INNER_HEIGHT + SVG_MARGINS.top + SVG_MARGINS.bottom);
        
        // Create a <g> element within the SVG
        var g = svg.append("g")
        g.attr("transform", "translate(" + SVG_MARGINS.left + "," + SVG_MARGINS.top + ")");        
 
        // Return the g element, which is a transform of the SVG parent (and the SVG's only child element).
        return g;

    }


    // Converts date string ("150930") into D3 date format
    function convertDateStringsToDates(rawData) {
        
        var dateStringFormatter = d3.time.format(INCOMING_DATE_FORMAT);

        rawData.forEach(function(team) {
            team.values.forEach(function(dayRecord) {
                // Setting dates to noon so game falls in middle of day for UX/UI purposes
                var noonDate = dateStringFormatter.parse(dayRecord.date);
                dayRecord.date = d3.time.hour.offset(noonDate, 12);
            });
        });

        return rawData;

    }



    // Converts dates from D3 format to strings
    function convertDatesToDateStrings(rawData) {
        
        var dateStringFormatter = d3.time.format(INCOMING_DATE_FORMAT);

        rawData.forEach(function(team) {
            team.values.forEach(function(dayRecord) {
                dayRecord.date = dateStringFormatter(dayRecord.date);
            });
        });

        return rawData;

    }



    function drawAxes(svg, xScale, yScale, SVG_INNER_HEIGHT, SVG_INNER_WIDTH) {

        // Draw X Axis - TODO: FIGURE OUT BEST WAY TO SHIFT TICKS
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(X_AXIS_NUM_TICKS).tickFormat(d3.time.format(X_AXIS_TICK_DATE_FORMAT));
        svg.append("g").attr("class", "x axis").attr("transform", "translate(" + X_AXIS_X + "," + X_AXIS_Y + ")").call(xAxis);
        
        // Format X Axis Tick Text
        svg.selectAll(".x.axis .tick text").attr("y", Y_AXIS_TICK_TEXT_Y);

        // Draw Y Axis
        var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(Y_AXIS_NUM_TICKS).tickSize(Y_AXIS_TICK_SIZE_INNER, Y_AXIS_TICK_SIZE_OUTER);
        svg.append("g").attr("class", "y axis").call(yAxis);
        
        // Add a cutoff line under the 8th position
        var cutoff = svg.select(".y.axis .tick:nth-child(8)").append("line").attr("y1", CUTOFF_Y1).attr("x2", CUTOFF_X2).attr("y2", CUTOFF_Y2); 

        return svg;

    }


    function drawLines(svg, rawData, xScale, yScale) {

        // Makes an empty selector
        var emptySelector = svg.selectAll("xxxxxx");
        
        // Creates one empty <g> element in the SVG per game with a class of "team" and data appended to object
        var lineElements = emptySelector.data(rawData).enter().append("g").attr("class", "team");

        // Add a <path> tag to each <g> tag
        var pathElements = lineElements.append("path").attr("class", "line");
        
        // Add the path data points via the mapping function
        pathElements.attr("d", mapLine);
        
        // Select the path color based on the mapping function
        // Maps the names of the cities to the discrete color domain (color can have up to 30 values)  
        pathElements.style("stroke", mapColor);

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


    }


    // Adds a dot to the canvas for each game a team played
    function drawDots(incomingData, svg, xScale, yScale) {

        playedGameData = incomingData.map(x => ( { name: x.name, values: x.values.filter(y => y.game == 1) } ));

        playedGameData.forEach(function(x, index) {
            
            var name = x.name;
            var values = x.values;

            // Debug values that are associated with a given game
            console.log("Team = " + name + " -> Values array: ", values);

            // Draw a circle on every game in the set - this is the blank (white) background to cover transparency
            drawDotsAsCircles(svg, values, index, "#FFF");

            // Then draw the logo itself
            drawDotsAsImages(svg, values, index);

        });


        function drawDotsAsCircles(svg, values, index, color) {

            // Makes an empty selector
            var emptySelector = svg.selectAll("xxxxxx");

            //svg.selectAll(".team:nth-child(" + index + ")").data(values).enter().append("circle").attr("class", "game-dot")
            emptySelector.data(values).enter().append("circle").attr("class", "game-dot")
                .attr("r", GAME_DOT_RADIUS)
                .attr("cx", function(d) { 
                    return xScale(d.date); // + GAME_DOT_OFFSET; 
                })
                .attr("cy", function(d) { 
                    return yScale(d.ranking); 
                })
                .style("fill", color);

        }


        function drawDotsAsImages(svg, values, index) {

            // Makes an empty selector
            var emptySelector = svg.selectAll("xxxxxx");

            //svg.selectAll(".team:nth-child(" + index + ")").data(values).enter().append("svg:image")
            emptySelector.data(values).enter().append("svg:image")
                .attr("xlink:href", function(d) {
                    return teamObject.filter((n) => n.name === d.team)[0].logo;
                })
                .attr("width", GAME_DOT_RADIUS * 2)
                .attr("height", GAME_DOT_RADIUS * 2)              
                .attr("x", function(d) { 
                    return xScale(d.date) - GAME_DOT_RADIUS; // + GAME_DOT_OFFSET; 
                })
                .attr("y", function(d) { 
                    return yScale(d.ranking) - GAME_DOT_RADIUS; 
                });

        }

    }



    function getXScale(rawData, SVG_INNER_WIDTH) {

        var datesArray = [];

        rawData.forEach(function(team) {
            team.values.forEach(function(val) {
                // Setting dates to noon so game falls in middle of day for UX/UI purposes
                var noonDate = d3.time.hour.offset(val.date, -12);
                datesArray.push(noonDate);
            });
        });

        var dateRange = d3.extent(datesArray);

        var xScale = d3.time.scale();
        xScale.domain(dateRange);
        xScale.range([0, SVG_INNER_WIDTH]);

        return xScale;

    }


    function getYScale(rawData, SVG_INNER_HEIGHT) {

        var minRank = d3.min(rawData, function(team) { 
            return d3.min(team.values, function(v) { 
                return v.ranking; 
            }); 
        });

        var maxRank = d3.max(rawData, function(team) { 
            return d3.max(team.values, function(v) { 
                return v.ranking; 
            }); 
        });

        var yScale = d3.scale.linear();
        yScale.domain([minRank, maxRank]);
        yScale.range([0, SVG_INNER_HEIGHT]);

        return yScale;
        
    }


})()