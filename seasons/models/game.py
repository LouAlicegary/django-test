from __future__             import unicode_literals
from datetime               import datetime

from django.db              import models
from django.forms.models    import model_to_dict


class Game(models.Model):
    
    class Meta:
        managed = False

    ######################################## Attributes ########################################

    sport        = models.CharField(max_length=30, default="")
    league       = models.CharField(max_length=30, default="")
    season       = models.CharField(max_length=30, default="")    
    date         = models.DateField()
    home         = models.CharField(max_length=30, default="")
    visitor      = models.CharField(max_length=30, default="")
    homeScore    = models.IntegerField()
    visitorScore = models.IntegerField()


    ######################################## Static Methods ####################################
 

    @staticmethod 
    def findAllBySportAndSeason(sport, season, league):

        # Grab all games from DB
        gamesInDb = Game.objects.all().filter(sport=sport).filter(season=season).filter(league=league).order_by('date')

        objectDict = []

        # Convert games to dictionary (array) objects and throw into a dictionary (array)
        for game in gamesInDb:
            gameDict = model_to_dict(game)
            objectDict.append(gameDict)

        return objectDict


    @staticmethod
    def getAllGameDates(gameDetailsList):
        
        dateSet = list(set(map(lambda x: x["date"], gameDetailsList)))        
        
        return sorted(dateSet, key=lambda date: date)

