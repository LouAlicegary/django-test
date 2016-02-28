/*******************************************************************************
 * 
 * File: city_grapher.js
 * 
 * Description: Creates a line graph of temperatures for three cities (New York,
 * San Francisco, and Austin between October 1, 2011 and September 30, 2012).
 *
 * Dependencies: d3.js
 * 
 ******************************************************************************/

(function(){

    
    main();


    function main() {

        // Set graph dimensions
        var margins = {top: 20, right: 80, bottom: 30, left: 50};
        var width = 960 - margins.left - margins.right;
        var height = 500 - margins.top - margins.bottom;

        // Builds the SVG object that the graph will be rendered to
        var svg = generateBlankSVG(width, height, margins);

        // Specify datafile path to read in
        var dataFile = "static/cities.tsv";

        convertDataToGraph(dataFile, svg, width, height);

    }


    function generateBlankSVG(width, height, margins) {
 
        // Create SVG and insert into <body>
        var svg = d3.select("body").append("svg");
        svg.attr("width", width + margins.left + margins.right).attr("height", height + margins.top + margins.bottom);
        
        // Create a <g> element within the SVG
        var g = svg.append("g")
        g.attr("transform", "translate(" + margins.left + "," + margins.top + ")");        
 
        // Return the g element, which is a transform of the SVG parent (and the SVG's only child element.
        return g;

    }


    function convertDataToGraph(dataFile, svg, width, height) {

        // Read in datafile and generate graph
        d3.tsv(dataFile, function(error, incomingData) {

            // Catch any errors on reading in the datafile
            if (error) throw error;

            var rawData = convertDateFormats(incomingData);
            
            var cityNames = getCityNames(rawData);
            var cityData = createCityDataStructure(rawData, cityNames);

            // Sets X value (dates) and Y value (temperatures) scaling functions
            var xScale = getXScale(rawData, width);
            var yScale = getYScale(cityData, height);

            // Draws the X and Y Axes
            svg = drawAxes(svg, xScale, yScale, height, width);

            drawGraphContent(svg, cityNames, cityData, xScale, yScale);

        });


        // Converts date data into D3 date format
        function convertDateFormats(rawData) {
            
            var inFormat = "%Y%m%d";

            rawData.forEach(function(d) {
                d.date = d3.time.format(inFormat).parse(d.date);
            });

            return rawData;

        }


        // Get city names from header row 
        function getCityNames(rawData) {
                   
            var headers = d3.keys(rawData[0]);
            
            var cityNames = headers.filter(function(key) { 
                return key !== "date"; 
            });

            return cityNames;

        }


        // Creates a struture like the following:
        // [ 
        //   {name: "NYC", values: [{date: "2012-01-01", temperature: 32}, {date: "2012-01-02", temperature: 25}, ...]}, 
        //   {name: "SF", values: [...]}, 
        //   {name: "ATX", values: [...]}
        // ]
        function createCityDataStructure(rawData, cityNames) {

            var cityData = cityNames.map(function(name) {
                return {
                    name: name,
                    values: rawData.map(function(d) {
                        return {date: d.date, temperature: +d[name]};
                    })
                };
            });

            return cityData;

        }


        function getXScale(rawData, width) {

            var dateRange = d3.extent(rawData, function(d) { 
                return d.date; 
            });

            var xScale = d3.time.scale();
            xScale.domain(dateRange);
            xScale.range([0, width]);

            return xScale;

        }


        function getYScale(cityData, height) {

            var minTemp = d3.min(cityData, function(c) { 
                return d3.min(c.values, function(v) { 
                    return v.temperature; 
                }); 
            });

            var maxTemp = d3.max(cityData, function(c) { 
                return d3.max(c.values, function(v) { 
                    return v.temperature; 
                }); 
            });

            var yScale = d3.scale.linear();
            yScale.domain([minTemp, maxTemp]);
            yScale.range([height, 0]);

            return yScale;
            
        }


        function drawAxes(svg, xScale, yScale, height, width) {

            // Draw X Axis
            var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
            svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

            // Draw Y Axis
            var yAxis = d3.svg.axis().scale(yScale).orient("left");
            svg.append("g").attr("class", "y axis").call(yAxis);
            svg.append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Temperature (ºF)");

            return svg;

        }


        function drawGraphContent(svg, cityNames, cityData, xScale, yScale) {

            // Makes an empty selector
            var emptySelector = svg.selectAll(".city");
            
            // Creates one empty <g> element in the SVG per city with a class of "city" and data appended to object
            var lineElements = emptySelector.data(cityData).enter().append("g").attr("class", "city");

            // Draws a path based on the data specified
            lineElements = drawLines(lineElements, xScale, yScale, cityNames);


            function drawLines(lineElements, xScale, yScale, cityNames) {

                // Add a <path> tag to each <g> tag
                var pathElements = lineElements.append("path").attr("class", "line");
                
                // Add the path data points via the mapping function
                pathElements.attr("d", mapLine);
                
                // Select the path color based on the mapping function
                // Maps the names of the cities to the discrete color domain (color can have up to 10 values)  
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
                        return yScale(d.temperature); 
                    }

                }


                // Map the city name to a color
                function mapColor(d) {
         
                    var colorMapping = d3.scale.category10();
                    colorMapping.domain(cityNames); 
         
                    return colorMapping(d.name); 
         
                }


                // Adds name of the city to the end of each line
                function drawLineLabels(lineElements, xScale, yScale) {

                    var lineTerminals = lineElements.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }).append("text");
                    lineTerminals.attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.temperature) + ")"; });
                    lineTerminals.attr("x", 3).attr("dy", ".35em")
                    lineTerminals.text(function(d) { return d.name; });

                }

            }

        }

    }



})()