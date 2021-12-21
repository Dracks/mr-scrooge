from rest_framework.authentication import SessionAuthentication 

class CsrfExemptSessionAuthentication(SessionAuthentication):
    pass
    #def enforce_csrf(self, request):
    #    return  # To not perform the csrf check previously happening