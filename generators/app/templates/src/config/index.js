// eslint-disable-next-line import/no-commonjs
const path = require('path')

let outputRoot = 'dist'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [nodePath, buildPath, typeArgs, weappType] = process.argv
if (typeArgs === '--type' && weappType) {
	outputRoot = weappType
}

const config = {
	projectName: 'plan-miniapp',
	date: '2019-11-29',
	designWidth: 750,
	deviceRatio: {
		'640': 2.34 / 2,
		'750': 1,
		'828': 1.81 / 2,
	},
	sourceRoot: 'src',
	outputRoot: outputRoot,
	plugins: {
		babel: {
			sourceMap: true,
			presets: [
				[
					'env',
					{
						modules: false,
					},
				],
			],
			plugins: ['transform-decorators-legacy', 'transform-class-properties', 'transform-object-rest-spread'],
		},
	},
	defineConstants: {
		API_GATEWAY: {
			development: 'https://dbb-miniprogram-gateway.iwosai.com',
			production: 'https://dbb-miniprogram-gateway.shouqianba.com',
		},
	},
	copy: {
		patterns: [],
		options: {},
	},
	alias: {
		'@/components': path.resolve(__dirname, '..', 'src/components'),
		'@/utils': path.resolve(__dirname, '..', 'src/utils'),
		'@/api': path.resolve(__dirname, '..', 'src/api'),
		'@/code': path.resolve(__dirname, '..', 'src/code'),
		'@/decorators': path.resolve(__dirname, '..', 'src/decorators'),
		'@/interfaces': path.resolve(__dirname, '..', 'src/interfaces'),
		'@/package': path.resolve(__dirname, '..', 'package.json'),
		'@/project': path.resolve(__dirname, '..', 'project.config.json'),
	},
	weapp: {
		module: {
			postcss: {
				autoprefixer: {
					enable: true,
					config: {
						browsers: ['last 3 versions', 'Android >= 4.1', 'ios >= 8'],
					},
				},
				pxtransform: {
					enable: true,
					config: {},
				},
				url: {
					enable: true,
					config: {
						limit: 10240, // 设定转换尺寸上限
					},
				},
				cssModules: {
					enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
					config: {
						namingPattern: 'module', // 转换模式，取值为 global/module
						generateScopedName: '[name]__[local]___[hash:base64:5]',
					},
				},
			},
		},
	},
	h5: {
		publicPath: '/',
		staticDirectory: 'static',
		module: {
			postcss: {
				autoprefixer: {
					enable: true,
					config: {
						browsers: ['last 3 versions', 'Android >= 4.1', 'ios >= 8'],
					},
				},
				cssModules: {
					enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
					config: {
						namingPattern: 'module', // 转换模式，取值为 global/module
						generateScopedName: '[name]__[local]___[hash:base64:5]',
					},
				},
			},
		},
	},
}

module.exports = function(merge) {
	if (process.env.NODE_ENV === 'development') {
		return merge({}, config, require('./dev'))
	}
	return merge({}, config, require('./prod'))
}
