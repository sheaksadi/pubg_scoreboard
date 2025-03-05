import {login} from "./login.js";
import {logout} from "./logout.js";
import {callback} from "./callback.js";
import {session} from "./session.js";

export function auth(app){
    app.get('/api/auth/login', login);
    app.post('/api/auth/logout', logout);
    app.get('/api/auth/callback', callback);
    app.get('/api/auth/session', session);
}