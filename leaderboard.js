PlayersList = new Mongo.Collection('players');

if (Meteor.isClient) {

    Meteor.subscribe('thePlayers');

    Template.leaderboard.helpers({
        'player': function() {
            var currentUserId = Meteor.userId();
            return PlayersList.find({
                createdBy: currentUserId
            }, {
                sort: {
                    score: -1,
                    name: 1
                }
            });
        },

        'selectedClass': function() {
            var playerId = this._id;
            var selectedPlayer = Session.get('selectedPlayer');
            if (playerId == selectedPlayer) {
                return "selected";
            }
        },
        'showSelectedPlayer': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            return PlayersList.findOne(selectedPlayer);
        }
    });


    Template.leaderboard.events({
        'click .player': function() {
            var playerId = this._id;
            Session.set('selectedPlayer', playerId);
        },
        'click .increment': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('modifyPlayerScore', selectedPlayer, 5);
        },
        'click .decrement': function() {
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('modifyPlayerScore', selectedPlayer, -5);
        },
        'click .remove': function() {
            var selectedPlayerId = Session.get('selectedPlayer');
            Meteor.call('removePlayerData', selectedPlayerId);
        }
    });

    Template.addPlayerForm.events({
        'submit form': function(event) {
            event.preventDefault();
            var playerNameVar = event.target.playerName.value;
            Meteor.call('insertPlayerData', playerNameVar);

            function clearform() {
                document.getElementById("playerNameVar").value = "";
            };
            clearform();
        }
    });
};



if (Meteor.isServer) {
    Meteor.publish('thePlayers',function() {
        var currentUserId = this.userId;
        return PlayersList.find({createdBy: currentUserId})
    });

    Meteor.methods({
        'insertPlayerData' : function(playerNameVar) {
            var currentUserId = Meteor.userId();
            PlayersList.insert({
                name: playerNameVar,
                score: 0,
                createdBy: currentUserId
            });
        },
        'removePlayerData': function(selectedPlayerId){
            PlayersList.remove({_id: selectedPlayerId});
        },
        'modifyPlayerScore': function(selectedPlayer, scoreValue){
            var currentUserId = Meteor.userId();
            PlayersList.update(selectedPlayer, {$inc: {score: scoreValue    } });
        }  
    });
}
