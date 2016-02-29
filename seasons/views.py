from django.shortcuts import render
from django.http import HttpResponse

from .libs.basketball_reference import Scraper
from .libs.data_objects import DailyRecord

import json

# Create your views here.

def index(request):
    
    gameDetailsList = Scraper().getAllGameDetails()
    dailyRecordList = DailyRecord().createFromGameDetails(gameDetailsList)

    incomingJsonData = json.dumps(dailyRecordList)

    context = {'incomingJsonData': incomingJsonData}
    
    return render(request, 'seasons/index.html', context)


def cities(request):
    
    return render(request, 'seasons/cities.html')