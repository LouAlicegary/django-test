from time import mktime
from datetime import datetime


"""
This class represents a "daily record" comprising a team's win/loss record on a particular date in the season
"""
class DailyRecord(object):
    

    teamObject = [
        { "name": "Los Angeles Lakers", "conference": "Western" }, 
        { "name": "Chicago Bulls", "conference": "Eastern" }, 
        { "name": "San Antonio Spurs", "conference": "Western" }, 
        { "name": "Philadelphia 76ers", "conference": "Eastern" }, 
        { "name": "Detroit Pistons", "conference": "Eastern" }, 
        { "name": "Boston Celtics", "conference": "Eastern" }, 
        { "name": "Miami Heat", "conference": "Eastern" }, 
        { "name": "Orlando Magic", "conference": "Eastern" }, 
        { "name": "Portland Trail Blazers", "conference": "Western" }, 
        { "name": "Golden State Warriors", "conference": "Western" }, 
        { "name": "New York Knicks", "conference": "Eastern" }, 
        { "name": "Washington Wizards", "conference": "Eastern" }, 
        { "name": "Utah Jazz", "conference": "Western" }, 
        { "name": "Dallas Mavericks", "conference": "Western" }, 
        { "name": "Minnesota Timberwolves", "conference": "Western" }, 
        { "name": "Los Angeles Clippers", "conference": "Western" }, 
        { "name": "Oklahoma City Thunder", "conference": "Western" }, 
        { "name": "Charlotte Hornets", "conference": "Eastern" }, 
        { "name": "Milwaukee Bucks", "conference": "Eastern" }, 
        { "name": "Memphis Grizzlies", "conference": "Western" }, 
        { "name": "Toronto Raptors", "conference": "Eastern" }, 
        { "name": "Houston Rockets", "conference": "Western" }, 
        { "name": "Phoenix Suns", "conference": "Western" }, 
        { "name": "Sacramento Kings", "conference": "Western" }, 
        { "name": "New Orleans Pelicans", "conference": "Western" }, 
        { "name": "Cleveland Cavaliers", "conference": "Eastern" }, 
        { "name": "Atlanta Hawks", "conference": "Eastern" }, 
        { "name": "Brooklyn Nets", "conference": "Eastern" }, 
        { "name": "Indiana Pacers", "conference": "Eastern" }, 
        { "name": "Denver Nuggets", "conference": "Western" } 
    ]
        

    teamList = map(lambda x: x["name"], teamObject)    


    """
    Takes in an array of game details (date, home/away, scores) and spits out an array of "daily" style records
    """
    def createFromGameDetails(self, gameDetailsList):
        

        teamRecordList = self.__createEmptyRecordDict()

        #dailyRecordList = []
        dailyRecordList = self.__createStubbedDailyRecordList(gameDetailsList)
        dailyRecordList = self.__populateDailyRecordList(dailyRecordList, gameDetailsList, teamRecordList);

        #printTeamStandings(teamRecordList)

        shoehornedTeams = self.__convertStructureForD3(dailyRecordList)        
        shoehornedTeams = self.__interpolateAcrossDates(shoehornedTeams)
        shoehornedTeams = self.__filterTeamsBeforeRanking(shoehornedTeams)
        showhornedTeams = self.__rankByDate(shoehornedTeams, gameDetailsList)

        #self.__printTeamDailyStats(shoehornedTeams[0])

        return shoehornedTeams


    """
    Filters out teams before ranking them (e.g. by conference or division)
    """
    def __filterTeamsBeforeRanking(self, shoehornedTeams):    

        def filterFunc(x):
            teamObjectsToMatch = filter(lambda x: x["conference"] == "Eastern", DailyRecord.teamObject)
            teamsToMatch = map(lambda x: x["name"], teamObjectsToMatch)
            if x["name"] in teamsToMatch:
                return True
            return False

        filteredTeams = filter(filterFunc, shoehornedTeams)

        return filteredTeams


    """
    Sorts list (but converts list of dicts to list of tuples)
    Because these are tuples, we print them using integer indices
    """
    def __printTeamStandings(self, teamRecordList):
        
        sortedTuples = sorted(teamRecordList.items(), key=lambda val: -val[1]["percentage"])
        
        for item in sortedTuples:
            print item[0], item[1]


    """
    Parse the gameDetailsList and create a dailyRecordList
    """
    def __populateDailyRecordList(self, dailyRecordList, gameDetailsList, teamRecordList):

        for game in gameDetailsList:
            
            winnerLoserDetails = self.__getWinnerAndLoserDetails(game)
            
            if winnerLoserDetails:
                updatedWLRecords = self.__updateWLRecords(teamRecordList, winnerLoserDetails)
                self.__createDailyTeamRecord(dailyRecordList, winnerLoserDetails["date"], winnerLoserDetails["winner"], updatedWLRecords["winnerRecord"])
                self.__createDailyTeamRecord(dailyRecordList, winnerLoserDetails["date"], winnerLoserDetails["loser"], updatedWLRecords["loserRecord"])

        return dailyRecordList


    """
    If it comes across a stubbed zeroed-out record (not a legit one early in the season) 
    we just take on the previous record's values
    """
    def __interpolateAcrossDates(self, shoehornedTeams):

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
    def __rankByDate(self, shoehornedTeams, gameDetailsList):

        gameDates = self.__getAllGameDates(gameDetailsList)

        for date in gameDates:
            
            someList = []
            
            for team in shoehornedTeams:
                item = filter(lambda x: x["date"] == date, team["values"])
                someList.extend(item)
            
            someList = list(sorted(someList, key=lambda x: -x["percentage"]))
            
            for counter, team in enumerate(someList):
                team["ranking"] = counter + 1
            
            # print date + "\n-----------------"
            # for counter, team in enumerate(someList):
            #     print "{0} {1} {2}".format(team["ranking"], team["team"], team["percentage"])


    """
    Print season stats to console
    """
    def __printTeamDailyStats(self, shoehornedTeam):
        
        for game in shoehornedTeam["values"]:
            print "{0} {1} {2} {3} {4} {5}".format(game["ranking"], game["team"], game["total"], game["win"], game["loss"], game["percentage"])



    """
    Creates a dictionary to hold each team's running win/loss record
    """
    def __createStubbedDailyRecordList(self, gameDetailsList):

        dailyRecordList = []

        sortedDateSet = self.__getAllGameDates(gameDetailsList)

        for date in sortedDateSet:
            for team in DailyRecord.teamList:
                dailyRecordList.append({"date": date, "team": team, "win": 0, "loss": 0, "total": 0, "percentage": 0.00, "ranking": 0})

        return dailyRecordList



    """
    Creates a dictionary to hold each team's running win/loss record
    """
    def __createEmptyRecordDict(self):
        
        recordDict = {}
        
        for team in DailyRecord.teamList:
            recordDict[team] = {"win": 0, "loss": 0, "total": 0, "percentage": 0.00, "ranking": 0}

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
    def __updateWLRecords(self, teamRecordList, winnerLoserDetails):

        winnerRecord = teamRecordList[winnerLoserDetails["winner"]]
        winnerRecord["win"] += 1
        winnerRecord["total"] += 1
        winnerRecord["percentage"] = float(winnerRecord["win"]) / float(winnerRecord["total"])

        loserRecord = teamRecordList[winnerLoserDetails["loser"]]
        loserRecord["loss"] += 1
        loserRecord["total"] += 1
        loserRecord["percentage"] = float(loserRecord["win"]) / float(loserRecord["total"])

        sortedTuples = sorted(teamRecordList.items(), key=lambda val: -val[1]["percentage"])

        for counter, (team, values) in enumerate(sortedTuples):
            if (winnerLoserDetails["winner"] == team):
                winnerRecord["ranking"] = counter + 1
            elif (winnerLoserDetails["loser"] == team):
                loserRecord["ranking"] = counter + 1

        return {
            "winnerRecord": winnerRecord,
            "loserRecord": loserRecord
        }


    """
    Creates two "daily" format records from the game details and updated win/loss stats
    """
    def __createDailyTeamRecord(self, dailyRecordList, date, team, teamRecord):

        dateString = datetime.fromtimestamp(mktime(date)).strftime("%Y%m%d")
        
        recordsToUpdate = filter(lambda x: (x["date"] == dateString) and (x["team"] == team), dailyRecordList)

        if len(recordsToUpdate) == 1:
            recordToUpdate = recordsToUpdate[0]
            recordToUpdate["win"] = teamRecord["win"]
            recordToUpdate["loss"] = teamRecord["loss"]
            recordToUpdate["total"] = teamRecord["total"]
            recordToUpdate["percentage"] = teamRecord["percentage"]
            recordToUpdate["ranking"] = teamRecord["ranking"]



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

        # for team in shoehornedTeams:
        #     team["values"]

        return shoehornedTeams



    def __getAllGameDates(self, gameDetailsList):
        dateSet = list(set(map(lambda x: datetime.fromtimestamp(mktime(x["date"])).strftime("%Y%m%d"), gameDetailsList)))        
        return sorted(dateSet, key=lambda date: date)




