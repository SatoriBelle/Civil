pragma solidity ^0.4.19;

import "./PLCRVoting.sol";
import "./installed_contracts/tokens/contracts/eip20/EIP20Interface.sol";
import "../zeppelin-solidity/SafeMath.sol";

contract Parameterizer {

  // ------
  // EVENTS
  // ------

  event _ReparameterizationProposal(string name, uint value, bytes32 propID, uint deposit, uint appEndDate, address indexed proposer);
  event _NewChallenge(bytes32 indexed propID, uint challengeID, uint commitEndDate, uint revealEndDate, address indexed challenger);
  event _ProposalAccepted(bytes32 indexed propID, string name, uint value);
  event _ProposalExpired(bytes32 indexed propID);
  event _ChallengeSucceeded(bytes32 indexed propID, uint indexed challengeID, uint rewardPool, uint totalTokens);
  event _ChallengeFailed(bytes32 indexed propID, uint indexed challengeID, uint rewardPool, uint totalTokens);
  event _RewardClaimed(uint indexed challengeID, uint reward, address indexed voter);


  // ------
  // DATA STRUCTURES
  // ------

  using SafeMath for uint;

  struct ParamProposal {
    uint appExpiry;
    uint challengeID;
    uint deposit;
    string name;
    address owner;
    uint processBy;
    uint value;
  }

  struct Challenge {
    uint rewardPool;        // (remaining) pool of tokens distributed amongst winning voters
    address challenger;     // owner of Challenge
    bool resolved;          // indication of if challenge is resolved
    uint stake;             // number of tokens at risk for either party during challenge
    uint winningTokens;     // (remaining) amount of tokens used for voting by the winning side
    mapping(address => bool) tokenClaims;
  }

  // ------
  // STATE
  // ------

  mapping(bytes32 => uint) public params;

  // maps challengeIDs to associated challenge data
  mapping(uint => Challenge) public challenges;

  // maps pollIDs to intended data change if poll passes
  mapping(bytes32 => ParamProposal) public proposals;

  // Global Variables
  EIP20Interface public token;
  PLCRVoting public voting;

  // ------------
  // CONSTRUCTOR
  // ------------

  /**
  @notice constructor
  @param _tokenAddr        address of the token which parameterizes this system
  @param _plcrAddr         address of a PLCR voting contract for the provided token
  @param _uintParameters    array of uint parameters
  @dev _uintParameters is passed in as an array, rather than as individual parameters
  to avoid compiler error caused by too many local variables (stack too deep)
  */
  function Parameterizer(
    address _tokenAddr,
    address _plcrAddr,
    uint[16] _uintParameters
  ) public
  {
    token = EIP20Interface(_tokenAddr);
    voting = PLCRVoting(_plcrAddr);

    set("minDeposit", _uintParameters[0]);
    set("pMinDeposit", _uintParameters[1]);
    set("applyStageLen", _uintParameters[2]);
    set("pApplyStageLen", _uintParameters[3]);
    set("commitStageLen", _uintParameters[4]);
    set("pCommitStageLen", _uintParameters[5]);
    set("revealStageLen", _uintParameters[6]);
    set("pRevealStageLen", _uintParameters[7]);
    set("dispensationPct", _uintParameters[8]);
    set("pDispensationPct", _uintParameters[9]);
    set("voteQuorum", _uintParameters[10]);
    set("pVoteQuorum", _uintParameters[11]);
    set("pProcessBy", _uintParameters[12]);
    set("challengeAppealLen", _uintParameters[13]);
    set("challengeAppealCommitLen", _uintParameters[14]);
    set("challengeAppealRevealLen", _uintParameters[15]);
  }
  // -----------------------
  // TOKEN HOLDER INTERFACE
  // -----------------------

  /**
  @notice propose a reparamaterization of the key _name's value to _value.
  @param _name the name of the proposed param to be set
  @param _value the proposed value to set the param to be set
  */
  function proposeReparameterization(string _name, uint _value) public returns (bytes32) {
    uint deposit = get("pMinDeposit");
    bytes32 propID = keccak256(_name, _value);

    if (keccak256(_name) == keccak256("dispensationPct") || keccak256(_name) == keccak256("pDispensationPct")) {
      require(_value <= 100);
    }

    require(!propExists(propID)); // Forbid duplicate proposals
    require(get(_name) != _value); // Forbid NOOP reparameterizations

    // attach name and value to pollID
    proposals[propID] = ParamProposal({
      appExpiry: now.add(get("pApplyStageLen")),
      challengeID: 0,
      deposit: deposit,
      name: _name,
      owner: msg.sender,
      processBy: now.add(get("pApplyStageLen"))
        .add(get("pCommitStageLen"))
        .add(get("pRevealStageLen"))
        .add(get("pProcessBy")),
      value: _value
    });

    require(token.transferFrom(msg.sender, this, deposit)); // escrow tokens (deposit amt)

    emit _ReparameterizationProposal(_name, _value, propID, deposit, proposals[propID].appExpiry, msg.sender);
    return propID;
  }

  /**
  @notice challenge the provided proposal ID, and put tokens at stake to do so.
  @param _propID the proposal ID to challenge
  */
  function challengeReparameterization(bytes32 _propID) public returns (uint challengeID) {
    ParamProposal memory prop = proposals[_propID];
    uint deposit = prop.deposit;

    require(propExists(_propID) && prop.challengeID == 0);

    //start poll
    uint pollID = voting.startPoll(
      get("pVoteQuorum"),
      get("pCommitStageLen"),
      get("pRevealStageLen")
    );

    challenges[pollID] = Challenge({
      challenger: msg.sender,
      rewardPool: SafeMath.sub(100, get("pDispensationPct")).mul(deposit).div(100),
      stake: deposit,
      resolved: false,
      winningTokens: 0
    });

    proposals[_propID].challengeID = pollID;       // update listing to store most recent challenge

    //take tokens from challenger
    require(token.transferFrom(msg.sender, this, deposit));

    /* solium-disable-next-line */
    var (commitEndDate, revealEndDate,) = voting.pollMap(pollID);

    emit _NewChallenge(_propID, pollID, commitEndDate, revealEndDate, msg.sender);
    return pollID;
  }

  /**
  @notice for the provided proposal ID, set it, resolve its challenge, or delete it depending on whether it can be set, has a challenge which can be resolved, or if its "process by" date has passed
  @param _propID the proposal ID to make a determination and state transition for
  */
  function processProposal(bytes32 _propID) public {
    ParamProposal storage prop = proposals[_propID];
    address propOwner = prop.owner;
    uint propDeposit = prop.deposit;


    // Before any token transfers, deleting the proposal will ensure that if reentrancy occurs the
    // prop.owner and prop.deposit will be 0, thereby preventing theft
    if (canBeSet(_propID)) {
      // There is no challenge against the proposal. The processBy date for the proposal has not
     // passed, but the proposal's appExpirty date has passed.
      set(prop.name, prop.value);
      emit _ProposalAccepted(_propID, prop.name, prop.value);
      delete proposals[_propID];
      require(token.transfer(propOwner, propDeposit));
    } else if (challengeCanBeResolved(_propID)) {
      // There is a challenge against the proposal.
      resolveChallenge(_propID);
    } else if (now > prop.processBy) {
      // There is no challenge against the proposal, but the processBy date has passed.
      emit _ProposalExpired(_propID);
      delete proposals[_propID];
      require(token.transfer(propOwner, propDeposit));
    } else {
      // There is no challenge against the proposal, and neither the appExpiry date nor the
      // processBy date has passed.
      revert();
    }

    assert(get("dispensationPct") <= 100);
    assert(get("pDispensationPct") <= 100);

    // verify that future proposal appExpiry and processBy times will not overflow
    now.add(get("pApplyStageLen"))
      .add(get("pCommitStageLen"))
      .add(get("pRevealStageLen"))
      .add(get("pProcessBy"));

    delete proposals[_propID];
  }

  /**
  @notice claim the tokens owed for the msg.sender in the provided challenge
  @param _challengeID the challenge ID to claim tokens for
  @param _salt the salt used to vote in the challenge being withdrawn for
  */
  function claimReward(uint _challengeID, uint _salt) public {
    // ensure voter has not already claimed tokens and challenge results have been processed
    require(challenges[_challengeID].tokenClaims[msg.sender] == false);
    require(challenges[_challengeID].resolved == true);

    uint voterTokens = voting.getNumPassingTokens(msg.sender, _challengeID, _salt);
    uint reward = voterReward(msg.sender, _challengeID, _salt);

    // subtract voter's information to preserve the participation ratios of other voters
    // compared to the remaining pool of rewards
    challenges[_challengeID].winningTokens -= voterTokens;
    challenges[_challengeID].rewardPool -= reward;

    // ensures a voter cannot claim tokens again
    challenges[_challengeID].tokenClaims[msg.sender] = true;

    emit _RewardClaimed(_challengeID, reward, msg.sender);
    require(token.transfer(msg.sender, reward));
  }

  // --------
  // GETTERS
  // --------

  /**
  @dev                Calculates the provided voter's token reward for the given poll.
  @param _voter       The address of the voter whose reward balance is to be returned
  @param _challengeID The ID of the challenge the voter's reward is being calculated for
  @param _salt        The salt of the voter's commit hash in the given poll
  @return             The uint indicating the voter's reward
  */
  function voterReward(address _voter, uint _challengeID, uint _salt)
  public view returns (uint)
  {
    uint winningTokens = challenges[_challengeID].winningTokens;
    uint rewardPool = challenges[_challengeID].rewardPool;
    uint voterTokens = voting.getNumPassingTokens(_voter, _challengeID, _salt);
    return (voterTokens * rewardPool) / winningTokens;
  }

  /**
  @notice Determines whether a proposal passed its application stage without a challenge
  @param _propID The proposal ID for which to determine whether its application stage passed without a challenge
  */
  function canBeSet(bytes32 _propID) view public returns (bool) {
    ParamProposal memory prop = proposals[_propID];

    return (now > prop.appExpiry && now < prop.processBy && prop.challengeID == 0);
  }

  /**
  @notice Determines whether a proposal exists for the provided proposal ID
  @param _propID The proposal ID whose existance is to be determined
  */
  function propExists(bytes32 _propID) view public returns (bool) {
    return proposals[_propID].processBy > 0;
  }

  /**
  @notice Determines whether the provided proposal ID has a challenge which can be resolved
  @param _propID The proposal ID whose challenge to inspect
  */
  function challengeCanBeResolved(bytes32 _propID) view public returns (bool) {
    ParamProposal memory prop = proposals[_propID];
    Challenge memory challenge = challenges[prop.challengeID];

    return (prop.challengeID > 0 && challenge.resolved == false && voting.pollEnded(prop.challengeID));
  }

  /**
  @notice Determines the number of tokens to awarded to the winning party in a challenge
  @param _challengeID The challengeID to determine a reward for
  */
  function challengeWinnerReward(uint _challengeID) public view returns (uint) {
    if (voting.getTotalNumberOfTokensForWinningOption(_challengeID) == 0) {
      // Edge case, nobody voted, give all tokens to the challenger.
      return 2 * challenges[_challengeID].stake;
    }

    return (2 * challenges[_challengeID].stake) - challenges[_challengeID].rewardPool;
  }

  /**
  @notice gets the parameter keyed by the provided name value from the params mapping
  @param _name the key whose value is to be determined
  */
  function get(string _name) public view returns (uint value) {
    return params[keccak256(_name)];
  }

  /**
  @dev                Getter for Challenge tokenClaims mappings
  @param _challengeID The challengeID to query
  @param _voter       The voter whose claim status to query for the provided challengeID
  */
  function tokenClaims(uint _challengeID, address _voter) public view returns (bool) {
    return challenges[_challengeID].tokenClaims[_voter];
  }

  // ----------------
  // PRIVATE FUNCTIONS
  // ----------------

  /**
  @dev resolves a challenge for the provided _propID. It must be checked in advance whether the _propID has a challenge on it
  @param _propID the proposal ID whose challenge is to be resolved.
  */
  function resolveChallenge(bytes32 _propID) private {
    ParamProposal memory prop = proposals[_propID];
    Challenge storage challenge = challenges[prop.challengeID];

    // winner gets back their full staked deposit, and dispensationPct*loser's stake
    uint reward = challengeWinnerReward(prop.challengeID);

    challenge.winningTokens = voting.getTotalNumberOfTokensForWinningOption(prop.challengeID);
    challenge.resolved = true;

    if (voting.isPassed(prop.challengeID)) { // The challenge failed
      if (prop.processBy > now) {
        set(prop.name, prop.value);
      }
      emit _ChallengeFailed(_propID, prop.challengeID, challenge.rewardPool, challenge.winningTokens);
      require(token.transfer(prop.owner, reward));
    } else { // The challenge succeeded or nobody voted
      emit _ChallengeSucceeded(_propID, prop.challengeID, challenge.rewardPool, challenge.winningTokens);
      require(token.transfer(challenges[prop.challengeID].challenger, reward));
    }
  }

  /**
  @dev sets the param keted by the provided name to the provided value
  @param _name the name of the param to be set
  @param _value the value to set the param to be set
  */
  function set(string _name, uint _value) private {
    params[keccak256(_name)] = _value;
  }
}
