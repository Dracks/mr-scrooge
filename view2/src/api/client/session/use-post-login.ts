import useAxios, { UseAxiosResult } from "axios-hooks"
import { useCallback } from "react"

export interface LoginParams {
    user: string, 
    password: string
}

export const usePostLogin = (): UseAxiosResult<{isAuthenticated: boolean}, LoginParams> => {
    return useAxios({
        url: '/session/',
        method: 'POST'
    }, { manual: true })

}