import app from 'app';
import 'services/Toolkit';
import 'services/ExamService';
import 'services/ExerciseService';

app.controller('ExamReportController',['$scope','$interval','$filter','Toolkit','ExamService','ExerciseService',function($scope,$interval,$filter,Toolkit,ExamService,ExerciseService){
		$scope.params = Toolkit.serializeParams();

		$scope.report = {};
		$scope.isLoaded =false;
		var now = new Date().getTime();
		$scope.now = now;
		$interval(function(){
			$scope.now = new Date().getTime();
		},1000);
		
		$scope.startTimeNum = _EXERCISE_START_TIME;
		$scope.dueTimeNum = _EXERCISE_DUE_TIME;
		
		$scope.startTime = $filter('date')(_EXERCISE_START_TIME,"yyyy/MM/dd HH:mm");
		$scope.dueTime = $filter('date')(_EXERCISE_DUE_TIME,"yyyy/MM/dd HH:mm");
		$scope.form = {
				startDate:$scope.startTime.split(' ')[0],
				startTime:$scope.startTime.split(' ')[1],
				dueDate:$scope.dueTime.split(' ')[0],
				dueTime:$scope.dueTime.split(' ')[1],
		};

		ExamService.reportExam($scope.params.exerId).then(function(result){
			$scope.report = result;
			$scope.isLoaded =true;
		},function(msg){
			$scope.isLoaded =true;
		});


		$scope.remindOne = function(assign){
			if(assign.reminded || now>=$scope.report.dueDate){
				return;
			}

			ExerciseService.remind(assign.id,2).then(function(result){
				//更新assignment
				assign.reminded=true;
			},function(msg){

			});

		}

		$scope.isCalled = false;
		$scope.remindAll = function(isExpired){
			if(isExpired){
				return;
			}
			ExerciseService.remind($scope.params.exerId).then(function(result){
				//更新所有的assignment
				$scope.isCalled = true;
				angular.forEach($scope.report.assignments,function(assign){
					assign.reminded=true;
				});
			},function(msg){
				var data = {
					message:msg,
				};
				$scope.$emit('alert',data);
			});
		}
		
		
		$scope.$on('userinfo',function(event,info){
			$scope.userInfo = info;
		});
		$scope.showDialog = false;
		$scope.showType = 0;
		$scope.changeTime = function (type){
			$scope.showType = type;
			$scope.showDialog = true;
		}

		$scope.closeDialog =function(){
			$scope.showType = 0;
			$scope.showDialog = false;
		}
		
		$scope.save = function(type){
			var params = {};
			params.eid = $scope.params.exerId;
			params.uid = $scope.userInfo.uid;
			
			var json = {};
			var nowTime =parseInt($scope.now/1000/60);
			json.dueDate = new Date($scope.form.dueDate+" "+$scope.form.dueTime).getTime();
			var dueTime = parseInt(json.dueDate/1000/60);
			if(type==1){
				json.startDate = new Date($scope.form.startDate+" "+$scope.form.startTime).getTime();
				var startTime = parseInt(json.startDate/1000/60);
				if(startTime<nowTime){
					var data = {
	                        message:'发布时间不能小于当前时间'
	                    };
	                    $scope.$emit('alert',data);
					return;
				}
				if(dueTime<startTime){
					var data = {
	                        message:'截止时间不能小于开始时间'
	                    };
	                    $scope.$emit('alert',data);
					return;
				}
			}
			if(dueTime<nowTime){
				var data = {
                        message:'截止时间不能小于当前时间'
                    };
                    $scope.$emit('alert',data);
				return;
			}
			
			params.json = JSON.stringify(json);
			ExerciseService.changeTime(params).then(function(){
				if(type==1){
					$scope.startTimeNum = json.startDate;
				}
				$scope.dueTimeNum = json.dueDate;
				$scope.closeDialog();
			},function(msg){
                	var data = {
                        message:msg,
                        action:'reload'
                    };
                    $scope.$emit('alert',data);
			});
		}
		$scope.$on('alertEvent',function(event,data){
			if(data.action=='reload'){
				window.location.reload(true);
			}
		});
	}]);