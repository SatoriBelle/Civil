/* global artifacts */

import { approveEverything, config, inTesting } from "./utils";

const Token = artifacts.require("CVLToken");
const DLL = artifacts.require("DLL");
const AttributeStore = artifacts.require("AttributeStore");

const Parameterizer = artifacts.require("CivilParameterizer");
const PLCRVoting = artifacts.require("CivilPLCRVoting");

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer.then(async () => {
    await deployer.link(DLL, Parameterizer);
    await deployer.link(AttributeStore, Parameterizer);

    const parameterizerConfig = config.nets[network].paramDefaults;
    const tokenAddress = Token.address;

    // const estimate = web3.eth.estimateGas({ data: Parameterizer.bytecode });
    // console.log("Parameterizer gas cost estimate: " + estimate);
    await deployer.deploy(Parameterizer, tokenAddress, PLCRVoting.address, [
      parameterizerConfig.minDeposit,
      parameterizerConfig.pMinDeposit,
      parameterizerConfig.applyStageLength,
      parameterizerConfig.pApplyStageLength,
      parameterizerConfig.commitStageLength,
      parameterizerConfig.pCommitStageLength,
      parameterizerConfig.revealStageLength,
      parameterizerConfig.pRevealStageLength,
      parameterizerConfig.dispensationPct,
      parameterizerConfig.pDispensationPct,
      parameterizerConfig.voteQuorum,
      parameterizerConfig.pVoteQuorum,
      parameterizerConfig.challengeAppealLength,
      parameterizerConfig.appealChallengeCommitStageLength,
      parameterizerConfig.appealChallengeRevealStageLength,
    ]);

    if (inTesting(network)) {
      await approveEverything(accounts, Token.at(tokenAddress), Parameterizer.address);
    }
  });
};
