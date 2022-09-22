import hre from 'hardhat';
import { BigNumber } from 'ethers';
import dayjs from 'dayjs';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

const nextYear = BigNumber.from(dayjs().add(1, 'year').unix());

const ASSET_ADDRESS = '0x0000000000000000000000000000000000000001';
const gasLimit = BigNumber.from('3000000');

async function main() {
  const factoryAddress = '';
  if (!factoryAddress) {
    console.log('Please provide factory address');
    return;
  }
  const { deployer } = await hre.getNamedAccounts();

  const FutureTokenFactory = await hre.ethers.getContractFactory('FutureTokenFactory');
  const factory = FutureTokenFactory.attach(factoryAddress);
  console.log(`Creating future token 1...`);
  const tx1 = await factory.create(ASSET_ADDRESS, 'f1', 'F1', nextYear, {
    gasLimit,
  });
  const receipt1 = await tx1.wait();
  const event1 = receipt1?.events?.find((e) => e.event === 'Created');
  const future1Address: string = event1?.args?.futureToken;
  console.log(`Creating future token 2...`);
  const tx2 = await factory.createMintable(ASSET_ADDRESS, 'f2', 'F2', nextYear, {
    gasLimit,
  });
  const receipt2 = await tx2.wait();
  const event2 = receipt2?.events?.find((e) => e.event === 'Created');
  const future2Address: string = event2?.args?.futureToken;
  console.log(`Creating future token 3...`);
  const tx3 = await factory.createChangeable('f3', 'F3', nextYear, {
    gasLimit,
  });
  const receipt3 = await tx3.wait();
  const event3 = receipt3?.events?.find((e) => e.event === 'Created');
  const future3Address: string = event3?.args?.futureToken;

  console.log(`Verifying future 1...`);
  try {
    const { stdout } = await execPromise(
      `npx hardhat verify ${future1Address} --network ${hre.network.name} --contract "contracts/FutureToken.sol:FutureToken" "${ASSET_ADDRESS}" "f1" "F1" "${nextYear}"`,
    );
    console.log(stdout);
  } catch (e: any) {
    console.log(e.toString());
  }
  console.log(`Verifying future 2...`);
  try {
    const { stdout } = await execPromise(
      `npx hardhat verify ${future2Address} --network ${hre.network.name} --contract "contracts/FutureTokenMintable.sol:FutureTokenMintable" "${ASSET_ADDRESS}" "f2" "F2" "${nextYear}" "${deployer}"`,
    );
    console.log(stdout);
  } catch (e: any) {
    console.log(e.toString());
  }
  console.log(`Verifying future 3...`);
  try {
    const { stdout } = await execPromise(
      `npx hardhat verify ${future3Address} --network ${hre.network.name} --contract "contracts/FutureTokenChangeable.sol:FutureTokenChangeable" "f3" "F3" "${nextYear}" "${deployer}"`,
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
