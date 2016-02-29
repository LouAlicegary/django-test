from time import mktime
from datetime import datetime


"""
This class represents a "daily record" comprising a team's win/loss record on a particular date in the season
"""
class DailyRecord(object):
    

    teamList = [u'Los Angeles Lakers', u'Chicago Bulls', u'San Antonio Spurs', u'Philadelphia 76ers', u'Detroit Pistons', u'Boston Celtics', u'Miami Heat', u'Orlando Magic', u'Portland Trail Blazers', u'Golden State Warriors', u'New York Knicks', u'Washington Wizards', u'Utah Jazz', u'Dallas Mavericks', u'Minnesota Timberwolves', u'Los Angeles Clippers', u'Oklahoma City Thunder', u'Charlotte Hornets', u'Milwaukee Bucks', u'Memphis Grizzlies', u'Toronto Raptors', u'Houston Rockets', u'Phoenix Suns', u'Sacramento Kings', u'New Orleans Pelicans', u'Cleveland Cavaliers', u'Atlanta Hawks', u'Brooklyn Nets', u'Indiana Pacers', u'Denver Nuggets']
        

    """
    Takes in an array of game details (date, home/away, scores) and spits out an array of "daily" style records
    """
    def createFromGameDetails(self, gameDetailsList):
        
        # Sorts list (but converts list of dicts to list of tuples)
        # Because these are tuples, we print them using integer indices
        def printTeamStandings(teamRecordList):
            sortedTuples = sorted(teamRecordList.items(), key=lambda val: -val[1]["percentage"])
            for item in sortedTuples:
                print item[0], item[1]

        dailyRecordList = []

        teamRecordList = self.__createEmptyRecordDict()

        for game in gameDetailsList:
            
            winnerLoserDetails = self.__getWinnerAndLoserDetails(game)
            
            if winnerLoserDetails:
                updatedWLRecords = self.__updateWLRecords(teamRecordList, winnerLoserDetails)
                winnerRecord = self.__createDailyTeamRecord(winnerLoserDetails["date"], winnerLoserDetails["winner"], updatedWLRecords["winnerRecord"])
                loserRecord = self.__createDailyTeamRecord(winnerLoserDetails["date"], winnerLoserDetails["loser"], updatedWLRecords["loserRecord"])
                dailyRecordList.extend((winnerRecord, loserRecord))

        printTeamStandings(teamRecordList)

        shoehornedTeams = self.__convertStructureForD3(dailyRecordList)

        return shoehornedTeams


    """
    Creates a dictionary to hold each team's running win/loss record
    """
    def __createEmptyRecordDict(self):
        
        recordDict = {}
        
        for team in DailyRecord.teamList:
            recordDict[team] = {"win": 0, "loss": 0, "total": 0, "percentage": 0.00}

        return recordDict


    """
    Takes a game details object (date, visitor/home, and scores) and calculates winner and loser
    Discards any games set to occur in the future
    """
    def __getWinnerAndLoserDetails(self, gameDetails):


        if (gameDetails["visitorScore"] == 0 and gameDetails["homeScore"] == 0):
            return None

        if (gameDetails["visitorScore"] > gameDetails["homeScore"]):
            winner = gameDetails["visitor"]
            winnerScore = gameDetails["visitorScore"]
            loser = gameDetails["home"]
            loserScore = gameDetails["homeScore"]
        else: 
            winner = gameDetails["home"]
            winnerScore = gameDetails["homeScore"]
            loser = gameDetails["visitor"]
            loserScore = gameDetails["visitorScore"]

        newItems = {
            "winner": winner,
            "winnerScore": winnerScore,
            "loser": loser,
            "loserScore": loserScore
        }

        gameDetails.update(newItems)

        return gameDetails


    """
    Updates the win/loss record dict for the two teams that played
    """
    def __updateWLRecords(self, teamRecordArray, winnerLoserDetails):

        winnerRecord = teamRecordArray[winnerLoserDetails["winner"]]
        winnerRecord["win"] += 1
        winnerRecord["total"] += 1
        winnerRecord["percentage"] = float(winnerRecord["win"]) / float(winnerRecord["total"])

        loserRecord = teamRecordArray[winnerLoserDetails["loser"]]
        loserRecord["loss"] += 1
        loserRecord["total"] += 1
        loserRecord["percentage"] = float(loserRecord["win"]) / float(loserRecord["total"])

        return {
            "winnerRecord": winnerRecord,
            "loserRecord": loserRecord
        }


    """
    Creates two "daily" format records from the game details and updated win/loss stats
    """
    def __createDailyTeamRecord(self, date, team, teamRecord):

        return {
            "date": datetime.fromtimestamp(mktime(date)).strftime("%Y%m%d"),
            "team": team,
            #"win": teamRecord["win"],
            #"loss": teamRecord["loss"],
            #"total": teamRecord["total"],
            "percentage": teamRecord["percentage"]
        }


    """
    Shoehorns the structure of DailyRecords to fit what the d3.js library wants
    """
    def __convertStructureForD3(self, dailyRecordList):

        """
        Mapping function to take an array of team names and return (name, values) tuples
        """
        def mapFunc(x):
            thisTeamGames = filter(lambda y: y["team"] == x, dailyRecordList)
            return (x, thisTeamGames)


        shoehornedTeams = []

        combos = map(mapFunc, DailyRecord.teamList)

        for item in combos:
            stats = {"name": item[0], "values": item[1]}
            shoehornedTeams.append(stats)

        return shoehornedTeams





