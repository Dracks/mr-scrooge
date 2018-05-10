from rest_framework import filters

class CoalesceFilterBackend(filters.BaseFilterBackend):
    """
    Support Ember Data coalesceFindRequests.

    """
    def filter_queryset(self, request, queryset, view):
        id_list = request.query_params.getlist('ids[]')
        if id_list:
            # Disable pagination, so all records can load.
            view.pagination_class = None
            queryset = queryset.filter(id__in=id_list)
        return queryset