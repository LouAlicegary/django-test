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

    main();


    function main() {

        // Set graph dimensions
        var margins = {top: 20, right: 120, bottom: 30, left: 50};
        var width = 1000 - margins.left - margins.right;
        var height = 500 - margins.top - margins.bottom;

        // Builds the SVG object that the graph will be rendered to
        var svg = generateBlankSVG(width, height, margins);

        incomingData = convertDateFormats(incomingData);
        convertDataToGraph(incomingData, svg, width, height);

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



    // Converts date data into D3 date format
    function convertDateFormats(rawData) {
        
        var inFormat = "%Y%m%d";

        rawData.forEach(function(team) {
            team.values.forEach(function(day) {
                day.date = d3.time.format(inFormat).parse(day.date);
            });
        });

        return rawData;

    }


    function convertDataToGraph(teamData, svg, width, height) {

        // Sets X value (dates) and Y value (win percentage) scaling functions
        var xScale = getXScale(teamData, width);
        var yScale = getYScale(teamData, height);

        // Draws the X and Y Axes
        svg = drawAxes(svg, xScale, yScale, height, width);

        drawGraphContent(svg, teamData, xScale, yScale);



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


        function drawAxes(svg, xScale, yScale, height, width) {

            // Draw X Axis
            var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
            svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

            // Draw Y Axis
            var yAxis = d3.svg.axis().scale(yScale).orient("left");
            svg.append("g").attr("class", "y axis").call(yAxis);
            svg.append("text").attr("transform", "rotate(-90)").attr("y", -40).attr("x", -200).attr("dy", ".71em").style("text-anchor", "end").text("Win Percentage");

            return svg;

        }


        function drawGraphContent(svg, rawData, xScale, yScale) {

            // Makes an empty selector
            var emptySelector = svg.selectAll(".city");
            
            // Creates one empty <g> element in the SVG per city with a class of "city" and data appended to object
            var lineElements = emptySelector.data(rawData).enter().append("g").attr("class", "city");

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

                    var lineMapping = d3.svg.line().interpolate("basis");            
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


                // Map the city name to a color
                function mapColor(d) {
         
                    var colorMapping = d3.scale.category20();
                    colorMapping.domain(lineLabels); 
         
                    return colorMapping(d.name); 
         
                }


                // Adds name of the city to the end of each line
                function drawLineLabels(lineElements, xScale, yScale) {

                    var lineTerminals = lineElements.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }).append("text");
                    lineTerminals.attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.ranking) + ")"; });
                    lineTerminals.attr("x", 3).attr("dy", ".35em")
                    lineTerminals.text(function(d) { return d.name; });

                }

            }

        }

    }



})()