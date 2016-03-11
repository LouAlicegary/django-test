from __future__                         import unicode_literals

from django.db                          import models
from django.forms.models                import model_to_dict

from seasons.libs.basketball_reference  import Scraper


class Game(models.Model):
    
    ######################################## Attributes ########################################
    
    date         = models.DateField()
    home         = models.CharField(max_length=30, default="")
    visitor      = models.CharField(max_length=30, default="")
    homeScore    = models.IntegerField()
    visitorScore = models.IntegerField()


    ######################################## Static Methods ####################################
 
    @staticmethod
    def getAllGameDates(gameDetailsList):
        
        dateSet = list(set(map(lambda x: x["date"], gameDetailsList)))        
        
        return sorted(dateSet, key=lambda date: date)


    @staticmethod 
    def findOrCreateAll():

        gamesInDb = Game.objects.all()

        if (len(gamesInDb) == 0):
            gameDetailsList = Game.__scrapeData()
        else:
            gameDetailsList = Game.__importDataFromDb(gamesInDb)

        return gameDetailsList


    @staticmethod
    def __scrapeData():
        
        print "*** Scraping game data from website ***"
        
        gameDetailsList = Scraper().getAllGameDetails()
        
        # Store game data in the DB
        # The ** operator converts dict to args list
        for game in gameDetailsList:
            Game.objects.create(**game)             

        return gameDetailsList


    @staticmethod
    def __importDataFromDb(gameDetailsList):

        print "*** Bypassing scrape and importing game data from database ***"
            
        objectDict = []

        for game in gameDetailsList:
            gameDict = model_to_dict(game)
            objectDict.append(gameDict)

        return objectDict

