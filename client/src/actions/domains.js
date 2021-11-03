
import {  SET_DOMAIN } from './types';

export const setDomain = domain => ({ type: SET_DOMAIN, payload: domain.site });
