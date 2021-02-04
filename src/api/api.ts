import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiConfig } from "../config/api.config";

//api metod za slanje fajla
export function apiFile(
    path: string, 
    name: string,
    file: File,
    role: 'user' | 'administrator' = 'user',
) {
    return new Promise<ApiResponse>((resolve) => {
        const formData = new FormData();
        formData.append(name, file);

        const requestData: AxiosRequestConfig = {
            method: 'post',
            url: path,
            baseURL: ApiConfig.API_URL,
            data: formData,
            headers: {
                'Content-Type' : 'multipart/form-data',
                'Authorization' : getToken(role),
            },
        };
        axios(requestData)
          .then(res => responseHandler(res, resolve))  //prihvatamo axios response
          .catch(async err => {
            //STATUS 401 - Bad Token : 
            //TO DO: Refresh token i pokusati ponovo
            //ne mozemo da osvezimo token -> preusmeriti korisnika na login 
        if (err.response.status === 401) {
            const newToken = await refreshToken(role); //pravimo request za novi refresh token

            //uzimamo originalni request i menjamo u njemu token
            if (!newToken) { //ako novi token ne postoji
                const response: ApiResponse = {
                    status: 'login',
                    data: null,
                };
                return resolve(response);
            }
            //ako je token stigao
            saveToken(role, newToken);
            
            requestData.headers['Authorization'] = getToken(role);

            return await repeatRequest(requestData, resolve);
        }
              const response: ApiResponse = {
                  status: 'error',
                  data: err
              };
              resolve(response);
          });
    });   
}

export default function api(
    path: string, 
    method: 'get' | 'post' | 'patch' | 'delete',
    body: any | undefined, //undefined za get metod - nema body
    role: 'user' | 'administrator' = 'user',
) {
    return new Promise<ApiResponse>((resolve) => {
        const requestData = {
            method: method,
            url: path,
            baseURL: ApiConfig.API_URL,
            data: JSON.stringify(body), //u body-ju prihvatiti bilo sta, ali onda poslati iskljucivo kao JSON stringify data
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : getToken(role),
            },
        };
        axios(requestData)
          .then(res => responseHandler(res, resolve))  //prihvatamo axios response
          .catch(async err => {
            //STATUS 401 - Bad Token : 
            //TO DO: Refresh token i pokusati ponovo
            //ne mozemo da osvezimo token -> preusmeriti korisnika na login 
        if (err.response.status === 401) {
            const newToken = await refreshToken(role); //pravimo request za novi refresh token

            //uzimamo originalni request i menjamo u njemu token
            if (!newToken) { //ako novi token ne postoji
                const response: ApiResponse = {
                    status: 'login',
                    data: null,
                };
                return resolve(response);
            }
            //ako je token stigao
            saveToken(role, newToken);
            
            requestData.headers['Authorization'] = getToken(role);

            return await repeatRequest(requestData, resolve);
        }
              const response: ApiResponse = {
                  status: 'error',
                  data: err
              };
              resolve(response);
          });
    });   
}

export interface ApiResponse {
    status: 'ok' | 'error' | 'login'; //login - da treba ponovo da se uloguje
    data: any; //odgovor od api-ja moze biti bilo sta
}

async function responseHandler(
    res: AxiosResponse<any>,
    resolve: (value: ApiResponse) => void,
) { 
    //nepovoljan ishod - kada server ne odradi posao
    if (res.status < 200 || res.status >= 300) {
        const response: ApiResponse = {
            status: 'error',
            data: res.data,
        };

        return resolve(response);
    }

    //nepovoljan ishod - aplikacija ne odradi posao
    let response: ApiResponse;

    if (res.data.statusCode < 0) { //api.response.class.ts back-end
        response = {
            status: 'login',
            data: null,
        };
    } else {
        response = {
            status: 'ok',
            data: res.data,
        };
    }

    //povoljan ishod - vracamo data
    resolve(response);
}

function getToken(role: 'user' | 'administrator'): string {
    const token = localStorage.getItem('api_token' + role);
    return 'Barer ' + token;
}

export function saveToken(role: 'user' | 'administrator', token: string) {
    localStorage.setItem('api_token' + role, token);
}

function getRefreshToken(role: 'user' | 'administrator'):string {
    const token = localStorage.getItem('api_refresh_token' + role);
    return token + '';
}

export async function saveRefreshToken(role: 'user' | 'administrator', token: string) {
    localStorage.setItem('api_refresh_token' + role, token);

}

export function saveIdentity(role: 'user' | 'administrator', identity: string) {
    localStorage.setItem('api_identity' + role, identity);
}

export function getIdentity(role: 'user' | 'administrator'): string {
    const token = localStorage.getItem('api_identity' + role);
    return 'Barer ' + token;
}

export function removeTokenData(role: 'user' | 'administrator') {
    localStorage.removeItem('api_token' + role);
    localStorage.removeItem('api_refresh_token' + role);
    localStorage.removeItem('api_identity' + role);
}

//treba da vrati novi izmenjeni token
async function refreshToken(role: 'user' | 'administrator'): Promise<string | null> { //null kada nije uspesno dostavljen token 
        const path = 'auth/' + role + '/refresh';
        const data = {
            token: getRefreshToken(role), //za refreshovanje saljemo nas refresh token
        }

        const refreshTokenRequestData: AxiosRequestConfig = {
            method: 'post',
            url: path,
            baseURL: ApiConfig.API_URL,
            data: JSON.stringify(data), //u body-ju prihvatiti bilo sta, ali onda poslati iskljucivo kao JSON stringify data
            headers: {
                'Content-Type' : 'application/json',
            },
        };
        const refreshTokenResponse: { data: { token: string | undefined }} = await axios(refreshTokenRequestData);

        if (!refreshTokenResponse.data.token) { //ako nema podatka token u responsu
            return null;
        }

        return refreshTokenResponse.data.token; //vracamo taj token kao rezultat
    }

async function repeatRequest(
    requestData: AxiosRequestConfig, 
    resolve: (value: ApiResponse) => void
) {
    axios(requestData) //izvrsiti axios request sa tim requestData
        .then(res => {
            let response: ApiResponse;

            if (res.status === 401) {
                response = {
                    status: 'login',
                    data: null,
                };
            } else {
                response = {
                    status: 'ok',
                    data: res,
                };
            }

            return resolve(response);
            
        })
        .catch(err => {  //ne moze da se uspostavi veza sa internetom
            const response: ApiResponse = {
                status: 'error',
                data: err,
            };

            return resolve(response);
        });
}
    