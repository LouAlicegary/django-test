from bs4 import BeautifulSoup
import requests
import time

class Scraper(object):
    
    """
    Returns an array of all the games found at the specified URL
    """
    def getAllGameDetails(self):

        url = "http://www.basketball-reference.com/leagues/NBA_2016_games.html?lid=header_seasons"

        gameDetailsArray = []

        soup = self.__getSoupFromURL(url)
        tr_array = soup.find("table", id="games").find_all("tr")

        for tr in tr_array:
            if (len(tr.find_all("th")) == 0):
                tdArray = tr.find_all("td")
                gameDetailsArray.append(self.__parseGameDetailsFromRow(tdArray))

        return gameDetailsArray


    """
    Grabs the HTML at the specified URL and returns a BeautifulSoup object
    """
    def __getSoupFromURL(self, url):

        try:
            r = requests.get(url)
        except:
            return None

        return BeautifulSoup(r.text, "html.parser")


    """
    Takes a ResultSet of <td> elements from the table and parses it into a dictionary
    """
    def __parseGameDetailsFromRow(self, row):

        return {
            "date": self.__dateParser(row[0].a.string), 
            "visitor": row[3].a.string,
            "visitorScore": int(row[4].string or 0),
            "home": row[5].a.string,
            "homeScore": int(row[6].string or 0)        
        }


    """
    Takes a date in the BR "Thu, Nov 7, 2015" format and converts it to a Python dateString
    """
    def __dateParser(self, dateString):

        return time.strptime(dateString, "%a, %b %d, %Y")


