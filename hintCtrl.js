angular.module('ngHintUI')
  .controller('HintCtrl', ['$scope', '$timeout', 'hintService',
    function($scope, $timeout, hintService) {
      hintService.setHintFunction(function(msg) {
        $scope.messageData = $scope.messageData || {};
        var result = msg.split('##'); //[modName, message, messageType]
        if(!$scope.messageData[result[0]]) {
          $scope.messageData[result[0]] = {
            'Error Messages': [],
            'Warning Messages': [],
            'Suggestion Messages': []
          };
        }
        $scope.messageData[result[0]][result[2]].push(result[1]);
        debounceUpdateAll();
      });

      $scope.module, $scope.type, $scope.suppressedMessages = {}, $scope.suppressedMessagesLength = 0;
      var currentPromises;
      //message data will be an array sent from hint log to batarang to here
      $scope.labels = ['All Messages', 'Error Messages', 'Warning Messages', 'Suggestion Messages'];

      function updateAll(){
        var all = {
          'All Messages': [],
          'Error Messages': [],
          'Warning Messages': [],
          'Suggestion Messages': []
        };
        for(var id in $scope.messageData) {
          $scope.messageData[id]['All Messages'] = [];
          for(var type in $scope.messageData[id]) {
            $scope.messageData[id][type].forEach(function(message) {
              if(type !== 'All Messages'){
                all['All Messages'].push({message: message, type: type, module: id});
                all[type].push(message);
                $scope.messageData[id]['All Messages'].push({message: message, type: type});
              }
            });
          }
        }
        $scope.messageData['All'] = all;
        $scope.$apply();
      }

      function debounceUpdateAll(){
        $timeout.cancel(currentPromises);
        currentPromises = $timeout(function() {
          updateAll()
        }.bind(this),1000)
      }

      $scope.isSuppressed = function(message) {
        message = message.split(' ').slice(6,9).join('');
        return message in $scope.suppressedMessages;
      };

      $scope.suppressMessage = function(message) {
        $scope.suppressedMessagesLength++;
        var key = message.split(' ').slice(6,9).join('');
        var secondSpace = message.indexOf(' ', message.indexOf(' '));
        var endInd = 60;
        while(message.charAt(endInd) !== ' ') {
          endInd++;
        }
        $scope.suppressedMessages[key] = '...'+message.substring(secondSpace,endInd)+'...';
      };

      $scope.unsuppressMessage = function(message) {
        $scope.suppressedMessagesLength--;
        delete $scope.suppressedMessages[message];
      }

      $scope.setModule = function(module) {
        $scope.module = module;
      };

      $scope.setType = function(type) {
        $scope.type = type;
      };

      $scope.setModule('All');
      $scope.setType('All Messages');

  }]);