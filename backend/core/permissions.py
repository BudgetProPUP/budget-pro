from rest_framework import permissions

# The service name slug for the Budget Management System -
# - should match the slug in the auth_service's System model
BMS_SERVICE_SLUG = 'bms' 

class IsBMSAdmin(permissions.BasePermission):
    """
    Permission check for BMS Administrator role.
    Reads the role from the JWT payload.
    """
    def has_permission(self, request, view):
        user_roles = getattr(request.user, 'roles', {})
        bms_role = user_roles.get(BMS_SERVICE_SLUG)
        return bms_role == 'ADMIN'

class IsBMSFinanceHead(permissions.BasePermission):
    """
    Permission check for BMS Finance Head role.
    Reads the role from the JWT payload.
    """
    def has_permission(self, request, view):
        user_roles = getattr(request.user, 'roles', {})
        bms_role = user_roles.get(BMS_SERVICE_SLUG)
        return bms_role == 'FINANCE_HEAD'

class IsBMSUser(permissions.BasePermission):
    """
    Permission check for any valid BMS user (Admin or Finance Head).
    Reads the role from the JWT payload.
    """
    def has_permission(self, request, view):
        user_roles = getattr(request.user, 'roles', {})
        bms_role = user_roles.get(BMS_SERVICE_SLUG)
        return bms_role in ['ADMIN', 'FINANCE_HEAD']

class IsTrustedService(permissions.BasePermission):
    """
    Allows access only to authenticated services (via API Key).
    """
    def has_permission(self, request, view):
        # Check if request.user is an instance of the ServicePrincipal
        # and potentially check request.user.service_name
        from .service_authentication import ServicePrincipal # Avoid circular import if in same file
        
        return (request.user and
                request.user.is_authenticated and
                isinstance(request.user, ServicePrincipal) and
                request.user.service_name in ["DTS", "TTS"])
        
# class IsFinanceHead(permissions.BasePermission):
   
#     # Permission check for Finance Head role.
   
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'FINANCE_HEAD'

# class IsAdmin(permissions.BasePermission):
   
#     # Permission check for Finance Operator role.
   
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'ADMIN'
    
# class IsFinanceOperator(permissions.BasePermission):
   
#     # Permission check for Finance Operator role.
   
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'FINANCE_OPERATOR'


# class IsFinanceUser(permissions.BasePermission):
   
#     # Permission check for any finance user (Head or Operator).
   
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role in ['FINANCE_HEAD', 'ADMIN']


# class IsOwnerOrFinanceHead(permissions.BasePermission):

#     # Object-level permission to allow owners of an object or finance heads to access it.
#     # Assumes the model instance has a `created_by` or `submitted_by` attribute.
 
#     def has_object_permission(self, request, view, obj):
#         if request.user.role == 'FINANCE_HEAD':
#             return True
            
#         # Check if object has a user relationship field
#         user_field = None
#         if hasattr(obj, 'created_by'):
#             user_field = 'created_by'
#         elif hasattr(obj, 'submitted_by'):
#             user_field = 'submitted_by'
#         elif hasattr(obj, 'user'):
#             user_field = 'user'
            
#         if user_field is not None:
#             return getattr(obj, user_field) == request.user
            
#         return False
    
