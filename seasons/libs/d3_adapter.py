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
    def shoehornData(dailyRecordList, gameDetailsList):

        shoehornedTeams = D3Adapter.__convertStructureForD3(dailyRecordList)        
        shoehornedTeams = D3Adapter.__interpolateAcrossDates(shoehornedTeams)
        shoehornedTeams = D3Adapter.__filterTeams(shoehornedTeams)
        print len(shoehornedTeams)
        showhornedTeams = D3Adapter.__rankByDate(shoehornedTeams, gameDetailsList)

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
    def __filterTeams(shoehornedTeams):    

        def filterFunc(x):
            teamObjectsToMatch = filter(lambda x: x["conference"] == "Eastern", Team.teamObject)
            teamsToMatch = map(lambda x: x["name"], teamObjectsToMatch)
            if x["name"] in teamsToMatch:
                return True
            return False

        filteredTeams = filter(filterFunc, shoehornedTeams)

        return filteredTeams


    """
    If it comes across a stubbed zeroed-out record (not a legit one early in the season) 
    we just take on the previous record's values
    """
    @staticmethod
    def __interpolateAcrossDates(shoehornedTeams):

        for team in shoehornedTeams:
            
            flag = 0
            
            for counter, game in enumerate(team["values"]):
                
                if game["total"] > 0: 
                    flag = 1
                
                if (flag == 1) and (game["total"] == 0):
                    game["total"] = team["values"][counter-1]["total"]
                    game["win"] = team["values"][counter-1]["win"]
                    game["loss"] = team["values"][counter-1]["loss"]
                    game["percentage"] = team["values"][counter-1]["percentage"]
                    game["ranking"] = team["values"][counter-1]["ranking"]

        return shoehornedTeams


    """
    Compute daily rankings for an array of shoehorned teams
    """
    @staticmethod
    def __rankByDate(shoehornedTeams, gameDetailsList):

        gameDates = Game.getAllGameDates(gameDetailsList)

        for date in gameDates:
            
            dateString = date.strftime("%Y-%m-%d")

            someList = []
            
            for team in shoehornedTeams:
                item = filter(lambda x: x["date"] == dateString, team["values"])
                someList.extend(item)
            
            someList = sorted(someList, key=lambda x: -x["percentage"])

            #pdb.set_trace()

            for counter,team in enumerate(someList):
                team["ranking"] = counter + 1
         

        return shoehornedTeams


