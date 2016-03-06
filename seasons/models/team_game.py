from __future__                 import unicode_literals

from django.db                  import models

from seasons.models.team        import Team
from seasons.models.game        import Game


class TeamGame(models.Model):
    

    ######################################## Attributes ########################################
    
    team        = models.CharField(max_length=30, default="")
    date        = models.DateField()
    win         = models.IntegerField()
    loss        = models.IntegerField()
    total       = models.IntegerField()
    percentage  = models.FloatField()
    ranking     = models.IntegerField()


    ######################################## Static Methods ###################################


    @staticmethod
    def batchCreateRecords(dailyRecordList):
        
        TeamGame.objects.all().delete()
        
        for (count,rec) in enumerate(dailyRecordList):
            TeamGame.objects.create(**rec)

        return count


    """
    Takes in an array of game details (date, home/away, scores) and spits out an array of "daily" style records
    """
    @staticmethod
    def createFromGameDetails(gameDetailsList):
        
        print "*** Creating Empty Record Dictionary ***"
        teamRecordList = TeamGame.__createEmptyTeamRecordDict()

        print "*** Creating Stubbed Daily Record List ***"
        dailyRecordList = TeamGame.__createStubbedDailyRecordList(gameDetailsList)
        
        print "*** Populating Daily Record List ***"
        dailyRecordList = TeamGame.__populateDailyRecordList(dailyRecordList, gameDetailsList, teamRecordList);

        return dailyRecordList

    
    """
    Creates a "daily" format record from the game details and updated win/loss stats
    """
    @staticmethod
    def __createDailyTeamRecord(dailyRecordList, gameDate, team, teamRecord):
        
        recordsToUpdate = filter(lambda x: (x["date"] == gameDate) and (x["team"] == team), dailyRecordList)

        if len(recordsToUpdate) == 1:
            
            recordToUpdate = recordsToUpdate[0]
            recordToUpdate["win"] = teamRecord["win"]
            recordToUpdate["loss"] = teamRecord["loss"]
            recordToUpdate["total"] = teamRecord["total"]
            recordToUpdate["percentage"] = teamRecord["percentage"]
            recordToUpdate["ranking"] = teamRecord["ranking"]



    """
    Creates a dictionary to hold each team's running win/loss record
    """
    @staticmethod
    def __createEmptyTeamRecordDict():
        
        recordDict = {}
        
        for team in Team.teamList:
            recordDict[team] = {"win": 0, "loss": 0, "total": 0, "percentage": 0.00, "ranking": 0}

        return recordDict


    """
    Creates a dictionary to hold each team's running win/loss record
    """
    @staticmethod
    def __createStubbedDailyRecordList(gameDetailsList):

        dailyRecordList = []

        sortedDateSet = Game.getAllGameDates(gameDetailsList)

        for date in sortedDateSet:
            for team in Team.teamList:
                dailyRecordList.append({"date": date, "team": team, "win": 0, "loss": 0, "total": 0, "percentage": 0.00, "ranking": 0})

        return dailyRecordList


    """
    Parse the gameDetailsList and create a dailyRecordList
    """
    @staticmethod
    def __populateDailyRecordList(dailyRecordList, gameDetailsList, teamRecordList):

        for game in gameDetailsList:
            
            winnerLoserDetails = TeamGame.__getWinnerAndLoserDetails(game)
            
            if winnerLoserDetails:
                
                updatedWLRecords = TeamGame.__updateWLRecords(teamRecordList, winnerLoserDetails)
                
                gameDate = winnerLoserDetails["date"]
                gameWinner = winnerLoserDetails["winner"]
                gameLoser = winnerLoserDetails["loser"]

                TeamGame.__createDailyTeamRecord(dailyRecordList, gameDate, gameWinner, updatedWLRecords["winnerRecord"])
                TeamGame.__createDailyTeamRecord(dailyRecordList, gameDate, gameLoser, updatedWLRecords["loserRecord"])

        return dailyRecordList


    """
    Takes a game details object (date, visitor/home, and scores) and calculates winner and loser
    Discards any games set to occur in the future
    """
    @staticmethod
    def __getWinnerAndLoserDetails(gameDetails):


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
    @staticmethod
    def __updateWLRecords(teamRecordList, winnerLoserDetails):

        # Update the winner's record in the team record list
        winnerRecord = teamRecordList[winnerLoserDetails["winner"]]
        winnerRecord["win"] += 1
        winnerRecord["total"] += 1
        winnerRecord["percentage"] = float(winnerRecord["win"]) / float(winnerRecord["total"])

        # Update the loser's record in the team record list
        loserRecord = teamRecordList[winnerLoserDetails["loser"]]
        loserRecord["loss"] += 1
        loserRecord["total"] += 1
        loserRecord["percentage"] = float(loserRecord["win"]) / float(loserRecord["total"])

        # Sort all of the teams' records by win percentage best to worst
        sortedTuples = sorted(teamRecordList.items(), key=lambda val: -val[1]["percentage"])

        # Apply rankings to the winner's and loser's records
        for counter, (team, values) in enumerate(sortedTuples):
            if (winnerLoserDetails["winner"] == team):
                winnerRecord["ranking"] = counter + 1
            elif (winnerLoserDetails["loser"] == team):
                loserRecord["ranking"] = counter + 1

        return {
            "winnerRecord": winnerRecord,
            "loserRecord": loserRecord
        }


