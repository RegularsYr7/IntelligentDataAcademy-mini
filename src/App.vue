<script>
export default {
	onLaunch: function () {
		console.log('App Launch')
	},
	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	},
	methods: {

	}
}
</script>

<style lang="scss">
/* 每个页面公共css */

/* 引入 uview-plus 的 SCSS 变量 */
@import 'uview-plus/theme.scss';

/* 引入 uview-plus 样式 */
@import 'uview-plus/index.scss';

/* 页面容器 - 适配原生导航栏 */
.page {
	width: 100%;
	min-height: 100vh;
}

/* 页面主容器 */
.container {
	min-height: 100vh;
	background: #f5f5f5;
}
</style>
