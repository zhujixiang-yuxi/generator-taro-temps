import { http } from '@/utils'

export const queryUnFinishOrder = () => {
	const url = '/v1/order/getUnFinishOrder'
	return http.get(url)
}

export const getHelperQuestion = () => {
	const url = '/v1/help/getHelp'
	return http.get(url)
}

export const getUserInfo = () => {
	const url = '/v1/user/getUserInfo'
	return http.get(url)
}
