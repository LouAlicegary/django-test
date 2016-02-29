import pprint

from basketball_reference import Scraper
from data_objects import DailyRecord


"""
Do the thing.
"""
def main():

    gameDetailsList = Scraper().getAllGameDetails()
    #pp.pprint(gameDetailsList)
    
    dailyRecordList = DailyRecord().createFromGameDetails(gameDetailsList)
    #pp.pprint(dailyRecordList)
    
    print "\n=== main() finished. ===\n"


if __name__ == "__main__":
   pp = pprint.PrettyPrinter(indent=4)
   main()