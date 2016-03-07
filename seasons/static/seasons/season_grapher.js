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

    // General Constants
    NUM_TEAMS               = incomingData.length;  //15     
    INCOMING_DATE_FORMAT    = "%Y-%m-%d";
    TOOLTIP_DATE_FORMAT     = "%B %Y";

    // SVG settings
    SVG_OUTER_WIDTH         = 7000;
    SVG_OUTER_HEIGHT        = 750;
    SVG_MARGINS             = {top: 20, right: 200, bottom: 80, left: 50};
    SVG_INNER_WIDTH         = SVG_OUTER_WIDTH - SVG_MARGINS.left - SVG_MARGINS.right;   // 6750 (7000 - 50 - 200)
    SVG_INNER_HEIGHT        = SVG_OUTER_HEIGHT - SVG_MARGINS.top - SVG_MARGINS.bottom;  // 650  (750 - 20 - 80)

    // X Axis - coordinate system starts at (0,0) in top left. that's why x-axis gets translated downward
    X_AXIS_X                = 0;
    X_AXIS_Y                = SVG_INNER_HEIGHT;
    X_AXIS_NUM_TICKS        = 200;
    X_AXIS_TICK_DATE_FORMAT = "%d";

    // Y Axis - tick size is negative for some unknown reason...i don't get it but that's the only way it works
    Y_AXIS_NUM_TICKS        = NUM_TEAMS - 1;
    Y_AXIS_TICK_SIZE_INNER  = -(SVG_INNER_WIDTH);
    Y_AXIS_TICK_SIZE_OUTER  = 0;
    Y_AXIS_TICK_TEXT_Y      = 25;
    
    // Line Labels
    LINE_LABEL_X            = 3;
    LINE_LABEL_DY           = 0.35;    

    // Playoffs cutoff line
    CUTOFF_X2               = 6750;
    CUTOFF_Y1               = 25;
    CUTOFF_Y2               = 25;

    GAME_DOT_RADIUS         = 10;

    // Tooltip graphic
    var focusHeight         = SVG_INNER_HEIGHT + 80;
    var focusWidth          = 450;
    var focusX              = 0;   // L-R from mouse pointer
    var focusY              = -20; // U-D from top of chart

    // Tooltip focus line
    var lineHeight          = focusHeight;
    var lineX               = -20;
    var lineY1              = 0
    var lineY2              = lineHeight;

    // Tooltip record box
    var boxHeight           = focusHeight;
    var boxWidth            = focusWidth;
    var boxX                = 0;
    var boxY                = focusY;

    // Team record
    var rankTextMarginL     = 5;
    var teamTextMarginL     = 30;
    var winTextMarginL      = 300;
    var lossTextMarginL     = 340;
    var percentTextMarginL  = 380;        

    // Date box
    var dateBoxHeight       = 45;
    var dateBoxWidth        = boxWidth;
    var dateBoxX            = boxX;
    var dateBoxY            = boxHeight - dateBoxHeight;

    // Date field
    var dateFieldY          = SVG_INNER_HEIGHT + 65;
    var dateFieldMarginL    = 5;



    main();


    function main() {

        // Builds the SVG object that the graph will be rendered to
        var svg = generateBlankSVG(SVG_INNER_WIDTH, SVG_INNER_HEIGHT, SVG_MARGINS);

        // TODO: This is only for D3 - more elegant solution possible?
        incomingData = convertDateStringsToDates(incomingData);

        // Sets X value (dates) and Y value (win percentage) scaling functions
        var xScale = getXScale(incomingData, SVG_INNER_WIDTH);
        var yScale = getYScale(incomingData, SVG_INNER_HEIGHT);

        // Draws the X and Y Axes
        svg = drawAxes(svg, xScale, yScale, SVG_INNER_HEIGHT, SVG_INNER_WIDTH);

        // Draw the actual lines
        var lineElements = drawGraphContent(svg, incomingData, xScale, yScale);

        drawDots(incomingData, svg, xScale, yScale);

        // TODO: This is only for D3 - more elegant solution possible?
        incomingData = convertDatesToDateStrings(incomingData);

        // Build the tooltip / overlay that shows stats
        buildTooltip(svg, SVG_INNER_WIDTH, SVG_INNER_HEIGHT, xScale, yScale);
        
    }


    function buildTooltip(svg, SVG_INNER_WIDTH, SVG_INNER_HEIGHT, xScale, yScale) {

        // Create a tooltip grouping element and hide contents initially
        var focus = svg.append("g").attr("class", "focus").style("display", "none");
        
        // Create a vertical line to serve as a "day focus"
        focus.append("line").attr("class", "tooltip-bar")
                            .attr("x1", lineX).attr("y1", lineY1)
                            .attr("x2", lineX).attr("y2", lineY2); 

        // Create a rectangular colored box for the tooltip to serve as a background
        focus.append("rect").attr("class", "tooltip-box")
                            .attr("width", boxWidth).attr("height", boxHeight)
                            .attr("x", boxX).attr("y", boxY);


        // Add rank text elements to the box for each team
        // Using the .5 calculation to hit the middle of the line
        var rankGroup = focus.append("g").attr("class", "rank-group");        
        for (var i = 1; i <= NUM_TEAMS; i++) {
            var x = rankTextMarginL;
            var y = yScale(i + 0.5);
            rankGroup.append("text").attr("class", "team-rank").attr("x", x).attr("y", y).text(i.toString());
        }

        // Add team name text elements to the box for each team
        var nameGroup = focus.append("g").attr("class", "name-group");
        for (var i = 1; i <= NUM_TEAMS; i++) {
            var x = teamTextMarginL;
            var y = yScale(i + 0.5);
            nameGroup.append("text").attr("class", "team-record").attr("x", x).attr("y", y);
        }

        // Add team name text elements to the box for each team
        var winGroup = focus.append("g").attr("class", "win-group");
        for (var i = 1; i <= NUM_TEAMS; i++) {
            var x = winTextMarginL;
            var y = yScale(i + 0.5);
            winGroup.append("text").attr("class", "team-wins").attr("x", x).attr("y", y);
        }

        // Add team name text elements to the box for each team
        var lossGroup = focus.append("g").attr("class", "loss-group");
        for (var i = 1; i <= NUM_TEAMS; i++) {
            var x = lossTextMarginL;
            var y = yScale(i + 0.5);
            lossGroup.append("text").attr("class", "team-losses").attr("x", x).attr("y", y);
        }

        // Add team name text elements to the box for each team
        var percentGroup = focus.append("g").attr("class", "percent-group");
        for (var i = 1; i <= NUM_TEAMS; i++) {
            var x = percentTextMarginL;
            var y = yScale(i + 0.5);
            percentGroup.append("text").attr("class", "team-percent").attr("x", x).attr("y", y);
        }


        // Create a rectangular colored box for the tooltip to serve as a background
        focus.append("rect").attr("class", "date-box")
                            .attr("width", boxWidth).attr("height", dateBoxHeight)
                            .attr("x", dateBoxX).attr("y", dateBoxY);

        // Add a date field to the box created above        
        focus.append("text").attr("class", "game-date").attr("x", dateFieldMarginL).attr("y", dateFieldY);

        // put an overlay layer over the entire D3 image that captures all mouse movement
        buildOverlay(svg, focus, xScale, yScale);    

    }


    function buildOverlay(svg, focus, xScale, yScale) {

        var overlay = svg.append("rect").attr("class", "overlay").attr("width", SVG_INNER_WIDTH).attr("height", SVG_INNER_HEIGHT);
        
        // Show tooltip on mouseover of overlay
        overlay.on("mouseover", function() { 
            focus.style("display", null); 
        });
        
        // Hide tooltip on mouseout of overlay
        overlay.on("mouseout", function() { 
            focus.style("display", "none"); 
        });

        // Update tooltip as mouse moves through overlay
        overlay.on("mousemove", function () {

            // Capture current mouse coords
            var mouseCoords = d3.mouse(this);
            var mouseX = mouseCoords[0];
            var mouseY = mouseCoords[1];

            // Use mouse coords to set location of tooltip focus element
            var xAnchor = mouseX + focusX;
            var yAnchor = focusY;
            focus.attr("transform", "translate(" + xAnchor + "," + yAnchor + ")");
            
            // Convert current mouse coords to date and rank
            var date = xScale.invert(mouseX);
            var ranking = yScale.invert(mouseY);

            // Feed data into the tooltip (skipping two children because they are the line and box)
            for (var i=1; i <= NUM_TEAMS; i++) {
                var teamGame = getTeamAndGame(date, i);

                var teamString = teamGame.team.toUpperCase();
                focus.select(".name-group text:nth-child(" + (i).toString() + ")").text(teamString);
                
                var winString = teamGame.win.toString();
                focus.select(".win-group text:nth-child(" + (i).toString() + ")").text(winString);
                
                var lossString = teamGame.loss.toString();
                focus.select(".loss-group text:nth-child(" + (i).toString() + ")").text(lossString);                
            
                var percentString = teamGame.percentage.toFixed(3).toString();
                focus.select(".percent-group text:nth-child(" + (i).toString() + ")").text(percentString); 
            }



            // Update the game date at the bottom of the box
            var dateStringFormatter = d3.time.format(TOOLTIP_DATE_FORMAT);
            var dateString = dateStringFormatter(date).toUpperCase();
            focus.selectAll(".game-date").text(dateString);
        
        });

        return overlay;

    }


    // Adds a dot to the canvas for each game a team played
    function drawDots(incomingData, svg, xScale, yScale) {

        playedGameData = incomingData.map(x => ( { name: x.name, values: x.values.filter(y => y.game == 1) } ));

        playedGameData.forEach(function(x, index) {
            
            var name = x.name;
            var values = x.values;

            // Draw a circle on every game in the set
            svg.selectAll(".team:nth-child(" + index + ")").data(values).enter().append("circle").attr("class", "game-dot")
                .attr("r", GAME_DOT_RADIUS)
           .attr("cx", function(d) { 
                    return xScale(d.date); 
                })
                .attr("cy", function(d) { 
                    return yScale(d.ranking); 
                });

        });

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
                dayRecord.date = dateStringFormatter.parse(dayRecord.date);
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

        // Draw X Axis
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


    function drawGraphContent(svg, rawData, xScale, yScale) {

        // Makes an empty selector
        var emptySelector = svg.selectAll("xxxxxx");
        
        // Creates one empty <g> element in the SVG per city with a class of "city" and data appended to object
        var lineElements = emptySelector.data(rawData).enter().append("g").attr("class", "team");

        // Draws a path based on the data specified
        var lineLabels = rawData.map(x => x.name);
        
        drawLines(lineElements, xScale, yScale, lineLabels);

        return lineElements;


        function drawLines(lineElements, xScale, yScale, lineLabels) {

            // Add a <path> tag to each <g> tag
            var pathElements = lineElements.append("path").attr("class", "line");
            
            // Add the path data points via the mapping function
            pathElements.attr("d", mapLine);
            
            // Select the path color based on the mapping function
            // Maps the names of the cities to the discrete color domain (color can have up to 30 values)  
            pathElements.style("stroke", mapColor);

            // Put the city name on the end of the line
            // drawLineLabels(lineElements, xScale, yScale);



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
            // TODO: Get rid of em calculation
            function drawLineLabels(lineElements, xScale, yScale) {

                var lineTerminals = lineElements.datum(function(d) { 
                    return {name: d.name, value: d.values[d.values.length - 1]}; 
                }).append("text");
                
                lineTerminals.attr("transform", function(d) { 
                    return "translate(" + xScale(d.value.date) + "," + yScale(d.value.ranking) + ")"; 
                });
                
                var dy = LINE_LABEL_DY.toString() + "em";
                lineTerminals.attr("x", LINE_LABEL_X).attr("dy", dy).attr("class", "label")
                
                lineTerminals.text(function(d) { 
                    return d.name; 
                });

            }

        }

    }


    function getXScale(rawData, SVG_INNER_WIDTH) {

        var datesArray = [];

        rawData.forEach(function(team) {
            team.values.forEach(function(v) {
                datesArray.push(v.date);
            });
        });

        var dateRange = d3.extent(datesArray);

        var xScale = d3.time.scale();
        xScale.domain(dateRange);
        xScale.range([0, SVG_INNER_WIDTH]);

        return xScale;

    }


    function getYScale(rawData, SVG_INNER_HEIGHT) {

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
        yScale.range([0, SVG_INNER_HEIGHT]);

        return yScale;
        
    }


    function getTeamAndGame(mouseDate, mouseRank) {

        var dateStringFormatter = d3.time.format(INCOMING_DATE_FORMAT);
        var dateString = dateStringFormatter(mouseDate);

        var ranking = Math.round(mouseRank);

        var clickedTeamGame;

        for (var index in incomingData) {
            team = incomingData[index];
            clickedTeamGame = team.values.filter( v => (v.date == dateString) && (v.ranking == ranking) ); 
            if (clickedTeamGame.length == 1) {
                clickedTeamGame = clickedTeamGame[0];
                break;
            }
        }
        
        return clickedTeamGame;
    
    }


})()