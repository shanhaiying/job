
define(['app','UserService','ExerciseService','ClassService','ngProgressBar','ngDynamic'],function(app,UserService,ExerciseService,ClassService){
    'use strict';
    app.config(['$httpProvider', function($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        //alert(!!window.ActiveXObject);
        if (!!window.ActiveXObject||"ActiveXObject" in window){
            $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
            // extra
            $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
            $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
        }


    }]);
    app.controller('StudentController',['$scope','UserService','ExerciseService','ClassService',function($scope,UserService,ExerciseService,ClassService){
        $scope.userInfo = {
            subjects:[]
        };
        $scope.now = new Date();
        $scope.$on("userinfo",function(event,info){
            $scope.userInfo = info;
            UserService.getSubject().then(function(data){
                $scope.userInfo.subjects = data;
            });
            var defaultFilter={
                subjectID:-1,
                p:0,
                ps:5,
                hasMore:false,
                type:-1
            };

            ExerciseService.filterExercise(defaultFilter).then(function(exercises){
                for(var i = 0;i<exercises.length-1;i++){
                    if(!exercises[i].assignmentInfo){
                        var l = exercises.length-1;
                        exercises.splice(i,1);
                        i--;
                    }

                }

                $scope.filterExerciseState =0 ;
                //$scope.exercises.push.apply($scope.exercises,exercises);
                $scope.worktrails = exercises;
                //exercise数据进行分组处理
            });

            ClassService.getClassInfo($scope.userInfo.studentClass.classNumber).then(function(data){
                $scope.classInfo = data;

                angular.forEach($scope.classInfo.teachers,function(e){
                    e.abs = getAbs(e.subject);
                })
                $scope.classTable1 = [];
                $scope.classTable2 = [];
                angular.forEach($scope.classInfo.students,function(e,i){
                    if(i%2==0){
                        $scope.classTable1[$scope.classTable1.length] = e;
                    }else{
                        $scope.classTable2[$scope.classTable2.length] = e;
                    }
                })

            })

            $scope.isShowClassDetail = false;

        });
        var getAbs = function(abs){
            switch(abs){
                case "语文":return 'ch';break;
                case "数学":return 'math';break;
                case "英语":return 'en';break;
                case "物理":return 'phy';break;
                case "化学":return 'chemi';break;
                case "生物":return 'bio';break;
                case "地理":return 'geo';break;
                case "历史":return 'his';break;
                case "政治":return 'gov';break;
            }


        }
        //////////////////////////////////////////////////////////////////



    }]);
    //app.controller('');
});