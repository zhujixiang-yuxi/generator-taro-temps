import Taro from '@tarojs/taro'
import { getAuthCode, isType } from '@/utils'
import { NET_CODE } from '@/code'
import { HttpResponse } from '@/interfaces'
import store from '../store'
import { setToken } from '../store/actions/user'

import Queue from './queue'

const requestQueue = new Queue()
const env = process.env.NODE_ENV
export default class Http {
	public middlewares
	constructor() {
		this.middlewares = []
	}

	defaultRequestErrorHandler(err) {
		return err
	}

	getToken() {
		return new Promise(async (resolve, reject) => {
			const authCode = await getAuthCode('auth_base')
			this.post('/v1/user/login', { authCode })
				.then(res => {
					console.log(res)
					const token = res.data.token
					store.dispatch(setToken(token))
					resolve(res)
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	use(code, fn) {
		const scene = { sceneCode: code, handleSceneFun: fn }
		this.middlewares.push(scene)
	}

	getBaseUrl() {
		return API_GATEWAY[env]
	}

	async handleNotAuthRequest(config, resolve, reject, selfRequestErrorHandler) {
		const notTokenRequest = async () => {
			return resolve(await this.request(config, selfRequestErrorHandler).catch(err => reject(err)))
		}
		requestQueue.enqueue(notTokenRequest)
		if (requestQueue.size() === 1) {
			await this.getToken()
			requestQueue.loopExec()
		}
	}

	request(config: Taro.request.Param<any>, selfRequestErrorHandler): Promise<HttpResponse> {
		return new Promise(async (resolve, reject) => {
			const { user } = store.getState()
			config.header = {
				'Content-Type': 'application/json', // 默认值
				'MiniProgram-Type': 'ALIPAY',
				'MiniProgram-Token': user.token,
			}
			if (!user.token && !config.url.includes('user/login'))
				return this.handleNotAuthRequest(config, resolve, reject, selfRequestErrorHandler)
			const { data: response } = await Taro.request(config).catch(err => this.defaultRequestErrorHandler(err))
			const { code, message } = response
			if (code === NET_CODE.SUCCESS) return resolve(response)
			if (isType(selfRequestErrorHandler, 'function')) {
				selfRequestErrorHandler(response)
				return reject(response)
			}
			const hasCatchErrorScene = this.middlewares.some(element => {
				if (element.sceneCode === code) {
					element.handleSceneFun(response)
					return true
				}
			})
			!hasCatchErrorScene &&
				Taro.showToast({
					title: message || '服务暂不可用，请稍后重试',
					icon: 'none',
				})
			reject(response)
		})
	}

	post(path, data = {}, handleError?: any): Promise<HttpResponse> {
		const url = this.getBaseUrl() + path
		const method = 'POST'
		return this.request({ method, url, data }, handleError)
	}

	get(path: string, handleError?: any): Promise<HttpResponse> {
		const url = this.getBaseUrl() + path
		const method = 'GET'
		return this.request({ method, url }, handleError)
	}
}
