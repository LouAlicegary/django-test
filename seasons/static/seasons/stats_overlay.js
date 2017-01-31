

// Tooltip graphic
var focusHeight         = OVERLAY_HEIGHT + 80;
var focusWidth          = 500;
var focusX              = 0;   // L-R from mouse pointer
var focusY              = -20; // U-D from top of chart

// Tooltip focus line
var lineHeight          = focusHeight;
var lineX               = 0;
var lineY1              = 0
var lineY2              = lineHeight;

// Tooltip record box
var boxHeight           = focusHeight;
var boxWidth            = focusWidth;
var boxX                = 20;
var boxY                = focusY;

// Team record
var rankTextMarginL     = boxX + 5;
var teamTextMarginL     = boxX + 30;
var winTextMarginL      = boxX + 310;
var lossTextMarginL     = boxX + 350;
var percentTextMarginL  = boxX + 390;
var gamesBackTextMarginL= boxX + 450;  

// Date box
var dateBoxHeight       = 45;
var dateBoxWidth        = boxWidth;
var dateBoxX            = boxX;
var dateBoxY            = boxHeight - dateBoxHeight;

// Date field
var dateFieldY          = SVG_INNER_HEIGHT + 65;
var dateFieldMarginL    = boxX + 5;


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

    // Add team name text elements to the box for each team
    var percentGroup = focus.append("g").attr("class", "games-back-group");
    for (var i = 1; i <= NUM_TEAMS; i++) {
        var x = gamesBackTextMarginL;
        var y = yScale(i + 0.5);
        percentGroup.append("text").attr("class", "team-games-back").attr("x", x).attr("y", y);
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

    var overlay = svg.append("rect").attr("class", "overlay").attr("width", OVERLAY_WIDTH).attr("height", OVERLAY_HEIGHT);
    
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
        var xAnchor = (mouseX + focusX) - ((mouseX + focusX) % (SVG_INNER_WIDTH / NUM_OF_DAYS)) + (SVG_INNER_WIDTH / NUM_OF_DAYS / 2);
        var yAnchor = focusY;
        focus.attr("transform", "translate(" + xAnchor + "," + yAnchor + ")");
        
        // Convert current mouse coords to date and rank
        var date = xScale.invert(mouseX);// - (SVG_INNER_WIDTH / NUM_OF_DAYS));
        var ranking = yScale.invert(mouseY);

        // Debugging statement for mouse movement of overlay box
        // console.log("Date: " + date + "; mouseX: " + mouseX + "; mouseY: " + mouseY + "; focusX: " + focusX + "; focusY: " + focusY + "; xAnchor: " + xAnchor + "; yAnchor: " + yAnchor);

        // Feed data into the tooltip (skipping two children because they are the line and box)
        for (var i=1; i <= NUM_TEAMS; i++) {
            var teamGame = getTeamAndGame(date, i);

            var teamString = (teamGame.team) ? (teamGame.team.toUpperCase()) : ("");
            focus.select(".name-group text:nth-child(" + (i).toString() + ")").text(teamString);
            
            var winString = (teamGame.win) ? teamGame.win.toString() : ("0");
            focus.select(".win-group text:nth-child(" + (i).toString() + ")").text(winString);
            
            var lossString = (teamGame.loss) ? teamGame.loss.toString() : ("0");
            focus.select(".loss-group text:nth-child(" + (i).toString() + ")").text(lossString);                
        
            var percentString = (teamGame.percentage) ? teamGame.percentage.toFixed(3).toString() : ("0.000");
            focus.select(".percent-group text:nth-child(" + (i).toString() + ")").text(percentString); 
        
            var gamesBackString = (teamGame.gamesBack) ? teamGame.gamesBack.toFixed(1).toString() : ("");
            focus.select(".games-back-group text:nth-child(" + (i).toString() + ")").text(gamesBackString); 
        
        }

        // Update the game date at the bottom of the box
        var dateStringFormatter = d3.time.format(TOOLTIP_DATE_FORMAT);
        var dateString = dateStringFormatter(date).toUpperCase();
        focus.selectAll(".game-date").text(dateString);
    
    });

    return overlay;

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