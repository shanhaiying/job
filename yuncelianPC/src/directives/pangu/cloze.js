import app from 'app';


// 弹窗指令
export default app.directive('cloze',[function(){
		return {
			restrict:'E',
			template:'<span class="cloze" style="display: inline-block;min-width: 2.5em;height: 1em;text-align: center;line-height: 1em;padding: 0 .5em;border-bottom: 1px solid #333;vertical-align: middle;"></span>',
			replace:true,
			link:function(scope, element, attrs){
				
			}
		}
	}]);