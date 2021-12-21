import { AxiosError } from "axios";
import useAxios from "axios-hooks";

import React, { useEffect } from "react";
import { CursorPaginationResult, useCursorPaginationAxios } from "../common/use-cursor-pagination";
import { RawDataSource, RawDataSourceListParams } from "./types";

export const useGetPaginatedRawDataSource = (): CursorPaginationResult<RawDataSource>=>
    useCursorPaginationAxios({
        url: 'raw-data/',
        params: {
            pageSize: 100,
        }
    })