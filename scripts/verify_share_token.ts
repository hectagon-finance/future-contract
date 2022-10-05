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

const factoryAddress = ''; // Fill factory address here

async function main() {
  if (!factoryAddress) {
    console.log('Please provide factory address');
    return;
  }
  const { deployer } = await hre.getNamedAccounts();

  const TokenFactory = await hre.ethers.getContractFactory('ShareTokenFactory');
  const factory = TokenFactory.attach(factoryAddress);

  console.log(`Creating credit token...`);
  const tx2 = await factory.create(ASSET_ADDRESS, 'i', 'I', nextYear, totalSupply, {
    gasLimit,
  });
  const receipt2 = await tx2.wait();
  const event2 = receipt2?.events?.find((e) => e.event === 'Created');
  const shareAddress: string = event2?.args?.shareToken;

  console.log(`Verifying share token...`);
  try {
    const { stdout } = await execPromise(
      `npx hardhat verify ${shareAddress} --network ${
        hre.network.name
      } --contract "contracts/ShareToken.sol:ShareToken" "${ASSET_ADDRESS}" "i" "I" "${nextYear}" "${totalSupply.toString()}" "${deployer}"`,
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
