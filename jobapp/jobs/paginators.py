from rest_framework import pagination

class JobPostPaginator(pagination.PageNumberPagination):
    page_size = 10
