# Library imports
from django.shortcuts                   import render
from django.http                        import HttpResponse
from datetime                           import datetime

# Local python modules
from seasons.libs.d3_adapter            import D3Adapter

# Models
from seasons.models.game                import Game
from seasons.models.team_game           import TeamGame

import json

# Create your views here.

def index(request, sport, season, league):

    print "Args passed into URL: " + "\nSport: " + sport + "\nSeason: " + season + "\nLeague: " + league

    gameDetailsList = Game.findAllBySportAndSeason(sport, season, league)

    dailyRecordList = TeamGame.findAllBySportAndSeason(sport, season, league)

    d3Data = D3Adapter.shoehornData(dailyRecordList, gameDetailsList, league);

    jsonData = json.dumps(d3Data)

    print "[" + str(datetime.now().time()) + "] *** Rendering Page ***"

    return render(request, 'seasons/index.html', {
        'jsonData': jsonData, 
        'sport': sport, 
        'season': season, 
        'league': league,
        'fullTitle': sport + " " + str(int(season)-1) + "-" + season + " - " + league + " Conference"
    })
