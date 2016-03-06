class Team(object):
    

    ######################################## Attributes ########################################
    
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