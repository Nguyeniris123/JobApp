# from firebase_admin import auth as firebase_auth
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
#
# class FirebaseTokenView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         user = request.user
#         firebase_uid = f"user_{user.id}"  # Đặt UID Firebase duy nhất
#         token = firebase_auth.create_custom_token(firebase_uid)
#         return Response({"firebase_token": token.decode('utf-8')})