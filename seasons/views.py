from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def index(request):
    
    helloString = "Hello, world. You're at the seasons index."
    
    #return HttpResponse(helloString)
    
    context = {'message': helloString}
    
    return render(request, 'seasons/index.html', context)