import axios from 'axios';

const headers = {
	'X-Requested-With': 'XMLHttpRequest',
	'Content-Type': 'application/json',
	'Accept': 'application/json',
};

let lastCookieString;
let lastCookies = {};
const credential = {username: 'admin', password: 'admin'};


function readCookie(name) {
  let cookieString = document.cookie || '';
  if (cookieString !== lastCookieString) {
    lastCookieString = cookieString;
    lastCookies = cookieString.split('; ').reduce((obj, value) => {
      let parts = value.split('=');
      obj[parts[0]] = parts[1];
      return obj;
    }, {});
  }
  return lastCookies[name];
}


class service {
	constructor(props) {
		this.baseURL = process.env.NODE_ENV === 'production' ? '../../' : '/op-app';
	}

	request(url, method, data) {
		let options = {};
		if(method !== 'get') {
			options['data'] = data;
		}
		const csrfToken = readCookie('CSRF-TOKEN');
		return axios({
			method: method,
			baseURL: this.baseURL,
			headers: {
				...headers,
				...(csrfToken ? {'X-CSRF-Token': readCookie('CSRF-TOKEN')} : {}),
			},
			url,
			...options,
		});
	}

	interceptor(url, method, data) {
		return this.request(url, method, data).then((result) => {
			if(result.status === 200) {
				return result.data || {status: result.status};
			} else if(result.status === 401) {
				const credential = localStorage.getItem('credential');
				if(credential) {
					const {username, password} = JSON.parse(credential);
					return this.login(username, password).then(res => {
						if(res.status === 200) {
							return this.interceptor(url, method, data);
						}
					})
				}
			}
			return Promise.resolve('Error');
		}).catch(e => {
			if(e.response.status === 401) {
				return this.relogin(url, method, data);
			}
		});
	}

	relogin(url, method, data) {
        const {username, password} = credential;
        return this.login(username, password).then(res => {
            if(res.status === 200) {
                return this.interceptor(url, method, data);
            }
        })
	}

	post(url, data = {}) {
		return this.interceptor(url, 'post', data);
	}

	delete(url, data) {
		return this.interceptor(url, 'delete', data);
	}


	login(username, password) {
		const data = {username, password};
		return this.interceptor('login.jsp', 'post', data).then(res => {
			if(res.status === 200) {
				localStorage.setItem('credential', JSON.stringify({username, password}));
			}
			return {status: res.status};
		});
	}

	logout() {
		return this.interceptor('logout').then(() => {
			localStorage.removeItem('credential');
		});
	}


}

export default service;
