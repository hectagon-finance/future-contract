import hre from 'hardhat';
import { BigNumber } from 'ethers';
import dayjs from 'dayjs';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

const nextYear = BigNumber.from(dayjs().add(1, 'year').unix());
const totalSupply = BigNumber.from(10).pow(18);

const ASSET_ADDRESS = '0x0000000000000000000000000000000000000001';
const gasLimit = BigNumber.from('3000000');

async function main() {
  const factoryAddress = '';
  if (!factoryAddress) {
    console.log('Please provide factory address');
    return;
  }
  const { deployer } = await hre.getNamedAccounts();

  const TokenFactory = await hre.ethers.getContractFactory('TokenFactory');
  const factory = TokenFactory.attach(factoryAddress);
  console.log(`Creating future token...`);
  const tx1 = await factory.createFutureToken(ASSET_ADDRESS, 'f', 'F', nextYear, {
    gasLimit,
  });
  const receipt1 = await tx1.wait();
  const event1 = receipt1?.events?.find((e) => e.event === 'CreatedFutureToken');
  const futureAddress: string = event1?.args?.futureToken;

  console.log(`Creating credit token...`);
  const tx2 = await factory.createCreditToken(ASSET_ADDRESS, 'c', 'C', nextYear, totalSupply, {
    gasLimit,
  });
  const receipt2 = await tx2.wait();
  const event2 = receipt2?.events?.find((e) => e.event === 'CreatedCreditToken');
  const creditAddress: string = event2?.args?.creditToken;

  console.log(`Verifying future token...`);
  try {
    const { stdout } = await execPromise(
      `npx hardhat verify ${futureAddress} --network ${hre.network.name} --contract "contracts/FutureToken.sol:FutureToken" "${ASSET_ADDRESS}" "f" "F" "${nextYear}"`,
    );
    console.log(stdout);
  } catch (e: any) {
    console.log(e.toString());
  }
  console.log(`Verifying credit token...`);
  try {
    const { stdout } = await execPromise(
      `npx hardhat verify ${creditAddress} --network ${
        hre.network.name
      } --contract "contracts/CreditToken.sol:CreditToken" "${ASSET_ADDRESS}" "c" "C" "${nextYear}" "${totalSupply.toString()}" "${deployer}"`,
    );
    console.log(stdout);
  } catch (e: any) {
    console.log(e.toString());
  }
  console.log('Completed');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
