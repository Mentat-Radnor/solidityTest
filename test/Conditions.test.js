const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Conditions', () => {
  let owner;
  let other_addr;
  let conditions;
  let contractAdress;

  beforeEach(async () => {
    [owner, other_addr] = await ethers.getSigners();
    
    const ConditionsContract = await ethers.getContractFactory('Conditions', owner);
    conditions = await ConditionsContract.deploy();
    conditions = await conditions.waitForDeployment(); 
    contractAdress = await conditions.getAddress();
  })

  const sendMoney = async (sender, amount = 1) => {
    const txData = {
      from: sender.address,
      to: contractAdress,
      value: amount.toString(),
    }
    console.log(txData);
    const tx = await sender.sendTransaction(txData);
    await tx.wait();
    return [tx, amount];
  }

  it('should allow to send money', async () => {
    const [sendMoneyTx, amount] = await sendMoney(other_addr, 12);
    console.log(sendMoneyTx);
  })
})