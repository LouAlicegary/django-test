from __future__             import unicode_literals

from datetime               import datetime

from django.db              import models
from django.forms.models    import model_to_dict

from seasons.models.team    import Team
from seasons.models.game    import Game


class TeamGame(models.Model):
 
    class Meta:
        managed = False  

    ######################################## Attributes ########################################
    
    sport        = models.CharField(max_length=30, default="")
    league       = models.CharField(max_length=30, default="")
    season       = models.CharField(max_length=30, default="")     
    team         = models.CharField(max_length=30, default="")
    date         = models.DateField()
    win          = models.IntegerField()
    loss         = models.IntegerField()
    total        = models.IntegerField()
    percentage   = models.FloatField()
    ranking      = models.IntegerField()
    game         = models.IntegerField(default=0)
    gamesBack    = models.FloatField()
    

    ######################################## Static Methods ###################################


    @staticmethod 
    def findAllBySportAndSeason(sport, season, league):

        # Grab all games from DB
        teamGamesInDb = TeamGame.objects.all().filter(sport=sport).filter(season=season).filter(league=league).order_by('date')

        objectDict = []

        # Convert games to dictionary (array) objects and throw into a dictionary (array)
        for teamGame in teamGamesInDb:
            teamGameDict = model_to_dict(teamGame)
            objectDict.append(teamGameDict)

        return objectDict

