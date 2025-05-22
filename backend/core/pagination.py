from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    A standard pagination class for the budget proposal application.
    Provides page size control and includes metadata in the response.
    """
    page_size = 10  # Default number of items per page
    page_size_query_param = 'page_size'  # Allow client to override page size
    max_page_size = 100  # Maximum limit to prevent performance issues
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,  # Total number of items
            'next': self.get_next_link(),  # URL to the next page
            'previous': self.get_previous_link(),  # URL to the previous page
            'results': data  # The actual data for this page
        })
        
class ProjectStatusPagination(PageNumberPagination):
    """
    A custom pagination class for project status list with a smaller page size.
    Designed for dashboard views where fewer items per page is preferable.
    """
    page_size = 5  # Smaller default for dashboard views
    page_size_query_param = 'page_size'
    max_page_size = 50  # Lower maximum for dashboard views
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })