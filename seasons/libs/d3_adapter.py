from time                           import mktime
from datetime                       import datetime

# Used because we create the shell of the D3 structure using the team list
from seasons.models.team            import Team

# Used because we need to get all the game dates
from seasons.models.game            import Game

import dateutil.parser

# pdb.set_trace() is an interactive debugger hook
import pdb 


"""
This class represents a "daily record" comprising a team's win/loss record on a particular date in the season
"""
class D3Adapter(object):
    

    @staticmethod
    def shoehornData(dailyRecordList, gameDetailsList, league):

        print "[" + str(datetime.now().time()) + "] *** Converting Data for D3 ***"
        shoehornedTeams = D3Adapter.__convertStructureForD3(dailyRecordList)        
        shoehornedTeams = D3Adapter.__filterTeams(shoehornedTeams, league)
        print "[" + str(datetime.now().time()) + "] *** Finished Converting Data for D3 ***"

        return shoehornedTeams


    """
    Shoehorns the structure of DailyRecords to fit what the d3.js library wants
    [ {team: "Detroit Pistons", values: [{}, {}, ...]}, {team: "Chicago Bulls", values: [...]}, ... ]
    """
    @staticmethod
    def __convertStructureForD3(dailyRecordList):


        """
        Mapping function to take an array of team names and return (name, values) tuples
        Method also converts dates to strings
        """
        def mapFunc(x):
            thisTeamGames = filter(lambda y: y["team"] == x, dailyRecordList)
            for game in thisTeamGames:
                game["date"] = game["date"].strftime("%Y-%m-%d")
            return (x, thisTeamGames)


        shoehornedTeams = []

        combos = map(mapFunc, Team.teamList)

        for item in combos:
            stats = {"name": item[0], "values": item[1]}
            shoehornedTeams.append(stats)

        return shoehornedTeams


    """
    Filters out teams before ranking them (e.g. by conference or division)
    """
    @staticmethod
    def __filterTeams(shoehornedTeams, league):    

        def filterFunc(x):
            teamObjectsToMatch = filter(lambda x: x["conference"] == league, Team.teamObject)
            teamsToMatch = map(lambda x: x["name"], teamObjectsToMatch)
            if x["name"] in teamsToMatch:
                return True
            return False

        filteredTeams = filter(filterFunc, shoehornedTeams)

        return filteredTeams


