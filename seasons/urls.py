from django.conf.urls import url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
#from django.conf.urls.static import static

from . import views

urlpatterns = [
    url(r'^(\w+)/(\d{4})/(\w+)/$', views.index, name='index'),
]

urlpatterns += staticfiles_urlpatterns()
# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

