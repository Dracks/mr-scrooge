import { components } from "../../generated-models"
import {CamelCasedProperties } from 'type-fest'

export interface LoginParams {
    user: string, 
    password: string
}

export type UserSession = CamelCasedProperties<components['schemas']["UserSession"]>

export type GetSessionResponse = UserSession | Pick<UserSession, 'isAuthenticated'>