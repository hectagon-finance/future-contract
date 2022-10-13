import { ethers, network } from 'hardhat';
import { BigNumber } from 'ethers';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);
const totalSupply = BigNumber.from(10).pow(18);

const ASSET_ADDRESS = '0x0000000000000000000000000000000000000001';
const gasLimit = BigNumber.from('3000000');
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account: ', deployer.address);

  const ShareTokenFactory = await ethers.getContractFactory('ShareTokenFactory');
  const factory = await ShareTokenFactory.deploy();
  console.log('ShareTokenFactory:', factory.address);

  console.log(`Verifying share token factory...`);
  try {
    const cmd = `npx hardhat verify ${factory.address} --network ${network.name} --contract "contracts/ShareTokenFactory.sol:ShareTokenFactory"`;
    console.log(cmd);
    const { stdout } = await execPromise(cmd);
    console.log(stdout);
  } catch (e: any) {
    console.error(e.toString());
  }

  console.log(`Creating share token...`);
  const tx = await factory.create(ASSET_ADDRESS, 'i', 'I', totalSupply, {
    gasLimit,
  });
  const receipt2 = await tx.wait();
  const event2 = receipt2?.events?.find((e) => e.event === 'Created');
  const shareAddress: string = event2?.args?.shareToken;

  console.log(`Verifying share token...`);
  try {
    const cmd = `npx hardhat verify ${shareAddress} --network ${
      network.name
    } --contract "contracts/ShareToken.sol:ShareToken" "${ASSET_ADDRESS}" "i" "I" "${totalSupply.toString()}" "${
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
