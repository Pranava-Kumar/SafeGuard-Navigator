# Import user CRUD operations
from .user import (
    get_user_by_email,
    create_user,
    authenticate,
)

# Make them available at the package level
__all__ = [
    "get_user_by_email",
    "create_user",
    "authenticate",
]