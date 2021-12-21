from rest_framework.exceptions import NotFound
from rest_framework.pagination import CursorPagination, _positive_int, Cursor
from rest_framework.response import Response


class CustomCursorPagination(CursorPagination):
    def decode_cursor(self, request):
        encoded = request.query_params.get(self.cursor_query_param)
        if encoded is None:
            return None
        
        try:
            (offset, reverse, position) = encoded.split(':')
            offset = _positive_int(offset, cutoff=self.offset_cutoff)

            reverse = bool(int(reverse))
        except(TypeError, ValueError):
            raise NotFound(self.invalid_cursor_message)
        
        return Cursor(offset=offset, reverse=reverse, position=position)
    
    def encode_cursor(self, cursor):
        return f"{cursor.offset}:{1 if cursor.reverse else 0 }:{cursor.position}"