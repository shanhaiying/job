import app from 'app';

import 'services/Toolkit';
import 'services/UserService';
import 'services/ExerciseService';
import 'services/VideoHelper';

import 'directives/ng-video';

export default app.controller('ExerciseDetailController',['$scope','Toolkit','UserService','ExerciseService','VideoHelper',function($scope,Toolkit,UserService,ExerciseService,VideoHelper){
        $scope.userInfo = {
            subjects:[]
        };
        var localStorage = window.localStorage;
        $scope.now = new Date();

        $scope.$on('userinfo',function(event,info){
        	$scope.userInfo = info;
            $scope.params = Toolkit.serializeParams();
            ExerciseService.loadExerciseDetail($scope.userInfo.uid,exerID).then(function(data){
                $scope.exercise = data;
                $scope.unwatched = 0;
                $scope.undone = 0;
                $scope.allQuestions = 0;
                if($scope.exercise[0]){
                    $scope.unwatched = $scope.exercise[0].length;
                    // for(var i=0;i<$scope.exercise[0].length;i++){
                    	// if(!$scope.exercise[0][i].isWatched){
                    		 // $scope.unwatched++;
                    	// }
                    // }
                }
                var queType = ["1","11","12","13"];
                angular.forEach(queType,function(item,index){
                  if(data[item]){
                      $scope.allQuestions += data[item].length;
                  }
                });
                // angular.forEach(data[1],function(e){
                    // if(e.answerChar==""){
                        // $scope.undone++;
                    // }
                // })
                $scope.showStyle={visibility:'visible'};
                $scope.date = date($scope.exercise.dueDate-$scope.now);
            });
        });

        function date(time){
            var minute = Math.floor((time/1000/60)%60);
            var hour = Math.floor((time/1000/60/60)%24);
            var day = Math.floor(time/1000/60/60/24);
            var date = "";
            if(day==0){
                if(hour==0){
                    date = minute+"分";
                }else{
                    date = hour+"小时"+minute+"分";
                }
            }else{
                date = day+"天"+hour+"小时"+minute+"分";
            }
            return date;
        }
        ////////////////////////////////////////
        var storage = window.localStorage;

        $scope.currentPlayVideo = null;

        function internalPlayVideo(info){
        	if(!info.isWatched){
                $scope.unwatched--;
            }
            //由于新版的数据使用的ID，之前的老数据可能没有该字段，通过externalId获取
          var vid = info.ID||info.externalId;
        	ExerciseService.markVideo($scope.params.exerID,0,vid);
            localStorage.setItem(info.externalId,parseInt(localStorage.getItem(info.externalId))+1);
            info.isWatched = true;
            $scope.currentPlayVideo = info;
            var videoUrl = info.video;
			if(angular.isUndefined(videoUrl)||videoUrl==''){
				videoUrl = info.html;
			}
            var index = VideoHelper.isSharedUrl(videoUrl);
            if(index>-1){
                //$scope.videoUrl = VideoHelper.getIFrameUrl(videoUrl,index);
				var videoParams = VideoHelper.getIFrameUrl(videoUrl,index);
				if(typeof(videoParams)=='object'){
						//获得窗口的垂直位置
			           var iTop = (window.screen.availHeight - 30 - videoParams.height) / 2;
			           //获得窗口的水平位置
			           var iLeft = (window.screen.availWidth - 10 - videoParams.width) / 2;
			           window.open(videoParams.url,'video','width='+videoParams.width+',height='+videoParams.height+',innerHeight='+videoParams.height+',innerWidth='+videoParams.width+',top='+iTop+',left='+iLeft+',toolbar=no, menubar=no, scrollbars=no, resizable=no');
			           return;
				}else{
					$scope.videoUrl = videoParams;
				}
            }else{
                $scope.videoUrl = videoUrl;
                $scope.poster=info.thumbnail;
            }
            $scope.showVideoBox = true;
        }
        var lastPlayVideoId = '';
        /**
         * 播放视频
         */
        $scope.playVideo = function(info){
            if(angular.isUndefined(info.video) || null == info.video){
            	if(lastPlayVideoId == info.externalId){
            		return;
            	}
            	lastPlayVideoId = info.externalId;
            	ExerciseService.getVideoInfo(info.externalId).then(function(videoInfo){
            		info.video = videoInfo.video;
            		info.html = videoInfo.html;
            		if(lastPlayVideoId ==videoInfo.externalId){
                		internalPlayVideo(info);
            		}
            	},function(msg){
            		lastPlayVideoId = '';
					var data = {
							message:msg
					};
					$scope.$emit('alert',data);
            	});
            }else{
            	internalPlayVideo(info);
            }

        }

        $scope.closeVideoBox = function(){
            $scope.showShareVideoBox = false;
            $scope.showVideoBox = false;
        }


        /**
		 * 播放视频失败
		 */
		$scope.playVideoError = function(video){
			$scope.closeVideoBox();
			var videoUrl = video.html;
			var index = VideoHelper.isSharedUrl(videoUrl);
			var videoParams = VideoHelper.getIFrameUrl(videoUrl,index);
			if(typeof(videoParams)=='object'){
					//获得窗口的垂直位置
		           var iTop = (window.screen.availHeight - 30 - videoParams.height) / 2;
		           //获得窗口的水平位置
		           var iLeft = (window.screen.availWidth - 10 - videoParams.width) / 2;
		           window.open(videoParams.url,'video','width='+videoParams.width+',height='+videoParams.height+',top='+iTop+',left='+iLeft+',toolbar=no, menubar=no, scrollbars=no, resizable=no');
			}
		}

        $scope.doExercise = function(){
            //var data={
            //    exerID:$scope.params[0].exerId
            //}
            //HttpClient.post('/student/answerExercise',data);
            // window.location.href = '/student/answerExercise?assignID='+$scope.exercise.aid;
            if($scope.exercise.status==1&&(!$scope.exercise.microlecture)&&($scope.exercise.completeStuCount<=0)){
      				ExerciseService.isExistExercise($scope.params.exerID).then(function(result){
      					if(result == 1){
      					  window.location.href = '/student/answerExercise?assignID='+$scope.exercise.aid;
      					}else if(result == 0){
      						var data = {
      								message:"作业不存在，请选择其他作业",
      								type: "1"
      						}
      						$scope.$emit('alert',data);
                  $scope.$on('alertEvent',function(event,data){
                    window.location.href = '/student/exercises';
                  });
      					}
      				},function(msg){
      					var data = {
      							message:msg,
      							type: "ok"
      					};
      					$scope.$emit('alert',data);
      				});
      			}else{
      				window.location.href = '/student/answerExercise?assignID='+$scope.exercise.aid;
      			}
        }
        $scope.checkExercise = function(){
            //var data={
            //    exerID:$scope.params[0].exerId
            //}
            //HttpClient.post('/student/workReport',data);
            window.location.href = '/student/workReport?assignID='+$scope.exercise.aid;

        }
    }]);
