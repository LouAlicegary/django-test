# Library imports
from django.shortcuts                   import render
from django.http                        import HttpResponse

# Local python modules
from seasons.libs.d3_adapter            import D3Adapter

# Models
from seasons.models.game                import Game
from seasons.models.team_game           import TeamGame


import json

# Create your views here.

def index(request):

    gameDetailsList = Game.findOrCreateAll()

    print "*** Creating dailyRecordList ***"

    dailyRecordList = TeamGame.createFromGameDetails(gameDetailsList)

    TeamGame.batchCreateRecords(dailyRecordList)

    d3Data = D3Adapter.shoehornData(dailyRecordList, gameDetailsList);

    jsonData = json.dumps(d3Data)

    #print jsonData

    return render(request, 'seasons/index.html', {'jsonData': jsonData})


def cities(request):
    
    return render(request, 'seasons/cities.html')