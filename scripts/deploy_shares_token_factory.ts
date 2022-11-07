import { ethers, network } from 'hardhat';
import { BigNumber } from 'ethers';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);
const totalSupply = BigNumber.from(10).pow(18);

const gasLimit = BigNumber.from('3000000');
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account: ', deployer.address);

  const SharesTokenFactory = await ethers.getContractFactory('SharesTokenFactory');
  const factory = await SharesTokenFactory.deploy();
  console.log('SharesTokenFactory:', factory.address);

  console.log(`Verifying shares token factory...`);
  try {
    const cmd = `npx hardhat verify ${factory.address} --network ${network.name} --contract "contracts/SharesTokenFactory.sol:SharesTokenFactory"`;
    console.log(cmd);
    const { stdout } = await execPromise(cmd);
    console.log(stdout);
  } catch (e: any) {
    console.error(e.toString());
  }

  console.log(`Creating shares token...`);
  const tx = await factory.create('s', 'S', totalSupply, {
    gasLimit,
  });
  const receipt2 = await tx.wait();
  const event2 = receipt2?.events?.find((e) => e.event === 'Created');
  const sharesAddress: string = event2?.args?.sharesToken;

  console.log(`Verifying shares token...`);
  try {
    const cmd = `npx hardhat verify ${sharesAddress} --network ${
      network.name
    } --contract "contracts/SharesToken.sol:SharesToken" "s" "S" "${totalSupply.toString()}" "${
      deployer.address
    }"`;
    console.log(cmd);
    const { stdout } = await execPromise(cmd);
    console.log(stdout);
  } catch (e: any) {
    console.error(e.toString());
  }
  console.log('Completed');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
