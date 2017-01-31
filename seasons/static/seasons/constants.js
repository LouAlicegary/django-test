// General Constants
NUM_TEAMS               = 15; //incomingData.length;
NUM_OF_DAYS             = 169;     
INCOMING_DATE_FORMAT    = "%Y-%m-%d";
TOOLTIP_DATE_FORMAT     = "%B %Y";
SPACING_BETWEEN_GAMES   = 40;

// SVG settings
SVG_MARGINS             = {top: 20, right: 550, bottom: 80, left: 50};
SVG_INNER_WIDTH         = (NUM_OF_DAYS - 1) * SPACING_BETWEEN_GAMES;
SVG_INNER_HEIGHT        = 650;  
SVG_OUTER_WIDTH         = SVG_INNER_WIDTH + SVG_MARGINS.left + SVG_MARGINS.right;  // 7320 ((168*40) + 50 + 550)
SVG_OUTER_HEIGHT        = SVG_INNER_HEIGHT + SVG_MARGINS.top + SVG_MARGINS.bottom; // 750  (650 + 20 + 80)

// X Axis - coordinate system starts at (0,0) in top left. that's why x-axis gets translated downward
X_AXIS_X                = SPACING_BETWEEN_GAMES / 2;
X_AXIS_Y                = SVG_INNER_HEIGHT;
X_AXIS_NUM_TICKS        = NUM_OF_DAYS;
X_AXIS_TICK_DATE_FORMAT = "%d";

// Y Axis - tick size is negative for some unknown reason...i don't get it but that's the only way it works
Y_AXIS_NUM_TICKS        = NUM_TEAMS;
Y_AXIS_TICK_SIZE_INNER  = -(SVG_INNER_WIDTH);
Y_AXIS_TICK_SIZE_OUTER  = 0;
Y_AXIS_TICK_TEXT_Y      = 25;

// Line Labels
LINE_LABEL_X            = 3;
LINE_LABEL_DY           = 0.35;    

// Playoffs cutoff line
CUTOFF_X2               = SVG_INNER_WIDTH;
CUTOFF_Y1               = 25;
CUTOFF_Y2               = 25;

// Dot showing that a team played a game
GAME_DOT_RADIUS         = 15;
GAME_DOT_OFFSET         = 20;

// Overlay captures all mouse movement and displays the stats pane
OVERLAY_WIDTH           = SVG_INNER_WIDTH + 50; // TODO: The 50 offsets the line stroke width. Maybe that should be in here?
OVERLAY_HEIGHT          = SVG_INNER_HEIGHT;